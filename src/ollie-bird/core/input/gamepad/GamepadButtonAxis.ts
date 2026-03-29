import { HalfAxis } from '../HalfAxis';
import type Gamepad from './Gamepad';
import { XboxGamepadAxisMap } from './XboxGamepadAxisMap';

export class GamepadButtonAxis extends HalfAxis {
	accessor deadzone: number;

	constructor(
		private input: Gamepad,
		private gamepadIndex: number,
		private buttonPositiveIndex: number,
	) {
		super();
		this.deadzone = 0;

		const name =
			Object.entries(XboxGamepadAxisMap).find(
				([, index]) => index === this.buttonPositiveIndex,
			)?.[0] ?? `Axis ${this.buttonPositiveIndex}`;

		this.name = `Gamepad ${this.gamepadIndex} Axis ${name}`;
	}

	get valueRaw(): number {
		const button =
			this.input.currentState[this.gamepadIndex]?.buttons[
				this.buttonPositiveIndex
			];
		return button?.value ?? 0;
	}

	get previousValueRaw(): number {
		const button =
			this.input.previousState[this.gamepadIndex]?.buttons[
				this.buttonPositiveIndex
			];
		return button?.value ?? 0;
	}

	readonly name: string;
}
