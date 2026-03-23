import scene1 from '../assets/cinematics/scene1.png';
import scene2 from '../assets/cinematics/scene2.png';
import scene3 from '../assets/cinematics/scene3.png';
import scene4 from '../assets/cinematics/scene4.png';
import { BirdControls } from './BirdControls';
import { TAG_EDITOR_OBJECT } from './const';
import BaseGame from './core/BaseGame';
import CinematicManager from './modules/CinematicManager';
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
		const editor = this.spawn();
		editor.layer = 200;
		editor.addModule(LevelEditor);
		editor.tags.add(TAG_EDITOR_OBJECT);
		editor.name = 'Level Editor';

		const levelGameplayManager = this.spawn();
		levelGameplayManager.addModule(LevelGameplayManager);
		levelGameplayManager.tags.add(TAG_EDITOR_OBJECT);
		levelGameplayManager.name = 'Level Gameplay Manager';

		const cinematicObj = this.spawn();
		cinematicObj.layer = 1000;
		cinematicObj.name = 'Cinematic Manager';
		const cinematicManager = cinematicObj.addModule(CinematicManager);

		this.waitFrames(1).then(() => {
			cinematicManager.play([
				{
					imageSrc: scene1,
					duration: 5,
					caption: 'A world unlike any other…',
					kenBurns: {
						startRect: { x: 0, y: 0, w: 1, h: 1 },
						endRect: { x: 0.05, y: 0.02, w: 0.9, h: 0.9 },
					},
				},
				{
					imageSrc: scene2,
					duration: 5,
					caption: 'Darkness spread across the land.',
					kenBurns: {
						startRect: { x: 0.05, y: 0.02, w: 0.9, h: 0.9 },
						endRect: { x: 0, y: 0, w: 1, h: 1 },
					},
				},
				{
					imageSrc: scene3,
					duration: 5,
					caption: 'But one small bird refused to give up.',
					kenBurns: {
						startRect: { x: 0, y: 0, w: 1, h: 1 },
						endRect: { x: 0.1, y: 0.05, w: 0.8, h: 0.85 },
					},
				},
				{
					imageSrc: scene4,
					duration: 5,
					caption: 'The adventure begins…',
					kenBurns: {
						startRect: { x: 0.1, y: 0.05, w: 0.8, h: 0.85 },
						endRect: { x: 0, y: 0, w: 1, h: 1 },
					},
				},
			]);
		});
	}
}

export default OllieBirdGame;
