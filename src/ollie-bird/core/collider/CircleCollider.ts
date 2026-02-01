import type ColliderShape from './ColliderShape';

export default class CircleCollider implements ColliderShape {
	readonly precedence = 1;

	constructor(
		readonly x: number,
		readonly y: number,
		readonly radius: number,
	) {}

	checkCollision(other: ColliderShape): boolean {
		if (this.precedence < other.precedence) {
			return other.checkCollision(this);
		}

		if (other instanceof CircleCollider) {
			return this.checkCollisionWithCircle(other);
		}

		throw new Error('Unsupported collider shape');
	}

	private checkCollisionWithCircle(other: CircleCollider): boolean {
		const dx = this.x - other.x;
		const dy = this.y - other.y;
		const distanceSquared = dx * dx + dy * dy;
		const radiusSum = this.radius + other.radius;
		return distanceSquared <= radiusSum * radiusSum;
	}
}
