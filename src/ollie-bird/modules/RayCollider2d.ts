import type GameObject from '../GameObject';
import type { Vec2Like } from '../math/Vec2';
import Vec2 from '../math/Vec2';
import CircleCollider2d from './CircleCollider2d';
import Collider2d from './Collider2d';
import RectangleCollider2d from './RectangleCollider2d';

export default class RayCollider2d extends Collider2d {
	readonly direction: Vec2;

	constructor(
		owner: GameObject,
		direction: Vec2Like,
		public distance: number,
	) {
		super(owner);
		this.direction = new Vec2(direction);
	}

	checkCollision(
		position: Vec2Like,
		other: Collider2d,
		otherPosition: Vec2Like,
	): boolean {
		if (other instanceof RayCollider2d) {
			return this.checkCollisionWithRay(position, other, otherPosition);
		}

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

	private checkCollisionWithRay(
		position: Vec2Like,
		other: RayCollider2d,
		otherPosition: Vec2Like,
	): boolean {
		// Ray-ray intersection using parametric line equations
		const dx = otherPosition.x - position.x;
		const dy = otherPosition.y - position.y;

		const det =
			other.direction.x * this.direction.y -
			other.direction.y * this.direction.x;

		// Rays are parallel if determinant is close to zero
		if (Math.abs(det) < 1e-10) {
			return false;
		}

		const u = (dy * other.direction.x - dx * other.direction.y) / det;
		const v = (dy * this.direction.x - dx * this.direction.y) / det;

		// Check if intersection point is within both ray distances
		return u >= 0 && u <= this.distance && v >= 0 && v <= other.distance;
	}

	private checkCollisionWithRectangle(
		position: Vec2Like,
		rect: RectangleCollider2d,
		rectPosition: Vec2Like,
	): boolean {
		rectPosition = {
			x: rectPosition.x + rect.left,
			y: rectPosition.y + rect.top,
		};
		// Use slab method for ray-AABB intersection
		const dirX = this.direction.x;
		const dirY = this.direction.y;

		// Avoid division by zero
		const invDirX = dirX === 0 ? Infinity : 1 / dirX;
		const invDirY = dirY === 0 ? Infinity : 1 / dirY;

		const t1 = (rectPosition.x - position.x) * invDirX;
		const t2 = (rectPosition.x + rect.width - position.x) * invDirX;
		const t3 = (rectPosition.y - position.y) * invDirY;
		const t4 = (rectPosition.y + rect.height - position.y) * invDirY;

		const tmin = Math.max(Math.min(t1, t2), Math.min(t3, t4));
		const tmax = Math.min(Math.max(t1, t2), Math.max(t3, t4));

		// No intersection if tmax < 0 (ray points away) or tmin > tmax
		if (tmax < 0 || tmin > tmax) {
			return false;
		}

		// Check if intersection is within ray distance
		const t = tmin >= 0 ? tmin : tmax;
		return t >= 0 && t <= this.distance;
	}

	private checkCollisionWithCircle(
		position: Vec2Like,
		circle: CircleCollider2d,
		circlePosition: Vec2Like,
	): boolean {
		// Vector from ray origin to circle center
		const toCircle = new Vec2(
			circlePosition.x - position.x,
			circlePosition.y - position.y,
		);

		// Project toCircle onto ray direction
		const dot =
			toCircle.x * this.direction.x + toCircle.y * this.direction.y;

		// Find closest point on ray to circle center
		const t = Math.max(0, Math.min(this.distance, dot));
		const closestPoint = new Vec2(
			position.x + this.direction.x * t,
			position.y + this.direction.y * t,
		);

		// Check if closest point is within circle radius
		const dx = circlePosition.x - closestPoint.x;
		const dy = circlePosition.y - closestPoint.y;
		const distanceSquared = dx * dx + dy * dy;

		return distanceSquared <= circle.radius * circle.radius;
	}

	protected override renderColliderGizmo(
		context: CanvasRenderingContext2D,
	): void {
		const startX = this.owner.transform.position.x;
		const startY = this.owner.transform.position.y;
		const endX = startX + this.direction.x * this.distance;
		const endY = startY + this.direction.y * this.distance;

		context.beginPath();
		context.moveTo(startX, startY);
		context.lineTo(endX, endY);
	}
}
