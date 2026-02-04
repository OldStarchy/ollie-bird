import { fromEvent, Subject } from 'rxjs';
import { InputAxis } from './InputAxis';
import { InputButton } from './InputButton';
import { PollingButton } from './PollingButton';

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
	getButton(gamepadIndex: number, buttonIndex: number): InputButton {
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
		gamepadIndex: number,
		buttonIndex: number,
	): InputButton {
		const button = new GamepadButton(gamepadIndex, buttonIndex);

		this.#buttons.push(new WeakRef(button));

		return button;
	}

	getAxis(
		gamepadIndex: number,
		axisIndex: number,
		deadzone: number = 0.05,
	): InputAxis {
		return new GamepadAxis(gamepadIndex, axisIndex, deadzone);
	}

	getAxisButton(
		gamepadIndex: number,
		axisIndex: number,
		threshold: number,
		inverted: boolean = false,
	): InputButton {
		const axis = this.getAxis(gamepadIndex, axisIndex, 0) as GamepadAxis;
		axis.inverted = inverted;
		const button = new GamepadAxisButton(axis, threshold);

		this.#buttons.push(new WeakRef(button));

		return button;
	}

	#buttons: WeakRef<{ step(): void }>[] = [];

	step() {
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

class GamepadAxisButton extends PollingButton {
	constructor(axis: GamepadAxis, threshold: number) {
		super(() => axis.valueUnclipped > threshold);
	}
}
