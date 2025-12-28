import Circle from '../collider/Circle';
import type { Vec2Like } from '../Vec2';
import Collider2d from './Collider2d';

export default class CircleCollider2d extends Collider2d {
	center: Vec2Like = { x: 0, y: 0 };
	radius: number = 10;

	override getCollider() {
		const { x, y } = this.owner.transform.position;
		return new Circle(x + this.center.x, y + this.center.y, this.radius);
	}

	override doGizmoPath(context: CanvasRenderingContext2D): void {
		const { x, y } = this.owner.transform.position;
		context.beginPath();
		context.arc(
			x + this.center.x,
			y + this.center.y,
			this.radius,
			0,
			Math.PI * 2,
		);
	}
}
