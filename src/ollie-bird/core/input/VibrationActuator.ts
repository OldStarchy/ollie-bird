import type { GamepadCode } from './gamepad/Gamepad';

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
