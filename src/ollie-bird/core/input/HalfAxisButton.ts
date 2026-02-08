import { Button } from './Button';
import type { HalfAxis } from './HalfAxis';

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
}
