import { Button } from './Button';

/**
 * A Button whose state is controlled programmatically.
 *
 * Useful for on-screen UI controls: call press() on pointer-down and
 * release() on pointer-up / pointer-cancel.
 *
 * step() is called automatically by Input.step().
 */
export class VirtualButton extends Button {
	#isDown: boolean = false;
	#wasDown: boolean = false;

	/** Mark the button as held down. */
	press(): void {
		this.#isDown = true;
	}

	/** Mark the button as released. */
	release(): void {
		this.#isDown = false;
	}

	/** Called by Input.step() to advance to the next frame. */
	step(): void {
		this.#wasDown = this.#isDown;
	}

	get isDown(): boolean {
		return this.#isDown;
	}

	get wasDown(): boolean {
		return this.#wasDown;
	}
}
