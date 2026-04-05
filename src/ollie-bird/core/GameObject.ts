import { Subject } from 'rxjs';
import z from 'zod';
import onChange from '../../react-interop/onChange';
import { ReactInterop } from '../../react-interop/ReactInterop';
import { TAG_LEVEL_STRUCTURE } from '../const';
import type _BaseGame from './BaseGame';
import type IGame from './IGame';
import type IModular from './IModular';
import Module from './Module';
import ModuleCollection from './ModuleCollection';
import Transform2d, { transform2dDtoSchema } from './modules/Transform2d';
import { Err, Ok, Result } from './monad/Result';
import { typedDtoSchema, type Serializable } from './Serializer';

export const gameObjectSchema = z.object({
	name: z.string().meta({ title: 'Name' }),
	tags: z.string().default('tag').array().meta({ title: 'Tags' }),
	layer: z.coerce.number().meta({ title: 'Layer' }),
	modules: z
		.object({ ...typedDtoSchema.shape, enabled: z.boolean() })
		.array()
		.meta({ title: 'Modules' }),
});

export type GameObjectView = z.infer<typeof gameObjectSchema>;

export const gameObjectDtoSchemaV1 = z.object({
	version: z.literal(1),
	name: z.string().optional(),
	tags: z.string().array().optional(),
	layer: z.number().optional(),
	transform: transform2dDtoSchema.optional(),
	modules: z
		.object({ ...typedDtoSchema.shape, enabled: z.boolean().default(true) })
		.array()
		.optional(),
});

export type GameObjectDto = z.input<typeof gameObjectDtoSchemaV1>;

/**
 * A GameObject is basically a glorified collection of {@link Module | Modules}.
 */
