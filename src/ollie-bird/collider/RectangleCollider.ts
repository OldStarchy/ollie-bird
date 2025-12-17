import CircleCollider from './CircleCollider';
import type ColliderShape from './ColliderShape';

export default class RectangleCollider implements ColliderShape {
	readonly precedence = 2;

	constructor(
		readonly x: number,
		readonly y: number,
		readonly width: number,
		readonly height: number,
	) {}

	checkCollision(other: ColliderShape): boolean {
		if (this.precedence < other.precedence) {
			return other.checkCollision(this);
		}

		if (other instanceof RectangleCollider) {
			return this.checkCollisionWithRectangle(other);
		}
		if (other instanceof CircleCollider) {
			return this.checkCollisionWithCircle(other);
		}

		throw new Error('Unsupported collider shape');
	}

	private checkCollisionWithRectangle(other: RectangleCollider): boolean {
		return !(
			this.x + this.width < other.x ||
			this.x > other.x + other.width ||
			this.y + this.height < other.y ||
			this.y > other.y + other.height
		);
	}

	private checkCollisionWithCircle(circle: CircleCollider): boolean {
		const closestX = Math.max(
			this.x,
			Math.min(circle.x, this.x + this.width),
		);
		const closestY = Math.max(
			this.y,
			Math.min(circle.y, this.y + this.height),
		);

		const dx = circle.x - closestX;
		const dy = circle.y - closestY;
		return dx * dx + dy * dy <= circle.radius * circle.radius;
	}
}
