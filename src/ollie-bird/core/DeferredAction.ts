/**
 * Allows blocking an action from occurring for some time.
 *
 * Very much the same as a rising-edge debounce, but
 * * can be invoked immediately if there are no blockers
 *   ```ts
 *   const notifyFinished = new DeferredAction(() => console.log('Finished!'));
 *
 *   notifyFinished.invoke(); // prints "Finished!" immediately
 *   ```
 *
 * * defers the action until blockers are disposed
 *   ```ts
 *   async function doSomething() {
 *     using _blocker = notifyFinished.defer();
 *
 *     await new Promise(resolve => setTimeout(resolve, 1000));
 *   }
 *
 *   void doSomething();
 *   notifyFinished.invoke(); // does nothing, the action is blocked
 *
 *   // After 1 second, "Finished!" is logged to the console.
 *   ```
 *
 * * the action only executes if it was requested during the time it was blocked
 *   ```ts
 *   await doSomething(); // prints nothing, invoke was not called
 *   ```
 */
export default class DeferredAction {
	#action: () => void;
	#count: number = 0;
	#shouldExecute: boolean = false;

	constructor(action: () => void) {
		this.#action = action;
	}

	/**
	 * Prevents this action from executing at least until the returned
	 * `Disposable` is disposed.
	 */
	defer(): Disposable {
		this.#count++;
		return {
			[Symbol.dispose]: () => {
				this.#count--;
				this.#maybeExecute();
			},
		};
	}

	/**
	 * Requests that this action be executed as soon as possible. If there are
	 * no blockers, the action is executed immediately. Otherwise, the action is
	 * executed as soon as all blockers are removed.
	 */
	invoke(): void {
		this.#shouldExecute = true;
		this.#maybeExecute();
	}

	/**
	 * A convenience method that calls both {@link defer} and {@link invoke} in
	 * one step.
	 */
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
