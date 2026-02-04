import { fromEvent, Subject } from 'rxjs';
import { InputAxis } from './InputAxis';
import { InputButton } from './InputButton';
import { PollingButton } from './PollingButton';

type GamepadCode = 0 | 1 | 2 | 3;
type GamepadButtonCode =
	| 0
	| 1
	| 2
	| 3
	| 4
	| 5
	| 6
	| 7
	| 8
	| 9
	| 10
	| 11
	| 12
	| 13
	| 14
	| 15
	| 16;
type GamepadAxisCode = 0 | 1 | 2 | 3;

export default class GamepadInput {
	#gamepadsChanged$ = new Subject<void>();
	gamepadsChanged$ = this.#gamepadsChanged$.asObservable();

	attachTo(element: Window): Disposable {
		using ds = new DisposableStack();

		ds.use(
			fromEvent<GamepadEvent>(element, 'gamepadconnected').subscribe(
				(_e) => {
					this.#gamepadsChanged$.next();
				},
			),
		);

		ds.use(
			fromEvent<GamepadEvent>(element, 'gamepaddisconnected').subscribe(
				(_e) => {
					this.#gamepadsChanged$.next();
				},
			),
		);

		return ds.move();
	}

	#buttonCache = new Map<string, InputButton>();
	getButton(
		gamepadIndex: GamepadCode,
		buttonIndex: GamepadButtonCode,
	): InputButton {
		const key = `${gamepadIndex}:${buttonIndex}`;
		if (!this.#buttonCache.has(key)) {
			this.#buttonCache.set(
				key,
				this.createButton(gamepadIndex, buttonIndex),
			);
		}

		return this.#buttonCache.get(key)!;
	}

	private createButton(
		gamepadIndex: GamepadCode,
		buttonIndex: GamepadButtonCode,
	): InputButton {
		const button = new GamepadButton(gamepadIndex, buttonIndex);

		this.#buttons.push(new WeakRef(button));

		return button;
	}

	/**
	 * Gets an axis input with a range from -1 to 1
	 */
	getAxis(
		gamepadIndex: GamepadCode,
		axisIndex: GamepadAxisCode,
		deadzone: number = 0.05,
	): InputAxis {
		return new GamepadAxis(gamepadIndex, axisIndex, deadzone);
	}

	/**
	 * Turns an axis into a button based on a threshold
	 */
	getAxisButton(
		gamepadIndex: GamepadCode,
		axisIndex: GamepadAxisCode,
		threshold: number,
		inverted: boolean = false,
	): InputButton {
		const axis = this.getAxis(gamepadIndex, axisIndex, 0) as GamepadAxis;
		axis.inverted = inverted;
		const button = new GamepadAxisButton(axis, threshold);

		this.#buttons.push(new WeakRef(button));

		return button;
	}

	/**
	 * Some buttons (eg. trggers) have a value from 0 to 1.
	 * This method gets an axis for such buttons, keeping that range.
	 */
	getButtonAxis(
		gamepadIndex: GamepadCode,
		buttonIndex: GamepadButtonCode,
	): InputAxis {
		return new GamepadButtonAxis(gamepadIndex, buttonIndex);
	}

	#buttons: WeakRef<{ step(): void }>[] = [];

	step() {
		// TODO(#44): don't recreate array every frame
		this.#buttons = this.#buttons.filter((ref) => {
			const button = ref.deref();

			if (button === undefined) return false;

			button.step();
			return true;
		});
	}
}

export const XboxGamepadButtonMap = {
	A: 0,
	B: 1,
	X: 2,
	Y: 3,
	LeftBumper: 4,
	RightBumper: 5,
	LeftTrigger: 6,
	RightTrigger: 7,
	Back: 8,
	Start: 9,
	LeftStick: 10,
	RightStick: 11,
	DPadUp: 12,
	DPadDown: 13,
	DPadLeft: 14,
	DPadRight: 15,
	Home: 16,
} as const;

export const XboxGamepadAxisMap = {
	/**
	 * Right +ve
	 */
	LeftStickX: 0,
	/**
	 * Down +ve
	 */
	LeftStickY: 1,
	/**
	 * Right +ve
	 */
	RightStickX: 2,
	/**
	 * Down +ve
	 */
	RightStickY: 3,
} as const;

class GamepadButton extends PollingButton {
	constructor(
		private gamepadIndex: number,
		buttonIndex: number,
	) {
		super(() => this.gamepad?.buttons[buttonIndex]?.pressed ?? false);
	}

	private get gamepad(): Gamepad | null {
		return navigator.getGamepads()[this.gamepadIndex] ?? null;
	}
}

class GamepadAxis extends InputAxis {
	accessor inverted = false;
	accessor deadzone: number;

	constructor(
		private gamepadIndex: number,
		private axisIndex: number,
		deadzone: number = 0.05,
	) {
		super();
		this.deadzone = deadzone;
	}

	get gamepad(): Gamepad | null {
		return navigator.getGamepads()[this.gamepadIndex] ?? null;
	}

	get valueRaw(): number {
		return this.gamepad?.axes[this.axisIndex] ?? 0;
	}

	get valueUnclipped(): number {
		return this.valueRaw * (this.inverted ? -1 : 1);
	}

	get value(): number {
		const val = this.valueUnclipped;
		if (Math.abs(val) < this.deadzone) return 0;
		return val;
	}
}

//TODO(#44): improve axis value / threashold / deadzone handling
class GamepadAxisButton extends PollingButton {
	constructor(axis: GamepadAxis, threshold: number) {
		super(() => axis.valueUnclipped > threshold);
	}
}

class GamepadButtonAxis extends InputAxis {
	accessor inverted = false;
	accessor deadzone: number;

	constructor(
		private gamepadIndex: number,
		private buttonPositiveIndex: number,
	) {
		super();
		this.deadzone = 0;
	}

	get gamepad(): Gamepad | null {
		return navigator.getGamepads()[this.gamepadIndex] ?? null;
	}

	get value(): number {
		const button = this.gamepad?.buttons[this.buttonPositiveIndex];
		if (!button) return 0;
		const unclipped = this.inverted ? 1 - button.value : button.value;
		if (Math.abs(unclipped) < this.deadzone) return 0;
		return unclipped;
	}
}
