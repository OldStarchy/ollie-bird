import type { GamepadCode } from './gamepad/Gamepad';

/**
 * A wrapper around the Gamepad API's {@link GamepadHapticActuator} for a given
 * gamepad index that is safe to use even if the gamepad isn't connected.
 *
 * See
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/GamepadHapticActuator}
 * for more details.
 */
export class VibrationActuator implements GamepadHapticActuator {
	constructor(private gamepadIndex: GamepadCode) {}
	playEffect(
		type: GamepadHapticEffectType,
		params?: GamepadEffectParameters,
	): Promise<GamepadHapticsResult> {
		return (
			navigator
				.getGamepads()
				[
					this.gamepadIndex
				]?.vibrationActuator?.playEffect(type, params) ??
			Promise.resolve('complete')
		);
	}
	reset(): Promise<GamepadHapticsResult> {
		return (
			navigator
				.getGamepads()
				[this.gamepadIndex]?.vibrationActuator?.reset() ??
			Promise.resolve('complete')
		);
	}
}
