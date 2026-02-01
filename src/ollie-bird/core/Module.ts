import type GameObject from './GameObject';
import type IModular from './IModular';

export default abstract class Module implements Disposable, IModular {
	static readonly displayName = 'Module';

	constructor(protected owner: GameObject) {}

	#enabled = true;
	public get enabled() {
		return this.#enabled;
	}
	public set enabled(value: boolean) {
		this.#enabled = value;
	}

	public [Symbol.dispose](): void {}

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
