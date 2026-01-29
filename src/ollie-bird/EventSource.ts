/**
 * @deprecated use rxjs
 */
export default class EventSource<T extends Record<string, any>> {
	private listeners: {
		[K in keyof T]?: Array<(data: T[K]) => void>;
	} = {};

	on<K extends keyof T>(
		event: K,
		listener: (data: T[K]) => void,
	): () => void {
		if (!this.listeners[event]) {
			this.listeners[event] = [];
		}
		this.listeners[event]!.push(listener);

		return () => {
			this.off(event, listener);
		};
	}

	off<K extends keyof T>(event: K, listener: (data: T[K]) => void): void {
		const index = this.listeners[event]?.indexOf(listener) ?? -1;

		if (index >= 0) {
			this.listeners[event]!.splice(index, 1);
		}
	}

	emit<K extends keyof T>(event: K, data: T[K]): void {
		if (!this.listeners[event]) return;
		for (const listener of this.listeners[event]!.slice()) {
			listener(data);
		}
	}
}
