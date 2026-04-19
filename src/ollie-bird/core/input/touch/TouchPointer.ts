import type { Pointer } from '../Pointer';

/**
 * Represents a single touch point (nth-touch).
 * isActive indicates whether the finger is currently touching the screen.
 */
export class TouchPointer implements Pointer {
	#x: number = 0;
	#y: number = 0;
	#previousX: number = 0;
	#previousY: number = 0;
	#isActive: boolean = false;
	#wasActive: boolean = false;

	readonly name = 'touch';

	get x(): number {
		return this.#x;
	}
	get y(): number {
		return this.#y;
	}

	get previousX(): number {
		return this.#previousX;
	}

	get previousY(): number {
		return this.#previousY;
	}

	/** Whether this touch point is currently active (finger on screen). */
	get isActive(): boolean {
		return this.#isActive;
	}

	/** Whether this touch point was active at the previous step. */
	get wasActive(): boolean {
		return this.#wasActive;
	}

	/** True for exactly one frame when the touch starts. */
	get isPressed(): boolean {
		return this.#isActive && !this.#wasActive;
	}

	/** True for exactly one frame when the touch ends. */
	get isReleased(): boolean {
		return !this.#isActive && this.#wasActive;
	}

	_setPosition(x: number, y: number): void {
		this.#x = x;
		this.#y = y;
	}

	_setActive(active: boolean): void {
		this.#isActive = active;
	}

	/** Called by Touch.step() to advance to the next frame. */
	_step(): void {
		this.#wasActive = this.#isActive;
		this.#previousX = this.#x;
		this.#previousY = this.#y;
	}
}
