import RectangleCollider from '../collider/RectangleCollider';
import Collider2d from './Collider2d';

export default class RectangleCollider2d extends Collider2d {
	top: number = 0;
	left: number = 0;
	width: number = 10;
	height: number = 10;

	override getCollider() {
		const { x, y } = this.owner.transform.position;
		return new RectangleCollider(
			x + this.left,
			y + this.top,
			this.width,
			this.height,
		);
	}

	override doGizmoPath(context: CanvasRenderingContext2D): void {
		const { x, y } = this.owner.transform.position;
		context.beginPath();
		context.rect(x + this.left, y + this.top, this.width, this.height);
	}
}
