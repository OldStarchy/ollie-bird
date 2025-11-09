import { TAG_LEVEL_STRUCTURE } from '../const';
import GameObject from '../GameObject';
import type IGame from '../IGame';
import Bird from './Bird';

export default class SpawnPoint extends GameObject {
	layer = GameObject.LAYER_FOREGROUND;

	constructor(game: IGame, public x: number, public y: number) {
		super(game);
		this.onGameEvent('gameStart', () => {
			const bird = new Bird(this.game);
			bird.position.set(this.x, this.y);
			this.game.objects.add(bird);
		});
		this.tags.add(TAG_LEVEL_STRUCTURE);
	}

	step() {}
	render(context: CanvasRenderingContext2D) {
		context.beginPath();
		context.arc(this.x, this.y, 20, 0, Math.PI * 2);
		context.strokeStyle = 'yellow';
		context.setLineDash([5, 5]);
		context.stroke();
		context.setLineDash([]);
	}
}
