import type GameObject from './GameObject';

export default abstract class Module implements Disposable, IModular {
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

	protected beforeRender(context: CanvasRenderingContext2D): void {}
	protected render(context: CanvasRenderingContext2D): void {}
	protected afterRender(context: CanvasRenderingContext2D): void {}

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

export interface IModular {
	getModules<T extends Module>(
		type: new (owner: GameObject) => T,
	): Iterable<T>;
	getModule<T extends Module>(type: new (owner: GameObject) => T): T | null;
	addModule<T extends Module>(type: new (owner: GameObject) => T): T;
	removeModule(module: Module): void;
}

export class ModuleCollection extends Module implements IModular {
	private modules: Module[] = [];

	public *getModules<T extends Module>(
		type: abstract new (owner: GameObject) => T,
	): Iterable<T> {
		for (const module of this.modules) {
			if (module instanceof type) {
				yield module as T;
			}
		}
	}

	public getModule<T extends Module>(
		type: abstract new (owner: GameObject) => T,
	): T | null {
		for (const module of this.modules) {
			if (module instanceof type) {
				return module as T;
			}
		}
		return null;
	}

	public addModule<T extends Module>(type: new (owner: GameObject) => T): T {
		const module = new type(this.owner);
		this.modules.push(module);
		return module;
	}

	public removeModule(module: Module): void {
		const index = this.modules.indexOf(module);
		if (index !== -1) {
			this.modules.splice(index, 1);
			module[Symbol.dispose]();
		}
	}

	protected each(cb: (module: Module) => void): void {
		for (const module of this.modules) {
			cb(module);
		}
	}

	public [Symbol.dispose](): void {
		this.each((module) => {
			module[Symbol.dispose]();
		});
	}

	protected initialize(): void {
		this.each((module) => {
			module['initialize']();
		});
	}

	protected beforeUpdate(): void {
		this.each((module) => {
			if (module.enabled) {
				module['beforeUpdate']();
			}
		});
	}
	protected update(): void {
		this.each((module) => {
			if (module.enabled) {
				module['update']();
			}
		});
	}
	protected afterUpdate(): void {
		this.each((module) => {
			if (module.enabled) {
				module['afterUpdate']();
			}
		});
	}

	protected beforeRender(context: CanvasRenderingContext2D): void {
		this.each((module) => {
			if (module.enabled) {
				module['beforeRender'](context);
			}
		});
	}
	protected render(context: CanvasRenderingContext2D): void {
		this.each((module) => {
			if (module.enabled) {
				module['render'](context);
			}
		});
	}
	protected afterRender(context: CanvasRenderingContext2D): void {
		this.each((module) => {
			if (module.enabled) {
				module['afterRender'](context);
			}
		});
	}
}
