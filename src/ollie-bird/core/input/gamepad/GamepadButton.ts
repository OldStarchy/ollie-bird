import { Button } from '../Button';
import type Gamepad from './Gamepad';

export class GamepadButton extends Button {
	constructor(
		private input: Gamepad,
		private gamepadIndex: number,
		private buttonIndex: number,
	) {
		super();
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
}
