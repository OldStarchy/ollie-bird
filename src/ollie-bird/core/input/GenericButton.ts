import type { Observable } from 'rxjs';
import type ButtonState from './ButtonState';
import { InputButton } from './InputButton';

export class GenericButton extends InputButton implements Disposable {
	#state: ButtonState;
	#disposableStack: DisposableStack;

	constructor(initialState: ButtonState, changes$: Observable<ButtonState>) {
		super();

		this.#disposableStack = new DisposableStack();

		this.#state = initialState;
		this.#disposableStack.use(
			changes$.subscribe((newState) => {
				this.#state = newState;
			}),
		);
	}

	[Symbol.dispose](): void {
		this.#disposableStack.dispose();
	}

	get state(): ButtonState {
		return this.#state;
	}

	get isDown(): boolean {
		return (this.#state & 0b01) !== 0;
	}

	get wasDown(): boolean {
		return (this.#state & 0b10) !== 0;
	}

	get isPressed(): boolean {
		return this.#state === 0b01;
	}

	get isReleased(): boolean {
		return this.#state === 0b10;
	}
}
