import type { Vec2Like } from '../Vec2';
import type ICollider from './ICollider';

export default class CircleCollider implements ICollider {
	constructor(public radius: number) {}

	checkCollision(
		position: Vec2Like,
		other: ICollider,
		otherPosition: Vec2Like,
	): boolean {
		if (other instanceof CircleCollider) {
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
		other: CircleCollider,
		otherPosition: Vec2Like,
	): boolean {
		const dx = position.x - otherPosition.x;
		const dy = position.y - otherPosition.y;
		const distanceSquared = dx * dx + dy * dy;
		const radiusSum = this.radius + other.radius;
		return distanceSquared <= radiusSum * radiusSum;
	}
}
