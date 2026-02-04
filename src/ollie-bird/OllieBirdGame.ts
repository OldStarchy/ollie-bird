import type { BirdControls } from './BirdControls';
import BaseGame from './core/BaseGame';
import {
	XboxGamepadAxisMap,
	XboxGamepadButtonMap,
} from './core/input/GamepadInput';
import LevelEditor from './game-object/LevelEditor';

export const Bindings = {
	Flap: 'Flap',
	Left: 'Left',
	Right: 'Right',

	Restart: 'Restart',
} as const;

class OllieBirdGame extends BaseGame {
	constructor() {
		super();

		const xLeft = this.input.gamepads.getAxisButton(
			0,
			XboxGamepadAxisMap.LeftStickX,
			0.3,
			true,
		);
		const xRight = this.input.gamepads.getAxisButton(
			0,
			XboxGamepadAxisMap.LeftStickX,
			0.3,
		);
		const gamepadA = this.input.gamepads.getButton(
			0,
			XboxGamepadButtonMap.A,
		);
		const gamepadX = this.input.gamepads.getButton(
			0,
			XboxGamepadButtonMap.X,
		);
		const dPadLeft = this.input.gamepads.getButton(
			0,
			XboxGamepadButtonMap.DPadLeft,
		);
		const dPadRight = this.input.gamepads.getButton(
			0,
			XboxGamepadButtonMap.DPadRight,
		);

		const keyLeft = this.input.keyboard.getButton('ArrowLeft');
		const keyRight = this.input.keyboard.getButton('ArrowRight');
		const keyUp = this.input.keyboard.getButton('ArrowUp');
		const keyR = this.input.keyboard.getButton('KeyR');

		const birdControls: BirdControls = {
			Flap: this.input.anyButton([gamepadA, keyUp]),
			Left: this.input.anyButton([xLeft, keyLeft, dPadLeft]),
			Right: this.input.anyButton([xRight, keyRight, dPadRight]),
			Restart: this.input.anyButton([gamepadX, keyR]),
		};

		this.input.defineSchema<BirdControls>('Player 1', birdControls);
		this.input.defineSchema<BirdControls>('Player 2', {
			Flap: this.input.keyboard.getButton('KeyW'),
			Left: this.input.keyboard.getButton('KeyA'),
			Right: this.input.keyboard.getButton('KeyD'),
			Restart: this.input.keyboard.getButton('KeyR'),
		});

		this.input.defineButton(Bindings.Restart, birdControls.Restart);
	}

	override preStart(): void {
		this.color = 'SkyBlue';
		this.spawn(LevelEditor);
	}
}

export default OllieBirdGame;
