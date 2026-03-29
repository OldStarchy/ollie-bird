import { Axis } from '../Axis';
import type Gamepad from './Gamepad';
import { XboxGamepadAxisMap } from './XboxGamepadAxisMap';

export class GamepadAxis extends Axis {
	constructor(
		private input: Gamepad,
		private gamepadIndex: number,
		private axisIndex: number,
		deadzone: number = 0.05,
	) {
		super();
		this.deadzone = deadzone;

		const name =
			Object.entries(XboxGamepadAxisMap).find(
				([, index]) => index === this.axisIndex,
			)?.[0] ?? `Axis ${this.axisIndex}`;

		this.name = `Gamepad ${this.gamepadIndex} ${name}`;
	}

	get valueRaw(): number {
		return (
			this.input.currentState[this.gamepadIndex]?.axes[this.axisIndex] ??
			0
		);
	}

	get previousValueRaw(): number {
		return (
			this.input.previousState[this.gamepadIndex]?.axes[this.axisIndex] ??
			0
		);
	}

	readonly name: string;
}
