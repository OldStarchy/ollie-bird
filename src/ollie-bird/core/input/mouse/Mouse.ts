import { fromEvent, map } from 'rxjs';
import type { Vec2Like } from '../../math/Vec2';
import type { Button } from '../Button';
import type { Pointer } from '../Pointer';
import { MouseButton } from './MouseButton';

export type MouseButtonCode = 0 | 1 | 2 | 3 | 4;

export default class Mouse implements Pointer, Disposable {
	static readonly BUTTON_LEFT = 0;
	static readonly BUTTON_MIDDLE = 1;
	static readonly BUTTON_RIGHT = 2;
	static readonly BUTTON_BACK = 3;
	static readonly BUTTON_FORWARD = 4;

	readonly #disposableStack = new DisposableStack();

	#buttonsPressed: Set<MouseButtonCode> = new Set();
	#previousButtonsPressed: Set<MouseButtonCode> = new Set();

	#x: number = 0;
	#y: number = 0;
	#previousX: number = 0;
	#previousY: number = 0;

	get x(): number {
		return this.#x;
	}
	get y(): number {
		return this.#y;
	}

	get previousX(): number {
		return this.#previousX;
	}

	get previousY(): number {
		return this.#previousY;
	}

	readonly #handleMouseDown = (button: MouseButtonCode) => {
		this.#buttonsPressed.add(button);
	};

	readonly #handleMouseUp = (button: MouseButtonCode) => {
		this.#buttonsPressed.delete(button);
	};

	readonly #handleMouseLeave = () => {
		this.#buttonsPressed.clear();
	};

	readonly #handleMouseMove = ({ x, y }: { x: number; y: number }) => {
		this.#x = x;
		this.#y = y;
	};

	readonly #handleMouseEnter = ({ x, y }: { x: number; y: number }) => {
		this.#x = x;
		this.#y = y;
		this.#previousX = this.#x;
		this.#previousY = this.#y;
	};

	[Symbol.dispose](): void {
		this.#disposableStack.dispose();
	}

	attachTo(element: HTMLElement, projectMouse: (e: MouseEvent) => Vec2Like) {
		const ds = new DisposableStack();

		ds.use(
			fromEvent<MouseEvent>(element, 'mousedown')
				.pipe(map((e) => e.button as MouseButtonCode))
				.subscribe(this.#handleMouseDown),
		);

		ds.use(
			fromEvent<MouseEvent>(element, 'mouseup')
				.pipe(map((e) => e.button as MouseButtonCode))
				.subscribe(this.#handleMouseUp),
		);

		ds.use(
			fromEvent<MouseEvent>(element, 'mouseleave')
				.pipe(map(() => void 0))
				.subscribe(this.#handleMouseLeave),
		);

		ds.use(
			fromEvent<MouseEvent>(element, 'mousemove')
				.pipe(map(projectMouse))
				.subscribe(this.#handleMouseMove),
		);

		ds.use(
			fromEvent<MouseEvent>(element, 'mouseenter')
				.pipe(map(projectMouse))
				.subscribe(this.#handleMouseEnter),
		);

		this.#disposableStack.use(ds);

		return ds;
	}

	step() {
		this.#previousButtonsPressed = new Set(this.#buttonsPressed);
		this.#previousX = this.#x;
		this.#previousY = this.#y;
	}

	isButtonDown(button: MouseButtonCode): boolean {
		return this.#buttonsPressed.has(button);
	}
	wasButtonDown(button: MouseButtonCode): boolean {
		return this.#previousButtonsPressed.has(button);
	}

	getButton(button: MouseButtonCode): Button {
		return new MouseButton(this, button);
	}
}
