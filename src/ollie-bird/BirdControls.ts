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
}

// eslint-disable-next-line @typescript-eslint/no-namespace
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
		};
	}

	export function merge(a: BirdControls, b: BirdControls): BirdControls {
		return {
			Flap: a.Flap.merge(b.Flap),
			Left: a.Left.merge(b.Left),
			Right: a.Right.merge(b.Right),
			Restart: a.Restart.merge(b.Restart),
		};
	}
}
