import { BirdControls } from './BirdControls';
import BaseGame from './core/BaseGame';
import GameObject from './core/GameObject';
import LevelEditor from './modules/LevelEditor';
import LevelGameplayManager from './modules/LevelGameplayManager';

export const Bindings = {
	Restart: 'Restart',
} as const;

class OllieBirdGame extends BaseGame {
	constructor() {
		super();

		let reset = this.input.keyboard.getButton('KeyR');

		{
			const birdControls = BirdControls.fromGamepad(
				this.input.gamepads,
				0,
			);
			reset = reset.merge(birdControls.Restart);

			const keyLeft = this.input.keyboard.getButton('ArrowLeft');
			const keyRight = this.input.keyboard.getButton('ArrowRight');
			const keyUp = this.input.keyboard.getButton('ArrowUp');

			birdControls.Flap = birdControls.Flap.merge(keyUp);
			birdControls.Left = birdControls.Left.merge(keyLeft);
			birdControls.Right = birdControls.Right.merge(keyRight);

			this.input.defineSchema<BirdControls>('Player 1', birdControls);
		}

		{
			const birdControls = BirdControls.fromGamepad(
				this.input.gamepads,
				1,
			);
			reset = reset.merge(birdControls.Restart);

			const keyUp = this.input.keyboard.getButton('KeyW');
			const keyLeft = this.input.keyboard.getButton('KeyA');
			const keyRight = this.input.keyboard.getButton('KeyD');

			birdControls.Flap = birdControls.Flap.merge(keyUp);
			birdControls.Left = birdControls.Left.merge(keyLeft);
			birdControls.Right = birdControls.Right.merge(keyRight);

			this.input.defineSchema<BirdControls>('Player 2', birdControls);
		}

		this.input.defineButton(Bindings.Restart, reset);
	}

	override preStart(): void {
		this.color = 'SkyBlue';
		const editor = this.spawn(GameObject);
		editor.layer = 200;
		editor.addModule(LevelEditor);

		const levelGameplayManager = this.spawn(GameObject);
		levelGameplayManager.addModule(LevelGameplayManager);
	}
}

export default OllieBirdGame;
