import type Gamepad from './gamepad/Gamepad';
import type { GamepadCode } from './gamepad/Gamepad';

/**
 * A wrapper around the Gamepad API's {@link GamepadHapticActuator} for a given
 * gamepad slot that is safe to use even if the gamepad isn't connected.
 *
 * See
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/GamepadHapticActuator}
 * for more details.
 */
export class VibrationActuator implements GamepadHapticActuator {
	constructor(
		private input: Gamepad,
		private gamepadIndex: GamepadCode,
	) {}
	playEffect(
		type: GamepadHapticEffectType,
		params?: GamepadEffectParameters,
	): Promise<GamepadHapticsResult> {
		return (
			this.input.currentState[
				this.gamepadIndex
			]?.vibrationActuator?.playEffect(type, params) ??
			Promise.resolve('complete')
		);
	}
	reset(): Promise<GamepadHapticsResult> {
		return (
			this.input.currentState[
				this.gamepadIndex
			]?.vibrationActuator?.reset() ?? Promise.resolve('complete')
		);
	}
}
