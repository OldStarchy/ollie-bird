import { LAYER_FOREGROUND, TAG_LEVEL_STRUCTURE } from '../const';
import GameObject from '../GameObject';
import Bird from './Bird';

export default class SpawnPoint extends GameObject {
	layer = LAYER_FOREGROUND;

	protected override initialize() {
		this.onGameEvent('gameStart', () => {
			this.game
				.spawn(Bird)
				.transform.position.set(...this.transform.position.xy);
		});
		this.tags.add(TAG_LEVEL_STRUCTURE);
	}

	protected override render(context: CanvasRenderingContext2D) {
		context.beginPath();
		context.arc(...this.transform.position.xy, 20, 0, Math.PI * 2);
		context.strokeStyle = 'yellow';
		context.setLineDash([5, 5]);
		context.stroke();
		context.setLineDash([]);
	}
}
