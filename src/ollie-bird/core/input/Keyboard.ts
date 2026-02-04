import { fromEvent, map, Subject, tap } from 'rxjs';
import type ButtonState from './ButtonState';

export default class Keyboard {
	private pressedKeys: Set<string> = new Set();
	private wasPressedKeys: Set<string> = new Set();

	readonly #keyDown$ = new Subject<string>();
	readonly #keyUp$ = new Subject<string>();

	private readonly disposableStack = new DisposableStack();

	constructor() {
		using ds = new DisposableStack();

		ds.use(
			this.#keyDown$.subscribe((key) => {
				this.pressedKeys.add(key);
			}),
		);

		ds.use(
			this.#keyUp$.subscribe((key) => {
				this.pressedKeys.delete(key);
			}),
		);

		this.disposableStack = ds.move();
	}

	[Symbol.dispose](): void {
		this.disposableStack.dispose();
	}

	attachTo(element: HTMLElement): Disposable {
		using ds = new DisposableStack();

		ds.use(
			fromEvent<KeyboardEvent>(element, 'keydown')
				.pipe(
					tap((event) => {
						if (!event.code.match(/^F[1-9]$|^F1[0-2]$/))
							event.preventDefault();
					}),
					map((event) => event.code),
				)
				.subscribe(this.#keyDown$),
		);

		ds.use(
			fromEvent<KeyboardEvent>(element, 'keyup')
				.pipe(map((event) => event.code))
				.subscribe(this.#keyUp$),
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
