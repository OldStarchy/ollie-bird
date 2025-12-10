import { GRID_SIZE, LAYER_FOREGROUND, TAG_LEVEL_STRUCTURE } from '../const';
import GameObject from '../GameObject';
import Baddie from './Baddie';

export default class BaddieSpawner extends GameObject {
	layer = LAYER_FOREGROUND;

	protected override initialize(): void {
		this.tags.add(TAG_LEVEL_STRUCTURE);
		this.onGameEvent('gameStart', () => {
			const baddie = this.game.spawn(Baddie);
			baddie.transform.position.set(this.transform.position);
		});
	}

	protected override render(context: CanvasRenderingContext2D) {
		context.beginPath();
		context.rect(
			this.transform.position.x,
			this.transform.position.y + GRID_SIZE / 2,
			GRID_SIZE,
			GRID_SIZE / 2,
		);
		context.strokeStyle = 'red';
		context.setLineDash([5, 5]);
		context.stroke();
		context.setLineDash([]);
	}
}
