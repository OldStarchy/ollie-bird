import CircleCollider from './CircleCollider';
import type ColliderShape from './ColliderShape';
import RayCollider from './RayCollider';
import RectangleCollider from './RectangleCollider';

export default class PointCollider implements ColliderShape {
	readonly precedence = 4;

	constructor(
		readonly x: number,
		readonly y: number,
	) {}

	checkCollision(other: ColliderShape): boolean {
		if (this.precedence < other.precedence) {
			return other.checkCollision(this);
		}

		if (other instanceof PointCollider) {
			return this.x === other.x && this.y === other.y;
		}

		if (other instanceof RayCollider) {
			return false;
		}

		if (other instanceof RectangleCollider) {
			return this.checkCollisionWithRectangle(other);
		}

		if (other instanceof CircleCollider) {
			return this.checkCollisionWithCircle(other);
		}

		throw new Error('Unsupported collider shape');
	}

	private checkCollisionWithRectangle(rect: RectangleCollider): boolean {
		return (
			this.x >= rect.x &&
			this.x <= rect.x + rect.width &&
			this.y >= rect.y &&
			this.y <= rect.y + rect.height
		);
	}

	private checkCollisionWithCircle(circle: CircleCollider): boolean {
		const dx = this.x - circle.x;
		const dy = this.y - circle.y;
		return dx * dx + dy * dy <= circle.radius * circle.radius;
	}
}
