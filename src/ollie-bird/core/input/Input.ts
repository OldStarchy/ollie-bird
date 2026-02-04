import GamepadInput from './GamepadInput';
import type { InputAxis } from './InputAxis';
import { InputButton } from './InputButton';
import Keyboard from './Keyboard';
import Mouse from './Mouse';

export default class Input implements Disposable {
	readonly keyboard = new Keyboard();
	readonly mouse = new Mouse();
	readonly gamepads = new GamepadInput();

	#disposableStack = new DisposableStack();

	constructor() {
		this.#disposableStack.use(this.keyboard);
		this.#disposableStack.use(this.mouse);
		this.#disposableStack.use(this.gamepads.attachTo(window));
	}

	step(): void {
		this.keyboard.step();
		this.mouse.step();
		this.gamepads.step();
	}

	private readonly buttons: Record<string | symbol, InputButton> = {};
	private readonly axes: Record<string | symbol, InputAxis> = {};

	defineButton(name: string | symbol, button: InputButton): void {
		this.buttons[name] = button;
	}

	getButton(name: string | symbol): InputButton {
		const button = this.buttons[name];
		if (!button) {
			throw new Error(`Button "${String(name)}" is not defined`);
		}

		return button;
	}

	defineAxis(name: string | symbol, axis: InputAxis): void {
		this.axes[name] = axis;
	}

	getAxis(name: string | symbol): InputAxis {
		const axis = this.axes[name];
		if (!axis) {
			throw new Error(`Axis "${String(name)}" is not defined`);
		}

		return axis;
	}

	anyButton(buttons: InputButton[]): InputButton {
		return new MergedButton(buttons);
	}

	#schemas: Record<string, Record<string | symbol, InputButton>> = {};
	defineSchema<T>(name: string, schema: T): void {
		this.#schemas[name] = schema as Record<string | symbol, InputButton>;
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

class MergedButton extends InputButton {
	constructor(private buttons: InputButton[]) {
		super();
	}

	get isDown(): boolean {
		return this.buttons.some((button) => button.isDown);
	}

	get wasDown(): boolean {
		return this.buttons.some((button) => button.wasDown);
	}

	get isPressed(): boolean {
		return this.isDown && !this.wasDown;
	}

	get isReleased(): boolean {
		return !this.isDown && this.wasDown;
	}
}
