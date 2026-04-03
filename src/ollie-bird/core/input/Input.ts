import type { Axis } from './Axis';
import type { Button } from './Button';
import type { Pointer } from './Pointer';
import Gamepad from './gamepad/Gamepad';
import Keyboard from './keyboard/Keyboard';
import Mouse from './mouse/Mouse';

/**
 * Handles input devices that can provide user inputs to the game.
 *
 * Inputs are represented as {@link Button}s, {@link Axis}es, and
 * {@link Pointer}s, which can be defined per device, or created as virtual
 * inputs driven programatically.
 *
 * The individual inputs can be named and accessed through the `define` and
 * `get` methods per input type, and grouped into schemas for structured control
 * schemes (eg. player controls, menu controls, etc).
 *
 * ```ts
 * class MyGame extends BaseGame {
 *   constructor() {
 *     super();
 *
 *     this.input.defineSchema('menu controls', {
 *       pointer: this.input.mouse,
 *       click: this.input.mouse.getButton(Mouse.BUTTON_LEFT),
 *     });
 *
 *     this.input.defineSchema('player controls', {
 *       moveLeft: new MergedButton(
 *         this.input.keyboard.getButton('ArrowLeft'),
 *         this.input.keyboard.getButton('A'),
 *       ),
 *       moveRight: new MergedButton(
 *         this.input.keyboard.getButton('ArrowRight'),
 *         this.input.keyboard.getButton('D'),
 *       ),
 *     });
 *   }
 * }
 * ```
 *
 * ## Note
 *
 * The schema system is likely to change to better support dynamic schemas per
 * player per input device, with the concept of a "currently in-use"
 * schema/device.
 */
export default class Input implements Disposable {
	readonly keyboard = new Keyboard();
	readonly mouse = new Mouse();
	readonly gamepads = new Gamepad();

	#disposableStack = new DisposableStack();

	/**
	 * @internal
	 */
	constructor() {
		this.#disposableStack.use(this.keyboard);
		this.#disposableStack.use(this.mouse);
		this.#disposableStack.use(this.gamepads.attachTo(window));
	}

	/**
	 * Updates the state of all input devices. This is called once per frame by
	 * {@link BaseGame}.
	 *
	 * Updating inputs is necessary for calculating "was pressed" vs "was held"
	 * states, as well as velocity for varying input types (Axis, Pointer).
	 * @internal
	 */
	step(): void {
		this.keyboard.step();
		this.mouse.step();
		this.gamepads.step();
	}

	private readonly buttons: Record<string, Button> = {};
	private readonly axes: Record<string, Axis> = {};
	private readonly pointers: Record<string, Pointer> = {};

	/**
	 * Defines a name for a given button.
	 */
	defineButton(name: string, button: Button): void {
		this.buttons[name] = button;
	}

	/**
	 * Returns a button with the given name (as defined by {@link defineButton}).
	 */
	getButton(name: string): Button {
		const button = this.buttons[name];
		if (!button) {
			throw new Error(`Button "${String(name)}" is not defined`);
		}

		return button;
	}

	/**
	 * Defines a name for a given axis.
	 */
	defineAxis(name: string, axis: Axis): void {
		this.axes[name] = axis;
	}

	/**
	 * Returns an axis with the given name (as defined by {@link defineAxis}).
	 */
	getAxis(name: string): Axis {
		const axis = this.axes[name];
		if (!axis) {
			throw new Error(`Axis "${String(name)}" is not defined`);
		}

		return axis;
	}

	/**
	 * Defines a name for a given pointer.
	 */
	definePointer(name: string, pointer: Pointer): void {
		this.pointers[name] = pointer;
	}

	/**
	 * Returns a pointer with the given name (as defined by {@link definePointer}).
	 */
	getPointer(name: string): Pointer {
		const pointer = this.pointers[name];
		if (!pointer) {
			throw new Error(`Pointer "${String(name)}" is not defined`);
		}

		return pointer;
	}

	#schemas: Record<
		string,
		Record<string, Button | Axis | Pointer | GamepadHapticActuator>
	> = {};

	/**
	 * Defines a schema (ie. collection of related inputs) with a given name.
	 *
	 * Schemas can also include {@link GamepadHapticActuator}s, which can be
	 * used to trigger gamepad vibrations.
	 */
	defineSchema<
		T extends Record<
			string,
			Button | Axis | Pointer | GamepadHapticActuator
		>,
	>(name: string, schema: T): void {
		this.#schemas[name] = schema;
	}

	/**
	 * Returns a schema with the given name (as defined by {@link defineSchema}).
	 *
	 * No type-checking is done, so its up to you that the returned schema is of
	 * the expected shape.
	 */
	getSchema<
		T extends Record<
			string,
			Button | Axis | Pointer | GamepadHapticActuator
		>,
	>(name: string): T {
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
