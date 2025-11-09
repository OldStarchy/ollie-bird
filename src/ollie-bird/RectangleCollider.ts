export default class RectangleCollider {
	constructor(
		public x: number,
		public y: number,
		public width: number,
		public height: number
	) { }

	isCollidingWith(other: RectangleCollider): boolean {
		return !(
			this.x + this.width < other.x ||
			this.x > other.x + other.width ||
			this.y + this.height < other.y ||
			this.y > other.y + other.height
		);
	}

	isCollidingWithCircle(circle: {x: number; y: number; radius: number;}): boolean {
		const closestX = Math.max(this.x, Math.min(circle.x, this.x + this.width));
		const closestY = Math.max(this.y, Math.min(circle.y, this.y + this.height));

		const dx = circle.x - closestX;
		const dy = circle.y - closestY;

		return (dx * dx + dy * dy) <= (circle.radius * circle.radius);
	}
}
