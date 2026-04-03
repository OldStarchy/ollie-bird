import { Button } from './Button';
import type { HalfAxis } from './HalfAxis';

/**
 * Converts a {@link HalfAxis} into a {@link Button} by treating values above a
 * certain threshold as "pressed".
 */
export class HalfAxisButton extends Button {
	constructor(
		private parent: HalfAxis,
		private threshold: number,
	) {
		super();
	}

	get isDown() {
		return this.parent.valueRaw >= this.threshold;
	}

	get wasDown() {
		return this.parent.previousValueRaw >= this.threshold;
	}

	get name() {
		return this.parent.name;
	}
}
