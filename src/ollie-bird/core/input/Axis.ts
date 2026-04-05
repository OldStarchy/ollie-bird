import type { Button } from './Button';
import { HalfAxis } from './HalfAxis';
import { NegativeHalfAxis } from './NegativeHalfAxis';
import { PositiveHalfAxis } from './PositiveHalfAxis';

/**
 * Represents an input that can vary both "forward" and "backward", eg. a
 * thumbstick. The range of values is -1 to 1.
 *
 * Deadzone is an area around 0 that gets treated as 0, to prevent drift from imperfect hardware.
 */
export abstract class Axis {
	abstract get valueRaw(): number;
	abstract get previousValueRaw(): number;
	abstract get name(): string;

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
		return new CombindedHalfAxesAxis(positive, negative);
	}
}

class CombindedHalfAxesAxis extends Axis {
	constructor(
		private positive: HalfAxis,
		private negative: HalfAxis,
	) {
		super(0);
	}
	get valueRaw() {
		return this.positive.valueRaw - this.negative.valueRaw;
	}
	get previousValueRaw() {
		return this.positive.previousValueRaw - this.negative.previousValueRaw;
	}
	get name() {
		return `(${this.positive.name}/${this.negative.name})`;
	}
	override splitHalfAxis(): [HalfAxis, HalfAxis] {
		return [this.positive, this.negative];
	}
}
