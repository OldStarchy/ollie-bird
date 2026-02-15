import type GameObject from './GameObject';
import type IGame from './IGame';
import type IModular from './IModular';
import type Transform2d from './modules/Transform2d';
import { Err, Ok, type Result } from './monad/Result';
import type { Serializable } from './Serializer';
import Serializer from './Serializer';

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

	constructor(protected owner: GameObject) {}

	#enabled = true;
	public get enabled() {
		return this.#enabled;
	}
	public set enabled(value: boolean) {
		this.#enabled = value;
	}

	protected disposableStack = new DisposableStack();
	public [Symbol.dispose](): void {
		this.disposableStack.dispose();
	}

	protected initialize(): void {}

	protected beforeUpdate(): void {}
	protected update(): void {}
	protected afterUpdate(): void {}

	protected beforeRender(_context: CanvasRenderingContext2D): void {}
	protected render(_context: CanvasRenderingContext2D): void {}
	protected afterRender(_context: CanvasRenderingContext2D): void {}

	protected beforeRenderGizmos(_context: CanvasRenderingContext2D): void {}
	protected renderGizmos(_context: CanvasRenderingContext2D): void {}
	protected afterRenderGizmos(_context: CanvasRenderingContext2D): void {}

	getModulesByType<T extends Module>(
		type: abstract new (owner: GameObject) => T,
	): Iterable<T> {
		return this.owner.getModulesByType(type);
	}
	getModule<T extends Module>(
		type: abstract new (owner: GameObject) => T,
	): T | null {
		return this.owner.getModule(type);
	}
	addModule<T extends Module>(type: new (owner: GameObject) => T): T {
		return this.owner.addModule(type);
	}
	removeModule(module: Module): void {
		return this.owner.removeModule(module);
	}

	serialize(): unknown {
		return undefined;
	}

	static readonly serializer = new Serializer<
		abstract new (...args: any[]) => Module,
		{ gameObject: GameObject }
	>();

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
