import type ColliderShape from './ColliderShape';
import type { Collision } from './ColliderShape';

export default class Circle implements ColliderShape {
	readonly precedence = 1;

	constructor(
		readonly x: number,
		readonly y: number,
		readonly radius: number,
	) {}

	getCollision(other: ColliderShape): Collision | null {
		if (this.precedence < other.precedence) {
			return other.getCollision(this);
		}

		if (other instanceof Circle) {
			return this.getCollisionWithCircle(other);
		}
		return null;
	}

	checkCollision(other: ColliderShape): boolean {
		if (this.precedence < other.precedence) {
			return other.checkCollision(this);
		}

		if (other instanceof Circle) {
			return this.checkCollisionWithCircle(other);
		}

		throw new Error('Unsupported collider shape');
	}

	private checkCollisionWithCircle(other: Circle): boolean {
		const dx = this.x - other.x;
		const dy = this.y - other.y;
		const distanceSquared = dx * dx + dy * dy;
		const radiusSum = this.radius + other.radius;
		return distanceSquared <= radiusSum * radiusSum;
	}

	private getCollisionWithCircle(other: Circle): Collision | null {
		const dx = other.x - this.x;
		const dy = other.y - this.y;
		const distanceSquared = dx * dx + dy * dy;
		const radiusSum = this.radius + other.radius;

		if (distanceSquared >= radiusSum * radiusSum) {
			return null;
		}

		const distance = Math.sqrt(distanceSquared);
		const overlap = radiusSum - distance;

		const displacementX = (dx / distance) * overlap;
		const displacementY = (dy / distance) * overlap;

		return {
			displacement: { x: displacementX, y: displacementY },
		};
	}
}
