import { Button } from '../Button';
import type { SwipeDetector } from './SwipeDetector';
import type { SwipeDirection } from './SwipeDetector';

/**
 * A Button that fires (isDown) for exactly one frame when a swipe in the
 * given direction is detected.
 */
export class SwipeButton extends Button {
	constructor(
		private readonly detector: SwipeDetector,
		private readonly direction: SwipeDirection,
	) {
		super();
	}

	get isDown(): boolean {
		return this.detector.isSwipe(this.direction);
	}

	get wasDown(): boolean {
		return this.detector.wasSwipe(this.direction);
	}
}
