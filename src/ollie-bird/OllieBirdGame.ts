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

		const vLeft = this.input.defineButton(
			'virtual.left',
			this.input.createVirtualButton('left'),
		);
		const vRight = this.input.defineButton(
			'virtual.right',
			this.input.createVirtualButton('right'),
		);
		const vUp = this.input.defineButton(
			'virtual.up',
			this.input.createVirtualButton('up'),
		);
		const vReset = this.input.defineButton(
			'virtual.reset',
			this.input.createVirtualButton('reset'),
		);

		let reset = this.input.keyboard.getButton('KeyR').merge(vReset);

		{
			const birdControls = BirdControls.fromGamepad(
				this.input.gamepads,
				0,
			);
			reset = reset.merge(birdControls.Restart);

			const keyLeft = this.input.keyboard.getButton('ArrowLeft');
			const keyRight = this.input.keyboard.getButton('ArrowRight');
			const keyUp = this.input.keyboard.getButton('ArrowUp');

			birdControls.Flap = birdControls.Flap.merge(keyUp, vUp);
			birdControls.Left = birdControls.Left.merge(keyLeft, vLeft);
			birdControls.Right = birdControls.Right.merge(keyRight, vRight);

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
