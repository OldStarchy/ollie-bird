import type { Button } from '../Button';
import { SwipeButton } from './SwipeButton';
import type { TouchPointer } from './TouchPointer';

export type SwipeDirection = 'up' | 'down' | 'left' | 'right';

/**
 * Detects swipe gestures on a single touch point.
 *
 * Call step() each frame (done automatically when created via
 * Touch.createSwipeDetector()). Swipe buttons fire for exactly one frame
 * after the finger lifts if the total displacement exceeds the threshold.
 */
export class SwipeDetector {
	#startX: number = 0;
	#startY: number = 0;

	#currentSwipeDirection: SwipeDirection | null = null;
	#previousSwipeDirection: SwipeDirection | null = null;

	/** Directional swipe buttons. Each is "down" for one frame on detection. */
	readonly up: Button;
	readonly down: Button;
	readonly left: Button;
	readonly right: Button;

	/**
	 * @param pointer   The touch point to monitor.
	 * @param threshold Minimum pixel distance to recognise as a swipe (default 50).
	 */
	constructor(
		private readonly pointer: TouchPointer,
		readonly threshold: number = 50,
	) {
		this.up = new SwipeButton(this, 'up');
		this.down = new SwipeButton(this, 'down');
		this.left = new SwipeButton(this, 'left');
		this.right = new SwipeButton(this, 'right');
	}

	/**
	 * Called by Touch.step() before pointer state is advanced.
	 * Reads current vs previous pointer state to detect swipe start/end.
	 */
	step(): void {
		this.#previousSwipeDirection = this.#currentSwipeDirection;
		this.#currentSwipeDirection = null;

		if (this.pointer.isActive && !this.pointer.wasActive) {
			// Touch just started — record start position.
			this.#startX = this.pointer.x;
			this.#startY = this.pointer.y;
		} else if (!this.pointer.isActive && this.pointer.wasActive) {
			// Touch just ended — evaluate swipe.
			const dx = this.pointer.x - this.#startX;
			const dy = this.pointer.y - this.#startY;
			const distance = Math.sqrt(dx * dx + dy * dy);

			if (distance >= this.threshold) {
				if (Math.abs(dx) >= Math.abs(dy)) {
					this.#currentSwipeDirection = dx > 0 ? 'right' : 'left';
				} else {
					this.#currentSwipeDirection = dy > 0 ? 'down' : 'up';
				}
			}
		}
	}

	/** Returns true if a swipe in the given direction was detected this frame. */
	isSwipe(direction: SwipeDirection): boolean {
		return this.#currentSwipeDirection === direction;
	}

	/** Returns true if a swipe in the given direction was detected last frame. */
	wasSwipe(direction: SwipeDirection): boolean {
		return this.#previousSwipeDirection === direction;
	}
}
