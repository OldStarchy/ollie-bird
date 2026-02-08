import { Button } from '../Button';
import type { KeyCode } from './KeyCode';
import type Keyboard from './Keyboard';

export class KeyboardButton extends Button {
	constructor(
		private keyboard: Keyboard,
		private keyCode: KeyCode,
	) {
		super();
	}

	get isDown(): boolean {
		return this.keyboard.isKeyDown(this.keyCode);
	}
	get wasDown(): boolean {
		return this.keyboard.wasKeyDown(this.keyCode);
	}
}
