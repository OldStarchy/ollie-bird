export default interface ColliderShape {
	readonly precedence: number;

	checkCollision(other: ColliderShape): boolean;
}
