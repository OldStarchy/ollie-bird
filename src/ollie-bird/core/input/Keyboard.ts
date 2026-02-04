import { filter, fromEvent, map, merge, Subject, tap } from 'rxjs';
import type ButtonState from './ButtonState';
import { GenericButton } from './GenericButton';
import { InputButton } from './InputButton';
import type { KeyCode } from './KeyCode';

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

		ds.defer(() => this.#step$.complete());

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

	#step$ = new Subject<void>();
	step() {
		this.wasPressedKeys = new Set(this.pressedKeys);
		this.#step$.next();
	}

	/**
	 * @deprecated #44: use getButton(key)
	 */
	getKey(key: KeyCode): ButtonState {
		const isPressed = this.pressedKeys.has(key);
		const wasPressed = this.wasPressedKeys.has(key);

		return (isPressed ? 0b01 : 0b00) | (wasPressed ? 0b10 : 0b00);
	}

	/**
	 * @deprecated #44: use getButton(key).isDown
	 */
	isKeyDown(key: KeyCode): boolean {
		return this.pressedKeys.has(key);
	}

	#buttonCache = new Map<KeyCode, InputButton>();
	getButton(key: KeyCode): InputButton {
		if (!this.#buttonCache.has(key)) {
			this.#buttonCache.set(key, this.createButton(key));
		}

		return this.#buttonCache.get(key)!;
	}

	private createButton(key: KeyCode): InputButton {
		const initialState = this.getKey(key);

		return new GenericButton(
			initialState,
			merge(this.#keyDown$, this.#keyUp$, this.#step$).pipe(
				filter((k) => k === undefined || k === key),
				map(() => this.getKey(key)),
			),
		);
	}
}
