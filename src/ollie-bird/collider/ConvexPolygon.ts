import type ColliderShape from './ColliderShape';
import type { Collision } from './ColliderShape';

export default class ConvexPolygon implements ColliderShape {
	readonly precedence = 4;

	constructor(readonly vertices: ReadonlyArray<{ x: number; y: number }>) {}

	checkCollision(other: ColliderShape): boolean {
		if (this.precedence < other.precedence) {
			return other.checkCollision(this);
		}

		if (other instanceof ConvexPolygon) {
			return this.checkCollisionWithConvexPolygon(other);
		}

		throw new Error('Unsupported collider shape');
	}

	getCollision(other: ColliderShape): Collision | null {
		if (this.precedence < other.precedence) {
			return other.getCollision(this);
		}

		throw new Error('Method not implemented.');

		// if (other instanceof ConvexPolygonCollider) {
		// 	return this.getCollisionWithConvexPolygon(other);
		// }

		// throw new Error('Unsupported collider shape');
	}

	private checkCollisionWithConvexPolygon(other: ConvexPolygon): boolean {
		for (const polygon of [this, other]) {
			const vertexCount = polygon.vertices.length;
			for (let i = 0; i < vertexCount; i++) {
				const currentVertex = polygon.vertices[i]!;
				const nextVertex = polygon.vertices[(i + 1) % vertexCount]!;

				// Compute the edge vector
				const edge = {
					x: nextVertex.x - currentVertex.x,
					y: nextVertex.y - currentVertex.y,
				};

				// Compute the normal vector (perpendicular to the edge)
				const normal = { x: -edge.y, y: edge.x };

				// Project both polygons onto the normal
				let minA = Infinity,
					maxA = -Infinity;
				for (const v of this.vertices) {
					const projection = v.x * normal.x + v.y * normal.y;
					minA = Math.min(minA, projection);
					maxA = Math.max(maxA, projection);
				}

				let minB = Infinity,
					maxB = -Infinity;
				for (const v of other.vertices) {
					const projection = v.x * normal.x + v.y * normal.y;
					minB = Math.min(minB, projection);
					maxB = Math.max(maxB, projection);
				}

				// Check for overlap
				if (maxA < minB || maxB < minA) {
					return false; // Found a separating axis
				}
			}
		}

		return true; // No separating axis found, polygons are colliding
	}

	//ray
	//rectangle
	//circle
}
