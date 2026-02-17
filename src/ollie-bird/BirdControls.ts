import { Button } from './core/input/Button';
import type Gamepad from './core/input/gamepad/Gamepad';
import type { GamepadCode } from './core/input/gamepad/Gamepad';
import { XboxGamepadAxisMap } from './core/input/gamepad/XboxGamepadAxisMap';
import { XboxGamepadButtonMap } from './core/input/gamepad/XboxGamepadButtonMap';

export interface BirdControls {
	Flap: Button;
	Left: Button;
	Right: Button;

	Restart: Button;

	Vibrate?: GamepadHapticActuator;
}

export namespace BirdControls {
	export function fromGamepad(
		gamepad: Gamepad,
		gamepadIndex: GamepadCode,
	): BirdControls {
		const [xRight, xLeft] = gamepad
			.getAxis(gamepadIndex, XboxGamepadAxisMap.LeftStickX)
			.splitHalfAxisButtons(0.3);
		const gamepadA = gamepad.getButton(
			gamepadIndex,
			XboxGamepadButtonMap.A,
		);
		const gamepadX = gamepad.getButton(
			gamepadIndex,
			XboxGamepadButtonMap.X,
		);
		const dPadLeft = gamepad.getButton(
			gamepadIndex,
			XboxGamepadButtonMap.DPadLeft,
		);
		const dPadRight = gamepad.getButton(
			gamepadIndex,
			XboxGamepadButtonMap.DPadRight,
		);

		return {
			Flap: gamepadA,
			Left: dPadLeft.merge(xLeft),
			Right: dPadRight.merge(xRight),
			Restart: gamepadX,
			Vibrate: gamepad.getVibrationActuator(gamepadIndex),
		};
	}
}
