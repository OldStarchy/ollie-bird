import GameObject from '../GameObject';
import type IGame from '../IGame';

export default class Explosion extends GameObject {
	layer = GameObject.LAYER_FOREGROUND;
	constructor(
		game: IGame,
		private x: number,
		private y: number,
		private radius: number,
		private maxRadius: number,
		private expansionRate: number,
	) {
		super(game);
	}

	step(): void {
		if (this.radius < this.maxRadius) {
			this.radius += this.expansionRate;
		} else {
			this.game.objects.remove(this);
		}
	}

	render(context: CanvasRenderingContext2D): void {
		context.strokeStyle = 'orange';
		context.beginPath();
		context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
		context.lineWidth = 3;
		context.stroke();
		context.lineWidth = 1;
	}
}
