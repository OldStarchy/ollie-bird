import { fromEvent, Subject } from 'rxjs';
import { Axis } from '../Axis';
import { Button } from '../Button';
import { HalfAxis } from '../HalfAxis';
import { GamepadAxis } from './GamepadAxis';
import { GamepadButton } from './GamepadButton';
import { GamepadButtonAxis } from './GamepadButtonAxis';

export type GamepadCode = 0 | 1 | 2 | 3;
export type GamepadButtonCode =
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
export type GamepadAxisCode = 0 | 1 | 2 | 3;

export default class Gamepad {
	previousState: (globalThis.Gamepad | null)[] = [null, null, null, null];
	currentState: (globalThis.Gamepad | null)[] = [null, null, null, null];

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

	#buttonCache = new Map<string, Button>();
	getButton(
		gamepadIndex: GamepadCode,
		buttonIndex: GamepadButtonCode,
	): Button {
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
	): Button {
		return new GamepadButton(this, gamepadIndex, buttonIndex);
	}

	/**
	 * Gets an axis input with a range from -1 to 1
	 */
	getAxis(
		gamepadIndex: GamepadCode,
		axisIndex: GamepadAxisCode,
		deadzone: number = 0.05,
	): Axis {
		return new GamepadAxis(this, gamepadIndex, axisIndex, deadzone);
	}

	/**
	 * Some buttons (eg. triggers) have a value from 0 to 1.
	 * This method gets an axis for such buttons, keeping that range.
	 */
	getButtonAxis(
		gamepadIndex: GamepadCode,
		buttonIndex: GamepadButtonCode,
	): HalfAxis {
		return new GamepadButtonAxis(this, gamepadIndex, buttonIndex);
	}

	step() {
		this.previousState = this.currentState;
		this.currentState = navigator.getGamepads();
	}
}
