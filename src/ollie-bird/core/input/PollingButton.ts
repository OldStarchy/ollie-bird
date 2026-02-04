import { InputButton } from './InputButton';

export class PollingButton extends InputButton {
	#isDown: boolean;
	#wasDown: boolean = false;

	constructor(private poll: () => boolean) {
		super();
		this.#isDown = this.poll();
	}

	step() {
		this.#wasDown = this.isDown;
		this.#isDown = this.poll();
	}

	get isDown(): boolean {
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
