import type { Vec2Like } from '../Vec2';
import CircleCollider from './CircleCollider';
import type ICollider from './ICollider';

export default class RectangleCollider implements ICollider {
	constructor(
		public top: number,
		public left: number,
		public width: number,
		public height: number,
	) {}

	checkCollision(
		position: Vec2Like,
		other: ICollider,
		otherPosition: Vec2Like,
	): boolean {
		if (other instanceof RectangleCollider) {
			return this.checkCollisionWithRectangle(
				position,
				other,
				otherPosition,
			);
		}
		if (other instanceof CircleCollider) {
			return this.checkCollisionWithCircle(
				position,
				other,
				otherPosition,
			);
		}
		return other.checkCollision(otherPosition, this, position);
	}

	private checkCollisionWithRectangle(
		position: Vec2Like,
		other: RectangleCollider,
		otherPosition: Vec2Like,
	): boolean {
		position = {
			x: position.x + this.left,
			y: position.y + this.top,
		};
		otherPosition = {
			x: otherPosition.x + other.left,
			y: otherPosition.y + other.top,
		};
		return !(
			position.x + this.width < otherPosition.x ||
			position.x > otherPosition.x + other.width ||
			position.y + this.height < otherPosition.y ||
			position.y > otherPosition.y + other.height
		);
	}

	private checkCollisionWithCircle(
		position: Vec2Like,
		circle: CircleCollider,
		circlePosition: Vec2Like,
	): boolean {
		position = {
			x: position.x + this.left,
			y: position.y + this.top,
		};

		const closestX = Math.max(
			position.x,
			Math.min(circlePosition.x, position.x + this.width),
		);
		const closestY = Math.max(
			position.y,
			Math.min(circlePosition.y, position.y + this.height),
		);

		const dx = circlePosition.x - closestX;
		const dy = circlePosition.y - closestY;
		return dx * dx + dy * dy <= circle.radius * circle.radius;
	}
}
