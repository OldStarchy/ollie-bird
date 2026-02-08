import { fromEvent, map, tap } from 'rxjs';
import { Button } from '../Button';
import type { KeyCode } from './KeyCode';
import { KeyboardButton } from './KeyboardButton';

export default class Keyboard implements Disposable {
	#pressedKeys: Set<string> = new Set();
	#wasPressedKeys: Set<string> = new Set();
	readonly #disposableStack = new DisposableStack();

	[Symbol.dispose](): void {
		this.#disposableStack.dispose();
	}

	#handleKeyDown = (key: string) => {
		this.#pressedKeys.add(key);
	};
	#handleKeyUp = (key: string) => {
		this.#pressedKeys.delete(key);
	};

	attachTo(element: HTMLElement): Disposable {
		const ds = new DisposableStack();

		ds.use(
			fromEvent<KeyboardEvent>(element, 'keydown')
				.pipe(
					tap((event) => {
						if (!event.code.match(/^F[1-9]$|^F1[0-2]$/))
							event.preventDefault();
					}),
					map((event) => event.code),
				)
				.subscribe(this.#handleKeyDown),
		);

		ds.use(
			fromEvent<KeyboardEvent>(element, 'keyup')
				.pipe(map((event) => event.code))
				.subscribe(this.#handleKeyUp),
		);

		this.#disposableStack.use(ds);

		return ds;
	}

	step() {
		this.#wasPressedKeys = new Set(this.#pressedKeys);
	}

	isKeyDown(key: KeyCode): boolean {
		return this.#pressedKeys.has(key);
	}

	wasKeyDown(key: KeyCode): boolean {
		return this.#wasPressedKeys.has(key);
	}

	getButton(key: KeyCode): Button {
		return new KeyboardButton(this, key);
	}
}
