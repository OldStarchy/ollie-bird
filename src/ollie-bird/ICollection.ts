export default interface ICollection<T> extends Iterable<T, void, void> {
	count(): number;
	add(item: T): void;
	remove(item: T): boolean;
	contains(item: T): boolean;

	removeBy(predicate: (item: T) => boolean): number;

	find(predicate: (item: T) => boolean): T | undefined;

	forEach(callback: (item: T) => void): void;
}
