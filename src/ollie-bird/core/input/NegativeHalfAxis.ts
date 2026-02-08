import type { Axis } from './Axis';
import { HalfAxis } from './HalfAxis';

export class NegativeHalfAxis extends HalfAxis {
	constructor(private parent: Axis) {
		super(parent.deadzone);
	}

	get valueRaw() {
		return Math.max(0, -this.parent.valueRaw);
	}

	get previousValueRaw() {
		return Math.max(0, -this.parent.previousValueRaw);
	}
}
