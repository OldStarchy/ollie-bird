import RayCollider from '../../collider/RayCollider';
import type { Vec2Like } from '../../math/Vec2';
import Vec2 from '../../math/Vec2';
import Collider2d from '../Collider2d';

export default class RayCollider2d extends Collider2d {
	origin: Vec2Like = { x: 0, y: 0 };
	direction: Vec2Like = { x: 1, y: 0 };
	distance: number = 10;

	override getCollider() {
		const { x, y } = this.owner.transform.position;
		return new RayCollider(
			{ x: x + this.origin.x, y: y + this.origin.y },
			this.direction,
			this.distance,
		);
	}

	override doGizmoPath(context: CanvasRenderingContext2D): void {
		const { x, y } = this.owner.transform.position;
		const dir = Vec2.from(this.direction).normalize();

		context.beginPath();
		context.moveTo(x + this.origin.x, y + this.origin.y);
		context.lineTo(
			x + this.origin.x + dir.x * this.distance,
			y + this.origin.y + dir.y * this.distance,
		);
	}
}
