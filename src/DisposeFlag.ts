export class DisposeFlag {
	#active = false;
	get active() {
		return this.#active;
	}

	activate(): Disposable {
		if (this.#active) {
			throw new Error('DisposeFlag is already active');
		}

		this.#active = true;
		return {
			[Symbol.dispose]: () => {
				this.#active = false;
			},
		};
	}
}
