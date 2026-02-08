import { HalfAxisButton } from './HalfAxisButton';

/**
 * 0 to 1.
 *
 * Deadzone is an area around 0 that gets treated as 0, to prevent drift from imperfect hardware.
 */
export abstract class HalfAxis {
	abstract get valueRaw(): number;
	abstract get previousValueRaw(): number;

	accessor deadzone: number;

	constructor(deadzone = 0) {
		this.deadzone = deadzone;
	}

	get value() {
		let val = this.valueRaw;

		if (val < this.deadzone) val = 0;

		return val;
	}

	asButton(threshold = 0.5) {
		return new HalfAxisButton(this, threshold);
	}
}
