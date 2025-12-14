import type IGame from './IGame';
import Module, { ModuleCollection, type IModular } from './IModular';
import Transform2d from './modules/Transform2d';

export default abstract class GameObject implements IModular, Disposable {
	private destructors: (() => void)[] = [];
	private modules: ModuleCollection;

	layer: number = 0;
	tags: Set<string> = new Set();

	readonly transform: Transform2d;

	constructor(protected game: IGame) {
		this.modules = new ModuleCollection(this);
		this.destructors.push(() => this.modules[Symbol.dispose]());

		this.transform = this.addModule(Transform2d);
	}

	getModules<T extends Module>(
		type: abstract new (owner: GameObject) => T,
	): Iterable<T> {
		return this.modules.getModules(type);
	}
	getModule<T extends Module>(
		type: abstract new (owner: GameObject) => T,
	): T | null {
		return this.modules.getModule(type);
	}
	addModule<T extends Module>(type: new (owner: GameObject) => T): T {
		return this.modules.addModule(type);
	}
	removeModule(module: Module): void {
		return this.modules.removeModule(module);
	}

	private doInitialize() {
		this.initialize();
		this.modules['initialize']();
	}
	protected initialize(): void {}

	private doBeforeUpdate(): void {
		this.beforeUpdate();
		this.modules['beforeUpdate']();
	}
	protected beforeUpdate(): void {}

	private doUpdate(): void {
		this.update();
		this.modules['update']();
	}
	protected update(): void {}

	private doAfterUpdate(): void {
		this.afterUpdate();
		this.modules['afterUpdate']();
	}
	protected afterUpdate(): void {}

	private doBeforeRender(context: CanvasRenderingContext2D): void {
		this.beforeRender(context);
		this.modules['beforeRender'](context);
	}
	protected beforeRender(context: CanvasRenderingContext2D): void {}

	private doRender(context: CanvasRenderingContext2D): void {
		this.render(context);
		this.modules['render'](context);
	}
	protected render(context: CanvasRenderingContext2D): void {}

	private doAfterRender(context: CanvasRenderingContext2D): void {
		this.afterRender(context);
		this.modules['afterRender'](context);
	}
	protected afterRender(context: CanvasRenderingContext2D): void {}

	private doBeforeRenderGizmos(context: CanvasRenderingContext2D): void {
		this.beforeRenderGizmos(context);
		this.modules['beforeRenderGizmos'](context);
	}
	protected beforeRenderGizmos(context: CanvasRenderingContext2D): void {}

	private doRenderGizmos(context: CanvasRenderingContext2D): void {
		this.renderGizmos(context);
		this.modules['renderGizmos'](context);
	}
	protected renderGizmos(context: CanvasRenderingContext2D): void {}

	private doAfterRenderGizmos(context: CanvasRenderingContext2D): void {
		this.afterRenderGizmos(context);
		this.modules['afterRenderGizmos'](context);
	}
	protected afterRenderGizmos(context: CanvasRenderingContext2D): void {}

	onGameEvent<T extends keyof GameEventMap>(
		event: T,
		listener: (args: GameEventMap[T]) => void,
	) {
		const unsub = this.game.event.on(event, listener);
		this.destructors.push(unsub);
	}

	[Symbol.dispose]() {
		for (const unsub of this.destructors) {
			unsub();
		}
	}

	destroy() {
		this.game.destroy(this);
	}
}
