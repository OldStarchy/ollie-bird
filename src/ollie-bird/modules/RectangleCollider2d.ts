import type GameObject from '../GameObject';
import type { Vec2Like } from '../math/Vec2';
import CircleCollider2d from './CircleCollider2d';
import Collider2d from './Collider2d';

export default class RectangleCollider2d extends Collider2d {
	constructor(
		owner: GameObject,
		public top: number,
		public left: number,
		public width: number,
		public height: number,
	) {
		super(owner);
	}

	checkCollision(
		position: Vec2Like,
		other: Collider2d,
		otherPosition: Vec2Like,
	): boolean {
		if (other instanceof RectangleCollider2d) {
			return this.checkCollisionWithRectangle(
				position,
				other,
				otherPosition,
			);
		}
		if (other instanceof CircleCollider2d) {
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
		other: RectangleCollider2d,
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
		circle: CircleCollider2d,
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

	protected override renderColliderGizmo(
		context: CanvasRenderingContext2D,
	): void {
		context.beginPath();
		context.rect(
			this.owner.transform.position.x + this.left,
			this.owner.transform.position.y + this.top,
			this.width,
			this.height,
		);
	}
}
