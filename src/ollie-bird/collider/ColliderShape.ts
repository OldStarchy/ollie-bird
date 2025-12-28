export interface Collision {
	/**
	 * The minimum displacement that would separate the two colliders.
	 */
	readonly displacement: { readonly x: number; readonly y: number };
}

export default interface ColliderShape {
	readonly precedence: number;

	checkCollision(other: ColliderShape): boolean;
	getCollision(other: ColliderShape): Collision | null;
}
