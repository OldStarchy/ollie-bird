import type { Button } from './Button';
import { HalfAxis } from './HalfAxis';
import { NegativeHalfAxis } from './NegativeHalfAxis';
import { PositiveHalfAxis } from './PositiveHalfAxis';

/**
 * -1 to 1.
 *
 * Deadzone is an area around 0 that gets treated as 0, to prevent drift from imperfect hardware.
 */
export abstract class Axis {
	abstract get valueRaw(): number;
	abstract get previousValueRaw(): number;

	accessor deadzone: number;

	constructor(deadzone = 0) {
		this.deadzone = deadzone;
	}

	get value() {
		let val = this.valueRaw;

		if (Math.abs(val) < this.deadzone) val = 0;

		return val;
	}

	splitHalfAxis(): [HalfAxis, HalfAxis] {
		return [new PositiveHalfAxis(this), new NegativeHalfAxis(this)];
	}

	splitHalfAxisButtons(threshold = 0.5): [Button, Button] {
		return [
			new PositiveHalfAxis(this).asButton(threshold),
			new NegativeHalfAxis(this).asButton(threshold),
		];
	}

	static combineHalfAxes(positive: HalfAxis, negative: HalfAxis): Axis {
		return new (class extends Axis {
			get valueRaw() {
				return positive.valueRaw - negative.valueRaw;
			}
			get previousValueRaw() {
				return positive.previousValueRaw - negative.previousValueRaw;
			}
		})();
	}
}
