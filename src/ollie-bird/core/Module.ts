// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { GameCanvas } from './BaseGame';
import type GameObject from './GameObject';
import type IGame from './IGame';
import type IModular from './IModular';
import type Transform2d from './modules/Transform2d';
import { Err, Ok, type Result } from './monad/Result';
import type { Serializable } from './Serializer';
import Serializer from './Serializer';

/**
 * Extend this class to provide functionality to {@link GameObject}s.
 *
 * They can process inputs, update state, and render.
 * Modules can also be added and removed on the fly to provide dynamic behavior.
 *
 * The primary way to interact with other objects is through this.{@link game}.
 *
 * Modules share a similar lifecycle and update cycle to GameObjects.
 *
 * 1. constructor()
 *   1. constructor() for sub-modules (created in the constructor)
 *   2. initialize() for sub-modules
 * 2. initialize()
 *
 * Each tick, for `.enabled = true` modules
 * 1. beforeUpdate()
 * 2. update()
 * 3. afterUpdate()
 * 4. beforeRender()
 * 5. render()
 * 6. afterRender()
 * 7. beforeRenderGizmos()
 * 8. renderGizmos()
 * 9. afterRenderGizmos()
 *
 * If `.enabled` becomes false at any stage, the effect is immediate and the
 * module will skip the following stages. (this might change if it causes
 * issues)
 */
