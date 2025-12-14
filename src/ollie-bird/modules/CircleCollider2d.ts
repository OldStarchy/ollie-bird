import type GameObject from '../GameObject';
import type { Vec2Like } from '../math/Vec2';
import Collider2d from './Collider2d';

export default class CircleCollider2d extends Collider2d {
	constructor(
		owner: GameObject,
		public radius: number,
	) {
		super(owner);
	}

	checkCollision(
		position: Vec2Like,
		other: Collider2d,
		otherPosition: Vec2Like,
	): boolean {
		if (other instanceof CircleCollider2d) {
			return this.checkCollisionWithCircle(
				position,
				other,
				otherPosition,
			);
		}

		return other.checkCollision(otherPosition, this, position);
	}

	private checkCollisionWithCircle(
		position: Vec2Like,
		other: CircleCollider2d,
		otherPosition: Vec2Like,
	): boolean {
		const dx = position.x - otherPosition.x;
		const dy = position.y - otherPosition.y;
		const distanceSquared = dx * dx + dy * dy;
		const radiusSum = this.radius + other.radius;
		return distanceSquared <= radiusSum * radiusSum;
	}

	protected override renderColliderGizmo(
		context: CanvasRenderingContext2D,
	): void {
		context.beginPath();
		context.arc(
			...this.owner.transform.position.xy,
			this.radius,
			0,
			Math.PI * 2,
		);
	}
}
