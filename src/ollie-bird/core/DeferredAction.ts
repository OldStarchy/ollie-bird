export default class DeferredAction {
	#action: () => void;
	#count: number = 0;
	#shouldExecute: boolean = false;

	constructor(action: () => void) {
		this.#action = action;
	}

	defer(): Disposable {
		this.#count++;
		return {
			[Symbol.dispose]: () => {
				this.#count--;
				this.#maybeExecute();
			},
		};
	}

	invoke(): void {
		this.#shouldExecute = true;
		this.#maybeExecute();
	}

	deferInvoke(): Disposable {
		const disposable = this.defer();
		this.invoke();
		return disposable;
	}

	#maybeExecute(): void {
		if (this.#shouldExecute && this.#count === 0) {
			this.#action();
			this.#shouldExecute = false;
		}
	}
}