export default abstract class Module
	implements Disposable, IModular, Serializable
{
	declare ['constructor']: Pick<typeof Module, keyof typeof Module>;

	static readonly displayName: string = 'Module';

	get transform(): Transform2d {
		return this.owner.transform;
	}

	get game(): IGame {
		return this.owner.game;
	}

	/**
	 * If true, this will not be serialized/saved. Used for modules created by other modules.
	 */
	transient = false;

	constructor(readonly owner: GameObject) {}

	#enabled = true;
	/**
	 * If this is false, this module will not have its update or render methods
	 * called.
	 *
	 * Changes to this value take effect immediately. For example, if you set
	 * `enabled = false` in {@link beforeUpdate}, the {@link update} (and
	 * following methods) will not be called.
	 */
	get enabled() {
		return this.#enabled;
	}
	set enabled(value: boolean) {
		this.#enabled = value;
	}

	protected disposableStack = new DisposableStack();
	[Symbol.dispose](): void {
		this.disposableStack.dispose();
	}

	/**
	 * {@link addModule} will call this method after attaching this module to
	 * the {@link GameObject}.
	 *
	 * This method is called after the constructor, and after all sub-modules
	 * created in the constructor have been initialized. This way, all
	 * sub-modules added in the constructor are guaranteed to be ready to use by
	 * the time this method is called.
	 *
	 * For new GameObjects (those created this tick), this method is not called
	 * until the end of the current tick, when the object is added to the object
	 * list.
	 * For existing GameObjects, this method is called immediately after the
	 * module is added to the GameObject.
	 *
	 * Example:
	 *
	 * ```ts
	 * class MyModule extends Module {
	 *   constructor(owner: GameObject) {
	 *     super(owner);
	 *     console.log('MyModule constructor');
	 *     this.addModule(SubModule); // Logs "SubModule constructor"
	 *   }
	 *
	 *   protected override initialize() {
	 *     console.log('MyModule initialize');
	 *   }
	 * }
	 *
	 * class SubModule extends Module {
	 *   constructor(owner: GameObject) {
	 *     super(owner);
	 *     console.log('SubModule constructor');
	 *   }
	 *
	 *   protected override initialize() {
	 *     console.log('SubModule initialize');
	 *   }
	 * }
	 *
	 * const gameObject = game.spawn();
	 * gameObject.addModule(MyModule);
	 *
	 * // Logs
	 * // "MyModule constructor"
	 * // "SubModule constructor"
	 * // "SubModule initialize"
	 * // "MyModule initialize"
	 * ```
	 */
	protected initialize(): void {}

	/**
	 * Called once per frame just before {@link update}.
	 */
	protected beforeUpdate(): void {}

	/**
	 * Called once per frame. Use {@link IGame.secondsPerFrame} to get the
	 * target time since the last call to update (based on the accuracy of
	 * setTimeout).
	 */
	protected update(): void {}

	/**
	 * Called once per frame just after {@link update}
	 */
	protected afterUpdate(): void {}

	/**
	 * Called once per frame per {@link GameCanvas} just before {@link render}.
	 */
	protected beforeRender(_context: CanvasRenderingContext2D): void {}
	/**
	 * Called once per frame per {@link GameCanvas}. Use the provided context to
	 * render to the canvas.
	 */
	protected render(_context: CanvasRenderingContext2D): void {}
	/**
	 * Called once per frame per {@link GameCanvas} just after {@link render}.
	 */
	protected afterRender(_context: CanvasRenderingContext2D): void {}

	/**
	 * Called once per frame per {@link GameCanvas} just before {@link renderGizmos}.
	 */
	protected beforeRenderGizmos(_context: CanvasRenderingContext2D): void {}

	/**
	 * Called once per frame per {@link GameCanvas}. Use the provided context to
	 * render gizmos (eg. collider shapes).
	 *
	 * This is called after {@link render} so it's a good place to render debug
	 * visuals.
	 */
	protected renderGizmos(_context: CanvasRenderingContext2D): void {}

	/**
	 * Called once per frame per {@link GameCanvas} just after {@link renderGizmos}.
	 */
	protected afterRenderGizmos(_context: CanvasRenderingContext2D): void {}

	/**
	 * @inheritdoc
	 */
	getModulesByType<T extends Module>(
		type: abstract new (owner: GameObject, ...args: any[]) => T,
	): Iterable<T> {
		return this.owner.getModulesByType(type);
	}

	/**
	 * @inheritdoc
	 */
	getModule<T extends Module>(
		type: abstract new (owner: GameObject, ...args: any[]) => T,
	): T | null {
		return this.owner.getModule(type);
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
		return this.owner.addModule(type, ...args);
	}

	/**
	 * This is a convenience method for {@link addModule} that also marks the
	 * added module as {@link transient} = true.
	 */
	addTransientModule<
		Constructor extends new (owner: GameObject, ...args: any[]) => Module,
	>(
		type: Constructor,
		...args: Tail<ConstructorParameters<Constructor>>
	): InstanceType<Constructor> {
		const module = this.owner.addModule(type, ...args);
		module.transient = true;
		this.disposableStack.use(module);
		return module;
	}

	/**
	 * @inheritdoc
	 */
	removeModule(module: Module): void {
		return this.owner.removeModule(module);
	}

	/**
	 * Convert this object into a plain JavaScript object that can be further
	 * serialized to JSON.
	 *
	 * The resulting object must be deserializable by the corresponding
	 * deserializer for this module type.
	 *
	 * For modules, the deserializer should be registered with
	 * {@link Module.serializer}.{@link Serializer.registerSerializationType | registerSerializationType}.
	 * This should be done in a static block for the module subclass. For example,
	 *
	 * ```ts
	 * class MyModule extends Module {
	 *   static {
	 *     Module.serializer.registerSerializationType('MyModule', this);
	 *   }
	 *
	 *   foo: string;
	 *
	 *   serialize() {
	 *     return {
	 *       foo: this.foo,
	 *     };
	 *   }
	 *
	 *   static deserialize(obj: unknown, context: { gameObject: GameObject }): Result<MyModule, string> {
	 *     if (!('foo' in obj) || typeof obj.foo !== 'string') {
	 *       return Err('Invalid MyModule data');
	 *     }
	 *
	 *     const module = context.gameObject.addModule(MyModule);
	 *     module.foo = obj.foo;
	 *     return Ok(module);
	 *   }
	 * }
	 * ```
	 */
	serialize(): unknown {
		return undefined;
	}

	/**
	 * This serializer is used by {@link GameObject} to both attach type
	 * information to modules when they get serialized, and to find the correct
	 * class to deserialize based on the type of module stored in the serialized
	 * data.
	 */
	static readonly serializer = new Serializer<
		abstract new (...args: any[]) => Module,
		{ gameObject: GameObject }
	>();

	/**
	 * Module itself cannot be deserialized, this method can be inherited by
	 * subclasses that don't have any specific data to deserialize. Subclasses
	 * still need to register themselves with
	 * {@link Serializer.registerSerializationType | Module.serializer.registerSerializationType}
	 * as the deserializer for their type.
	 */
	static deserialize(
		_obj: unknown,
		context: { gameObject: GameObject },
	): Result<Module, string> {
		if (this === Module) {
			return Err(
				'Cannot deserialize to base Module class. Please specify a derived class.',
			);
		}

		const module = context.gameObject.addModule(
			this as unknown as new (owner: GameObject) => Module,
		);

		return Ok(module);
	}
}
