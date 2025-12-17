import type ButtonState from './ButtonState';

export default class Mouse {
	static BUTTON_LEFT = 0;
	static BUTTON_MIDDLE = 1;
	static BUTTON_RIGHT = 2;
	static BUTTON_BACK = 3;
	static BUTTON_FORWARD = 4;

	private buttonsPressed: Set<number> = new Set();
	private previousButtonsPressed: Set<number> = new Set();
	#x: number = 0;
	#y: number = 0;

	get x(): number {
		return this.#x;
	}
	get y(): number {
		return this.#y;
	}

	get deltaX(): number {
		return this.#x - this.previousX;
	}

	get deltaY(): number {
		return this.#y - this.previousY;
	}

	private previousX: number = 0;
	private previousY: number = 0;

	constructor(
		private element: HTMLElement,
		signal: AbortSignal,
	) {
		this.element.addEventListener(
			'mousedown',
			(e) => {
				this.buttonsPressed.add(e.button);
			},
			{ signal },
		);

		this.element.addEventListener(
			'mouseup',
			(e) => {
				this.buttonsPressed.delete(e.button);
			},
			{ signal },
		);

		this.element.addEventListener(
			'mouseleave',
			(_e) => {
				this.buttonsPressed.clear();
			},
			{ signal },
		);

		this.element.addEventListener(
			'mousemove',
			(e) => {
				const rect = this.element.getBoundingClientRect();
				this.#x = e.clientX - rect.left;
				this.#y = e.clientY - rect.top;
			},
			{ signal },
		);

		this.element.addEventListener(
			'mouseenter',
			(e) => {
				const rect = this.element.getBoundingClientRect();
				this.#x = e.clientX - rect.left;
				this.#y = e.clientY - rect.top;
				this.previousX = this.#x;
				this.previousY = this.#y;
			},
			{ signal },
		);
	}

	step() {
		this.previousButtonsPressed = new Set(this.buttonsPressed);
		this.previousX = this.#x;
		this.previousY = this.#y;
	}

	getButton(button: number): ButtonState {
		const isPressed = this.buttonsPressed.has(button);
		const wasPressed = this.previousButtonsPressed.has(button);

		return (isPressed ? 0b01 : 0b00) | (wasPressed ? 0b10 : 0b00);
	}

	getButtonDown(button: number): boolean {
		return this.buttonsPressed.has(button);
	}
}
