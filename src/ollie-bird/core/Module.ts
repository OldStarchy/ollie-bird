import type GameObject from './GameObject';
import type IGame from './IGame';
import type IModular from './IModular';
import type Transform2d from './modules/Transform2d';

export default abstract class Module implements Disposable, IModular {
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

	getModules<T extends Module>(
		type: abstract new (owner: GameObject) => T,
	): Iterable<T> {
		return this.owner.getModules(type);
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
}