export default class GameObject
	implements IModular, Disposable, ReactInterop<GameObjectView>, Serializable
{
	// TypeScript workaround for type-checking static members for the
	// serializer.
	declare ['constructor']: Pick<typeof GameObject, keyof typeof GameObject>;

	readonly #disposableStack = new DisposableStack();
	readonly #modules: ModuleCollection;

	#initialized = false;
	get initialized() {
		return this.#initialized;
	}

	/**
	 * The layer of this object. Objects with higher layers are rendered on top
	 * of objects with lower layers.
	 *
	 * Since the usefulness of layers is defined by being relative to (higher or
	 * lower) other objects, a good practice is to create a set of named layers
	 * in one place where the order is clear.
	 *
	 * This is a good use for TypeScript's enums. They define a set of ordered
	 * values in a concise way. The actual numeric values do not matter and are
	 * implicit.
	 *
	 * For example:
	 * ```ts
	 * export default enum Layer {
	 *   Background,
	 *   Terrain,
	 *   Entities,
	 *   Player,
	 *   Foreground,
	 * }
	 *
	 * // Will render above Entities but behind Foreground
	 * playerObj.layer = Layer.Player;
	 * ```
	 */
	@onChange((self) => self.notify())
	accessor layer: number = 0;

	/**
	 * Tags are just strings that categorize objects in whatever way you find
	 * useful.
	 *
	 * Similar to layers, its useful to define a set of tags in one place, and
	 * assign meaning to those tags.
	 *
	 * For example:
	 * ```ts
	 * /// Touching an object with this tag will kill the player
	 * export const TAG_DEADLY = 'deadly';
	 *
	 * /// Objects with this tag will not be saved when saving the game.
	 * export const TAG_TEMPORARY = 'temporary';
	 * ```
	 *
	 * (note that triple-slash comments are used in the example because nested
	 * doc-comments are invalid)
	 */
	@onChange((self) => self.notify())
	accessor tags: Set<string> = new Set();

	/**
	 * A nice name for this object. Useful for debugging and editor purposes.
	 */
	@onChange((self) => self.notify())
	accessor name: string;

	/**
	 * Represents the position~~, rotation and scale of this object~~.
	 *
	 * Rotation and scale are not yet implemented.
	 *
	 * Every GameObject has a Transform2d by default, and it cannot be removed.
	 */
	readonly transform: Transform2d;

	/**
	 * An immutable identifier for this object.
	 *
	 * Not saved when serializing.
	 *
	 * Currently only used by the react based editor to track object identities
	 * across updates.
	 */
	readonly id: string = Math.random().toString(16).slice(2);

	#change$ = new Subject<void>();

	/**
	 * Indicates a change to one of this objects inspectable properties (name,
	 * tags, layer). Used to trigger updates in the editor.
	 *
	 * This observable completes when this object is destroyed.
	 */
	readonly change$ = this.#change$.asObservable();

	private notify(): void {
		this.#change$.next();
	}

	/**
	 * Do not use this directly, instead use {@link _BaseGame.spawn|BaseGame.spawn} or
	 * {@link _BaseGame.spawnPrefab|BaseGame.spawnPrefab}.
	 *
	 * @internal
	 */
	constructor(readonly game: IGame) {
		this.name = `Game Object`;
		this.#modules = new ModuleCollection(this);
		this.#disposableStack.use(this.#modules);

		this.transform = this.addModule(Transform2d);
		this.transform.transient = true;
	}

	/**
	 * @inheritdoc
	 */
	getModulesByType<T extends Module>(
		type: abstract new (owner: GameObject, ...args: any[]) => T,
	): IteratorObject<T> {
		return this.#modules.getModulesByType(type);
	}

	/**
	 * @inheritdoc
	 */
	getModule<T extends Module>(
		type: abstract new (owner: GameObject, ...args: any[]) => T,
	): T | null {
		return this.#modules.getModule(type);
	}

	/**
	 * @inheritdoc
	 */
	addModule<
		Constructor extends new (owner: GameObject, ...args: any[]) => Module,
	>(
		type: Constructor,
		...args: Tail<ConstructorParameters<Constructor>>
	): InstanceType<Constructor> {
		return this.#modules.addModule(type, ...args);
	}

	/**
	 * @inheritdoc
	 */
	removeModule(module: Module): void {
		return this.#modules.removeModule(module);
	}

	/**
	 * @internal
	 */
	initialize() {
		if (this.#initialized) return;

		this.#modules.initialize();
		this.#initialized = true;
	}

	/**
	 * @internal
	 */
	beforeUpdate(): void {
		this.#modules.beforeUpdate();
	}

	/**
	 * @internal
	 */
	update(): void {
		this.#modules.update();
	}

	/**
	 * @internal
	 */
	afterUpdate(): void {
		this.#modules.afterUpdate();
	}

	/**
	 * @internal
	 */
	beforeRender(context: CanvasRenderingContext2D): void {
		this.#modules.beforeRender(context);
	}

	/**
	 * @internal
	 */
	render(context: CanvasRenderingContext2D): void {
		this.#modules.render(context);
	}

	/**
	 * @internal
	 */
	afterRender(context: CanvasRenderingContext2D): void {
		this.#modules.afterRender(context);
	}

	/**
	 * @internal
	 */
	beforeRenderGizmos(context: CanvasRenderingContext2D): void {
		this.#modules.beforeRenderGizmos(context);
	}

	/**
	 * @internal
	 */
	renderGizmos(context: CanvasRenderingContext2D): void {
		this.#modules.renderGizmos(context);
	}

	/**
	 * @internal
	 */
	afterRenderGizmos(context: CanvasRenderingContext2D): void {
		this.#modules.afterRenderGizmos(context);
	}

	[Symbol.dispose]() {
		this.#change$.complete();
		this.#disposableStack.dispose();
	}

	/**
	 * Schedules this object for destruction using {@link BaseGame.destroy}.
	 */
	destroy() {
		this.game.destroy(this);
	}

	[ReactInterop.get](): GameObjectView {
		return {
			name: this.name,
			tags: Array.from(this.tags),
			layer: this.layer,
			modules: [],
		};
	}

	/**
	 * Converts this object into a plain data object that can be serialized.
	 *
	 * All properties (except {@link id}) and all non-{@link Module.transient|transient} modules are
	 * serialized.
	 *
	 * The object returned by this is suitable for use as a prefab. Therefore,
	 * objects can be cloned with `this.game.spawnPrefab(obj.serialize())`.
	 */
	serialize(): GameObjectDto {
		return {
			version: 1,
			name: this.name,
			tags: this.tags.values().toArray(),
			layer: this.layer,
			transform: this.transform.serialize(),
			modules: this.#modules
				.getModules()
				.filter((module) => module !== this.transform)
				.filter((module) => !module.transient)
				.map((m) => ({
					...Module.serializer.serialize(m),
					enabled: m.enabled,
				})),
		};
	}

	[ReactInterop.set](view: GameObjectView): void {
		if (Object.hasOwn(view, 'name')) this.name = view.name;

		if (Object.hasOwn(view, 'tags')) {
			// TODO(#58): this makes sure objects that need to be removed when clearing the level
			// are actually removed.
			const wasLevelStructure = this.tags.has(TAG_LEVEL_STRUCTURE);
			const newTags = new Set(view.tags);

			if (wasLevelStructure) newTags.add(TAG_LEVEL_STRUCTURE);
			else newTags.delete(TAG_LEVEL_STRUCTURE);

			this.tags = newTags;
		}

		if (Object.hasOwn(view, 'layer')) this.layer = view.layer;

		this.notify();
	}

	/**
	 * The implementation behind {@link BaseGame.spawnPrefab}.
	 *
	 * @internal
	 */
	static deserializePartial(
		obj: unknown,
		context: { game: IGame },
	): Result<GameObject, { result?: GameObject; errors: string[] }> {
		const parseResult = gameObjectDtoSchemaV1.safeParse(obj);

		if (!parseResult.success) {
			return Err({
				errors: [
					`Invalid GameObject data: ${z.prettifyError(parseResult.error)}`,
				],
			});
		}

		const parsed = parseResult.data;
		if (parsed.version !== 1) {
			return Err({
				errors: [`Unsupported GameObject version: ${parsed.version}`],
			});
		}

		const gameObject = context.game.spawn();

		if (parsed.name !== undefined) gameObject.name = parsed.name;
		if (parsed.tags !== undefined) gameObject.tags = new Set(parsed.tags);
		if (parsed.layer !== undefined) gameObject.layer = parsed.layer;

		const errors: string[] = [];

		if (parsed.transform !== undefined)
			Transform2d.deserialize(parsed.transform, {
				gameObject,
			})
				.context('Should not occur, transform already validated by zod')
				.unwrap();

		if (parsed.modules !== undefined)
			for (const moduleDto of parsed.modules) {
				const moduleResult = Module.serializer.deserialize(moduleDto, {
					gameObject,
				});

				moduleResult
					.inspect((module) => {
						module.enabled = moduleDto.enabled;
					})
					.inspectErr((err) => {
						errors.push(err);
					});
			}

		if (errors.length > 0) {
			return Err({
				errors,
				result: gameObject,
			});
		}

		return Ok(gameObject);
	}

	readonly [ReactInterop.schema] = gameObjectSchema;
	readonly [ReactInterop.asObservable] = this.change$;
}
