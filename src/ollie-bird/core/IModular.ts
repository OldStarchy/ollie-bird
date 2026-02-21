import type GameObject from './GameObject';
import type Module from './Module';

export default interface IModular {
	getModulesByType<T extends Module>(
		type: new (owner: GameObject) => T,
	): Iterable<T>;
	getModule<T extends Module>(type: new (owner: GameObject) => T): T | null;
	addModule<T extends Module>(type: new (owner: GameObject) => T): T;
	removeModule(module: Module): void;
}
