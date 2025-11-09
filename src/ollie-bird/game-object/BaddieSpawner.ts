import { GRID_SIZE, TAG_LEVEL_STRUCTURE } from '../const';
import GameObject from '../GameObject';
import type IGame from '../IGame';
import Baddie from './Baddie';

export default class BaddieSpawner extends GameObject {
	layer = GameObject.LAYER_FOREGROUND;

	constructor(game: IGame, public x: number, public y: number) {
		super(game);
		this.tags.add(TAG_LEVEL_STRUCTURE);
		this.onGameEvent('gameStart', () => {
			const baddie = new Baddie(this.game, this.x, this.y);
			this.game.objects.add(baddie);
		});
	}

	step() {}
	render(context: CanvasRenderingContext2D) {
		context.beginPath();
		context.rect(this.x, this.y + GRID_SIZE / 2, GRID_SIZE, GRID_SIZE / 2);
		context.strokeStyle = 'red';
		context.setLineDash([5, 5]);
		context.stroke();
		context.setLineDash([]);
	}
}
