import Circle from './Circle';
import type ColliderShape from './ColliderShape';
import type { Collision } from './ColliderShape';

export default class Rectangle implements ColliderShape {
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

		if (other instanceof Rectangle) {
			return this.checkCollisionWithRectangle(other);
		}
		if (other instanceof Circle) {
			return this.checkCollisionWithCircle(other);
		}

		throw new Error('Unsupported collider shape');
	}

	getCollision(other: ColliderShape): Collision | null {
		if (this.precedence < other.precedence) {
			return other.getCollision(this);
		}

		throw new Error('Method not implemented.');

		// if (other instanceof RectangleCollider) {
		// 	return this.getCollisionWithRectangle(other);
		// }
		// if (other instanceof Circle) {
		// 	return this.getCollisionWithCircle(other);
		// }

		// throw new Error('Unsupported collider shape');
	}

	private checkCollisionWithRectangle(other: Rectangle): boolean {
		return !(
			this.x + this.width < other.x ||
			this.x > other.x + other.width ||
			this.y + this.height < other.y ||
			this.y > other.y + other.height
		);
	}

	private checkCollisionWithCircle(circle: Circle): boolean {
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
