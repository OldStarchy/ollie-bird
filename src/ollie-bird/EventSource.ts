export default class EventSource<T extends Record<string, any>> {
	private listeners: {
		[K in keyof T]?: Array<(data: T[K]) => void>;
	} = {};

	on<K extends keyof T>(event: K, listener: (data: T[K]) => void): () => void {
		if (!this.listeners[event]) {
			this.listeners[event] = [];
		}
		this.listeners[event]!.push(listener);

		return () => {
			this.listeners[event] = this.listeners[event]!.filter(l => l !== listener);
		};
	}

	off<K extends keyof T>(event: K, listener: (data: T[K]) => void): void {
		if (!this.listeners[event]) return;
		this.listeners[event] = this.listeners[event]!.filter(l => l !== listener);
	}

	emit<K extends keyof T>(event: K, data: T[K]): void {
		if (!this.listeners[event]) return;
		for (const listener of this.listeners[event]!) {
			listener(data);
		}
	}
}
