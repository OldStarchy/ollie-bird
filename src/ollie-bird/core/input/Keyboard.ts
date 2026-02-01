import { fromEvent } from 'rxjs';
import type ButtonState from './ButtonState';

export default class Keyboard {
	private pressedKeys: Set<string> = new Set();
	private wasPressedKeys: Set<string> = new Set();

	attachTo(element: HTMLElement): Disposable {
		using ds = new DisposableStack();

		ds.use(
			fromEvent<KeyboardEvent>(element, 'keydown').subscribe((event) => {
				this.pressedKeys.add(event.code);
				if (!event.code.match(/^F[1-9]$|^F1[0-2]$/))
					event.preventDefault();
			}),
		);

		ds.use(
			fromEvent<KeyboardEvent>(element, 'keyup').subscribe((event) => {
				this.pressedKeys.delete(event.code);
			}),
		);

		return ds.move();
	}

	step() {
		this.wasPressedKeys = new Set(this.pressedKeys);
	}

	getKey(key: string): ButtonState {
		const isPressed = this.pressedKeys.has(key);
		const wasPressed = this.wasPressedKeys.has(key);

		return (isPressed ? 0b01 : 0b00) | (wasPressed ? 0b10 : 0b00);
	}

	isKeyDown(key: string): boolean {
		return this.pressedKeys.has(key);
	}
}
