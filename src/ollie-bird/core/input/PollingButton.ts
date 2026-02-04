import { InputButton } from './InputButton';

export class PollingButton extends InputButton {
	#isDown: boolean | null = null;
	#wasDown: boolean = false;

	constructor(private poll: () => boolean) {
		super();
	}

	step() {
		this.#wasDown = this.isDown;
		this.#isDown = null;
	}

	get isDown(): boolean {
		// if (this.#isDown === null) {
		this.#isDown = this.poll();
		// }

		return this.#isDown;
	}
	get wasDown(): boolean {
		return this.#wasDown;
	}
	get isPressed(): boolean {
		return this.isDown && !this.#wasDown;
	}
	get isReleased(): boolean {
		return !this.isDown && this.#wasDown;
	}
}
