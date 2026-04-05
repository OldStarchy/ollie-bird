import type GameObject from './GameObject';
import type Module from './Module';

export default interface IModular {
	/**
	 * Iterates over all modules attached to this object that are instances of
	 * the given type. For example,
	 * ```ts
	 * // Get all modules that are instances of the Health component
	 * for (const health of obj.getModulesByType(Health)) {
	 *   console.log(health.current);
	 * }
	 * ```
	 *
	 * Note that this method will return modules that are subclasses of the
	 * given type as well. For example, if EnemyHealth extends Health, it will
	 * be returned by `getModulesByType(Health)`.
	 *
	 * ## Note
	 * Iterators are lazy, so be sure to collect the results before
	 * the next tick (i.e. with {@link IteratorObject.toArray | .toArray()}).
	 */
	getModulesByType<T extends Module>(
		type: new (owner: GameObject) => T,
	): Iterable<T>;

	/**
	 * Returns the first module attached to this object that is an instance of
	 * the given type, or null if no such module exists. For example,
	 */
	getModule<T extends Module>(type: new (owner: GameObject) => T): T | null;

	/**
	 * Adds a module of the given type to this object. The module is initialized
	 * before addModule returns, so the returned module is ready to use
	 * immediately.
	 *
	 * If the module constructor also adds more modules, the sub-modules will
	 * be initialized first.
	 */
	addModule<T extends Module>(type: new (owner: GameObject) => T): T;

	/**
	 * Removes a module from this object. The module is removed immediately and
	 * disposed.
	 */
	removeModule(module: Module): void;
}
