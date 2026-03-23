import { introCinematic } from './assets/intro-cinematic';
import { BirdControls } from './BirdControls';
import { TAG_EDITOR_OBJECT } from './const';
import BaseGame from './core/BaseGame';
import Cinematic from './modules/Cinematic';
import CinematicPlayerControl from './modules/CinematicPlayerControl';

// Eager-load all the modules so that they're registered in the serializer and available for spawning prefabs
import.meta.glob('./modules/**/*.ts', { eager: true });

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
		this.spawnPrefab({
			version: 1,
			layer: 200,
			tags: [TAG_EDITOR_OBJECT],
			name: 'Level Editor',
			modules: [{ $type: 'LevelEditor' }],
		});

		this.spawnPrefab({
			version: 1,
			tags: [TAG_EDITOR_OBJECT],
			name: 'Level Gameplay Manager',
			modules: [{ $type: 'LevelGameplayManager' }],
		});

		const ic = this.spawnPrefab({
			version: 1,
			layer: 1000,
			name: 'Intro Cinematic',
		});
		ic.addModule(Cinematic, introCinematic);
		ic.addModule(CinematicPlayerControl);
	}
}

export default OllieBirdGame;
