import { fromEvent, map, Subject } from 'rxjs';
import type { Vec2Like } from '../math/Vec2';
import type ButtonState from './ButtonState';

export default class Mouse implements Disposable {
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

	private readonly mouseDown$ = new Subject<number>();
	private readonly mouseUp$ = new Subject<number>();
	private readonly mouseLeave$ = new Subject<void>();
	private readonly mouseMove$ = new Subject<{ x: number; y: number }>();
	private readonly mouseEnter$ = new Subject<{ x: number; y: number }>();

	private readonly disposableStack = new DisposableStack();

	constructor() {
		using ds = new DisposableStack();

		ds.use(
			this.mouseDown$.subscribe((button) => {
				this.buttonsPressed.add(button);
			}),
		);

		ds.use(
			this.mouseUp$.subscribe((button) => {
				this.buttonsPressed.delete(button);
			}),
		);

		ds.use(
			this.mouseLeave$.subscribe(() => {
				this.buttonsPressed.clear();
			}),
		);

		ds.use(
			this.mouseMove$.subscribe(({ x, y }) => {
				this.#x = x;
				this.#y = y;
			}),
		);

		ds.use(
			this.mouseEnter$.subscribe(({ x, y }) => {
				this.#x = x;
				this.#y = y;
				this.previousX = this.#x;
				this.previousY = this.#y;
			}),
		);

		this.disposableStack = ds.move();
	}

	[Symbol.dispose](): void {
		this.disposableStack.dispose();
	}

	attachTo(element: HTMLElement, projectMouse: (e: MouseEvent) => Vec2Like) {
		using ds = new DisposableStack();

		ds.use(
			fromEvent<MouseEvent>(element, 'mousedown')
				.pipe(map((e) => e.button))
				.subscribe(this.mouseDown$),
		);

		ds.use(
			fromEvent<MouseEvent>(element, 'mouseup')
				.pipe(map((e) => e.button))
				.subscribe(this.mouseUp$),
		);

		ds.use(
			fromEvent<MouseEvent>(element, 'mouseleave')
				.pipe(map(() => void 0))
				.subscribe(this.mouseLeave$),
		);

		ds.use(
			fromEvent<MouseEvent>(element, 'mousemove')
				.pipe(map(projectMouse))
				.subscribe(this.mouseMove$),
		);

		ds.use(
			fromEvent<MouseEvent>(element, 'mouseenter')
				.pipe(map(projectMouse))
				.subscribe(this.mouseEnter$),
		);

		return ds.move();
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
