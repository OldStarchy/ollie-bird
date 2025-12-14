export default class Signal<T> {
	private listeners: Array<(arg: T) => void> = [];

	on(listener: (arg: T) => void): () => void {
		this.listeners.push(listener);

		return () => {
			this.off(listener);
		};
	}

	off(listener: (arg: T) => void): void {
		const index = this.listeners.indexOf(listener);
		if (index !== -1) {
			this.listeners.splice(index, 1);
		}
	}

	emit(arg: T): void {
		for (const listener of this.listeners) {
			listener(arg);
		}
	}
}
