import GamepadInput from './GamepadInput';
import type { InputAxis } from './InputAxis';
import { InputButton } from './InputButton';
import Keyboard from './Keyboard';
import Mouse from './Mouse';

export default class Input {
	readonly keyboard = new Keyboard();
	readonly mouse = new Mouse();
	readonly gamepads = new GamepadInput();

	constructor() {
		this.gamepads.attachTo(window);
	}

	step(): void {
		this.keyboard.step();
		this.mouse.step();
		this.gamepads.step();
	}

	readonly buttons: Record<string | symbol, InputButton> = {};
	readonly axes: Record<string | symbol, InputAxis> = {};

	anyButton(buttons: InputButton[]): InputButton {
		return new MergedButton(buttons);
	}
}

class MergedButton extends InputButton {
	constructor(private buttons: InputButton[]) {
		super();
	}

	get isDown(): boolean {
		return this.buttons.some((button) => button.isDown);
	}

	get wasDown(): boolean {
		return this.buttons.some((button) => button.wasDown);
	}

	get isPressed(): boolean {
		return this.isDown && !this.wasDown;
	}

	get isReleased(): boolean {
		return !this.isDown && this.wasDown;
	}
}
