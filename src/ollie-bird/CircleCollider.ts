import type RectangleCollider from './RectangleCollider';

export default class CircleCollider {
	constructor(
		public x: number,
		public y: number,
		public radius: number,
	) {}

	isCollidingWith(other: CircleCollider): boolean {
		const dx = this.x - other.x;
		const dy = this.y - other.y;
		const distanceSquared = dx * dx + dy * dy;
		const radiusSum = this.radius + other.radius;
		return distanceSquared <= radiusSum * radiusSum;
	}

	isCollidingWithRectangle(rect: RectangleCollider): boolean {
		return rect.isCollidingWithCircle(this);
	}
}
