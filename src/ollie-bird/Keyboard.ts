import type ButtonState from './ButtonState';

export default class Keyboard {
	private pressedKeys: Set<string> = new Set();
	private wasPressedKeys: Set<string> = new Set();

	constructor(element: HTMLElement, signal: AbortSignal) {
		element.addEventListener(
			'keydown',
			(event) => {
				this.pressedKeys.add(event.code);
				if (!event.code.match(/^F[1-9]$|^F1[0-2]$/))
					event.preventDefault();
				console.log([...this.pressedKeys.keys()]);
			},
			{ signal },
		);

		element.addEventListener(
			'keyup',
			(event) => {
				this.pressedKeys.delete(event.code);
			},
			{ signal },
		);
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
