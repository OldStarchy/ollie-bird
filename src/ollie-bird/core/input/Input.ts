import type { Axis } from './Axis';
import { Button } from './Button';
import Gamepad from './gamepad/Gamepad';
import Keyboard from './keyboard/Keyboard';
import Mouse from './mouse/Mouse';
import Touch from './touch/Touch';
import { VirtualButton } from './VirtualButton';

export default class Input implements Disposable {
	readonly keyboard = new Keyboard();
	readonly mouse = new Mouse();
	readonly gamepads = new Gamepad();
	readonly touch = new Touch();

	#disposableStack = new DisposableStack();
	readonly #virtualButtons: VirtualButton[] = [];

	constructor() {
		this.#disposableStack.use(this.keyboard);
		this.#disposableStack.use(this.mouse);
		this.#disposableStack.use(this.touch);
		this.#disposableStack.use(this.gamepads.attachTo(window));
	}

	step(): void {
		this.keyboard.step();
		this.mouse.step();
		this.gamepads.step();
		this.touch.step();
		for (const btn of this.#virtualButtons) {
			btn.step();
		}
	}

	/**
	 * Creates a VirtualButton whose state can be driven programmatically
	 * (e.g. from an on-screen button component).
	 */
	createVirtualButton(): VirtualButton {
		const btn = new VirtualButton();
		this.#virtualButtons.push(btn);
		return btn;
	}

	private readonly buttons: Record<string | symbol, Button> = {};
	private readonly axes: Record<string | symbol, Axis> = {};

	defineButton(name: string | symbol, button: Button): void {
		this.buttons[name] = button;
	}

	getButton(name: string | symbol): Button {
		const button = this.buttons[name];
		if (!button) {
			throw new Error(`Button "${String(name)}" is not defined`);
		}

		return button;
	}

	defineAxis(name: string | symbol, axis: Axis): void {
		this.axes[name] = axis;
	}

	getAxis(name: string | symbol): Axis {
		const axis = this.axes[name];
		if (!axis) {
			throw new Error(`Axis "${String(name)}" is not defined`);
		}

		return axis;
	}

	#schemas: Record<string, Record<string | symbol, Button>> = {};
	defineSchema<T>(name: string, schema: T): void {
		this.#schemas[name] = schema as Record<string | symbol, Button>;
	}

	getSchema<T>(name: string): T {
		const schema = this.#schemas[name];
		if (!schema) {
			throw new Error(`Schema "${name}" is not defined`);
		}

		return schema as T;
	}

	[Symbol.dispose](): void {
		this.#disposableStack.dispose();
	}
}
