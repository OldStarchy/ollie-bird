import type { Vec2Like } from '../math/Vec2';
import Vec2 from '../math/Vec2';
import CircleCollider from './CircleCollider';
import type ColliderShape from './ColliderShape';
import RectangleCollider from './RectangleCollider';

export default class RayCollider implements ColliderShape {
	readonly precedence = 3;

	constructor(
		readonly origin: Readonly<Vec2Like>,
		readonly direction: Readonly<Vec2Like>,
		readonly distance: number,
	) {}

	checkCollision(other: ColliderShape): boolean {
		if (this.precedence < other.precedence) {
			return other.checkCollision(this);
		}

		if (other instanceof RayCollider) {
			return this.checkCollisionWithRay(other);
		}

		if (other instanceof RectangleCollider) {
			return this.checkCollisionWithRectangle(other);
		}

		if (other instanceof CircleCollider) {
			return this.checkCollisionWithCircle(other);
		}

		throw new Error('Unsupported collider shape');
	}

	private checkCollisionWithRay(other: RayCollider): boolean {
		// Ray-ray intersection using parametric line equations
		const dx = other.origin.x - this.origin.x;
		const dy = other.origin.y - this.origin.y;

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

	private checkCollisionWithRectangle(rect: RectangleCollider): boolean {
		// Use slab method for ray-AABB intersection
		const dirX = this.direction.x;
		const dirY = this.direction.y;

		// Avoid division by zero
		const invDirX = dirX === 0 ? Infinity : 1 / dirX;
		const invDirY = dirY === 0 ? Infinity : 1 / dirY;

		const t1 = (rect.x - this.origin.x) * invDirX;
		const t2 = (rect.x + rect.width - this.origin.x) * invDirX;
		const t3 = (rect.y - this.origin.y) * invDirY;
		const t4 = (rect.y + rect.height - this.origin.y) * invDirY;

		const tmin = Math.max(Math.min(t1, t2), Math.min(t3, t4));
		const tmax = Math.min(Math.max(t1, t2), Math.max(t3, t4));

		// No intersection if tmax < 0 (ray points away) or tmin > tmax
		if (tmax < 0 || tmin > tmax) {
			return false;
		}

		// Check if intersection is within ray distance
		// If tmin < 0, ray origin is inside the box, so use tmax
		// Otherwise use tmin (first intersection point)
		const t = tmin < 0 ? tmax : tmin;
		return t >= 0 && t <= this.distance;
	}

	private checkCollisionWithCircle(circle: CircleCollider): boolean {
		// Normalize direction vector for proper distance calculations
		const dirLength = Math.sqrt(
			this.direction.x * this.direction.x +
				this.direction.y * this.direction.y,
		);
		const dirX = this.direction.x / dirLength;
		const dirY = this.direction.y / dirLength;

		// Vector from ray origin to circle center
		const toCircle = new Vec2(
			circle.x - this.origin.x,
			circle.y - this.origin.y,
		);

		// Project toCircle onto normalized ray direction
		const dot = toCircle.x * dirX + toCircle.y * dirY;

		// Find closest point on ray to circle center
		const t = Math.max(0, Math.min(this.distance, dot));
		const closestPoint = new Vec2(
			this.origin.x + dirX * t,
			this.origin.y + dirY * t,
		);

		// Check if closest point is within circle radius
		const dx = circle.x - closestPoint.x;
		const dy = circle.y - closestPoint.y;
		const distanceSquared = dx * dx + dy * dy;

		return distanceSquared <= circle.radius * circle.radius;
	}
}
