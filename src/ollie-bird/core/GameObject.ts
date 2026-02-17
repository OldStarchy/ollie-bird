import { Subject } from 'rxjs';
import z from 'zod';
import onChange from '../../react-interop/onChange';
import { ReactInterop } from '../../react-interop/ReactInterop';
import { TAG_LEVEL_STRUCTURE } from '../const';
import type IGame from './IGame';
import type IModular from './IModular';
import Module from './Module';
import ModuleCollection from './ModuleCollection';
import Transform2d, { transform2dDtoSchema } from './modules/Transform2d';
import { Err, Ok, Result } from './monad/Result';
import {
	typedDtoSchema,
	type PartialDeserializer,
	type Serializable,
} from './Serializer';

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

export default class GameObject
	implements IModular, Disposable, ReactInterop<GameObjectView>, Serializable
{
	declare ['constructor']: Pick<typeof GameObject, keyof typeof GameObject>;

	static readonly defaultName: string = 'Game Object';

	protected disposableStack = new DisposableStack();
	private modules: ModuleCollection;
	#initialized = false;
	get initialized() {
		return this.#initialized;
	}

	@onChange((self) => self.notify())
	accessor layer: number = 0;
	@onChange((self) => self.notify())
	accessor tags: Set<string> = new Set();
	@onChange((self) => self.notify())
	accessor name: string;

	readonly transform: Transform2d;
	readonly id: string = Math.random().toString(16).slice(2);

	#change$ = new Subject<void>();
	readonly change$ = this.#change$.asObservable();

	private notify(): void {
		this.#change$.next();
	}

	constructor(readonly game: IGame) {
		this.name = this.constructor.defaultName;
		this.modules = new ModuleCollection(this);
		this.disposableStack.use(this.modules);

		this.transform = this.addModule(Transform2d);
		this.transform.transient = true;
	}

	getModulesByType<T extends Module>(
		type: abstract new (owner: GameObject) => T,
	): IteratorObject<T> {
		return this.modules.getModulesByType(type);
	}
	getModule<T extends Module>(
		type: abstract new (owner: GameObject) => T,
	): T | null {
		return this.modules.getModule(type);
	}
	addModule<
		Constructor extends new (owner: GameObject, ...args: any[]) => Module,
	>(
		type: Constructor,
		...args: Tail<ConstructorParameters<Constructor>>
	): InstanceType<Constructor> {
		return this.modules.addModule(type, ...args);
	}
	removeModule(module: Module): void {
		return this.modules.removeModule(module);
	}

	// @ts-expect-error
	private doInitialize() {
		if (this.#initialized) return;

		this.initialize();
		this.modules['initialize']();
		this.#initialized = true;
	}
	protected initialize(): void {}

	// @ts-expect-error
	private doBeforeUpdate(): void {
		this.beforeUpdate();
		this.modules['beforeUpdate']();
	}
	protected beforeUpdate(): void {}

	// @ts-expect-error
	private doUpdate(): void {
		this.update();
		this.modules['update']();
	}
	protected update(): void {}

	// @ts-expect-error
	private doAfterUpdate(): void {
		this.afterUpdate();
		this.modules['afterUpdate']();
	}
	protected afterUpdate(): void {}

	// @ts-expect-error
	private doBeforeRender(context: CanvasRenderingContext2D): void {
		this.beforeRender(context);
		this.modules['beforeRender'](context);
	}
	protected beforeRender(_context: CanvasRenderingContext2D): void {}

	// @ts-expect-error
	private doRender(context: CanvasRenderingContext2D): void {
		this.render(context);
		this.modules['render'](context);
	}
	protected render(_context: CanvasRenderingContext2D): void {}

	// @ts-expect-error
	private doAfterRender(context: CanvasRenderingContext2D): void {
		this.afterRender(context);
		this.modules['afterRender'](context);
	}
	protected afterRender(_context: CanvasRenderingContext2D): void {}

	// @ts-expect-error
	private doBeforeRenderGizmos(context: CanvasRenderingContext2D): void {
		this.beforeRenderGizmos(context);
		this.modules['beforeRenderGizmos'](context);
	}
	protected beforeRenderGizmos(_context: CanvasRenderingContext2D): void {}

	// @ts-expect-error
	private doRenderGizmos(context: CanvasRenderingContext2D): void {
		this.renderGizmos(context);
		this.modules['renderGizmos'](context);
	}
	protected renderGizmos(_context: CanvasRenderingContext2D): void {}

	// @ts-expect-error
	private doAfterRenderGizmos(context: CanvasRenderingContext2D): void {
		this.afterRenderGizmos(context);
		this.modules['afterRenderGizmos'](context);
	}
	protected afterRenderGizmos(_context: CanvasRenderingContext2D): void {}

	readonly #destroy$ = new Subject<void>();
	readonly destroy$ = this.#destroy$.asObservable();
	[Symbol.dispose]() {
		this.#destroy$.next();
		this.disposableStack.dispose();
	}

	destroy() {
		this.game.destroy(this);
	}

	[ReactInterop.get](): GameObjectView {
		return {
			name: this.name,
			tags: Array.from(this.tags),
			layer: this.layer,
			modules: [],
			// this.modules
			// 	.getModules()
			// 	.map((module) => module[ReactInterop.get]()),
		};
	}

	serialize(): GameObjectDto {
		return {
			version: 1,
			name: this.name,
			tags: this.tags.values().toArray(),
			layer: this.layer,
			transform: this.transform.serialize(),
			modules: this.modules
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

		const gameObject = context.game.spawn(GameObject);

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

// @ts-expect-error
type _typeCheck = AssertTrue<
	typeof GameObject extends PartialDeserializer<GameObject, { game: IGame }>
		? true
		: false
>;
