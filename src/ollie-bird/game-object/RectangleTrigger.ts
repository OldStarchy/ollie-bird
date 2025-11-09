import GameObject from '../GameObject';
import type IGame from '../IGame';
import RectangleCollider from '../RectangleCollider';

class RectangleTrigger extends GameObject {
	layer = 0;
	style: string | null = null;
	constructor(
		game: IGame,
		public x: number,
		public y: number,
		public width: number,
		public height: number,
	) {
		super(game);
		this.init();
	}

	init() {}

	step(): void {}

	render(context: CanvasRenderingContext2D): void {
		if (this.style !== null) {
			context.fillStyle = this.style;
			context.fillRect(this.x, this.y, this.width, this.height);
		}
	}

	getCollider(): RectangleCollider {
		return new RectangleCollider(this.x, this.y, this.width, this.height);
	}
}

export default RectangleTrigger;
