import { Button } from '../Button';
import type Gamepad from './Gamepad';
import { XboxGamepadButtonMap } from './XboxGamepadButtonMap';

export class GamepadButton extends Button {
	constructor(
		private input: Gamepad,
		private gamepadIndex: number,
		private buttonIndex: number,
	) {
		super();
		const name =
			Object.entries(XboxGamepadButtonMap).find(
				([, index]) => index === this.buttonIndex,
			)?.[0] ?? `Index ${this.buttonIndex}`;

		this.name = `Gamepad ${this.gamepadIndex} Button ${name}`;
	}

	get isDown(): boolean {
		return (
			this.input.currentState[this.gamepadIndex]?.buttons[
				this.buttonIndex
			]?.pressed ?? false
		);
	}
	get wasDown(): boolean {
		return (
			this.input.previousState[this.gamepadIndex]?.buttons[
				this.buttonIndex
			]?.pressed ?? false
		);
	}

	readonly name: string;
}
