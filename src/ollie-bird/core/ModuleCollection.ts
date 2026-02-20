import DeferredAction from './DeferredAction';
import type GameObject from './GameObject';
import type IModular from './IModular';
import Module from './Module';

export default class ModuleCollection implements IModular {
	private modules: Module[] = [];
	//TODO(#49): modules => #modules, + internalAdd, + internalRemove

	constructor(private owner: GameObject) {}

	public getModules(): Module[] {
		return this.modules.slice();
	}

	public *getModulesByType<T extends Module>(
		type: abstract new (owner: GameObject) => T,
	): Generator<T> {
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

	#modulesToInitialize: Module[] = [];
	#initModulesAction = new DeferredAction(() => {
		for (const module of this.#modulesToInitialize.splice(0).toReversed()) {
			module['initialize']();
		}
	});
	public addModule<
		Constructor extends new (owner: GameObject, ...args: any[]) => Module,
	>(
		type: Constructor,
		...args: Tail<ConstructorParameters<Constructor>>
	): InstanceType<Constructor> {
		using _ = this.#initModulesAction.defer();

		const module = new type(
			this.owner,
			...args,
		) as InstanceType<Constructor>;
		this.modules.push(module);

		if (this.owner.initialized) {
			this.#modulesToInitialize.push(module);
			this.#initModulesAction.invoke();
		}

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

	initialize(): void {
		this.each((module) => {
			module['initialize']();
		});
	}

	beforeUpdate(): void {
		this.each((module) => {
			if (module.enabled) {
				module['beforeUpdate']();
			}
		});
	}
	update(): void {
		this.each((module) => {
			if (module.enabled) {
				module['update']();
			}
		});
	}
	afterUpdate(): void {
		this.each((module) => {
			if (module.enabled) {
				module['afterUpdate']();
			}
		});
	}

	beforeRender(context: CanvasRenderingContext2D): void {
		this.each((module) => {
			if (module.enabled) {
				module['beforeRender'](context);
			}
		});
	}
	render(context: CanvasRenderingContext2D): void {
		this.each((module) => {
			if (module.enabled) {
				module['render'](context);
			}
		});
	}
	afterRender(context: CanvasRenderingContext2D): void {
		this.each((module) => {
			if (module.enabled) {
				module['afterRender'](context);
			}
		});
	}

	beforeRenderGizmos(context: CanvasRenderingContext2D): void {
		this.each((module) => {
			if (module.enabled) {
				module['beforeRenderGizmos'](context);
			}
		});
	}
	renderGizmos(context: CanvasRenderingContext2D): void {
		this.each((module) => {
			if (module.enabled) {
				module['renderGizmos'](context);
			}
		});
	}
	afterRenderGizmos(context: CanvasRenderingContext2D): void {
		this.each((module) => {
			if (module.enabled) {
				module['afterRenderGizmos'](context);
			}
		});
	}
}
