import RectangleCollider from '../../collider/RectangleCollider';
import type GameObject from '../../GameObject';
import type { Rect2Like } from '../../math/Rect2';
import Collider2d from '../Collider2d';

export default class RectangleCollider2d extends Collider2d {
	x: number;
	y: number;
	width: number;
	height: number;

	constructor(owner: GameObject, rect: Rect2Like) {
		super(owner);

		this.x = rect.x;
		this.y = rect.y;
		this.width = rect.width;
		this.height = rect.height;
	}

	override getCollider() {
		const { x, y } = this.owner.transform.position;
		return new RectangleCollider(
			x + this.x,
			y + this.y,
			this.width,
			this.height,
		);
	}

	override doGizmoPath(context: CanvasRenderingContext2D): void {
		const { x, y } = this.owner.transform.position;
		context.beginPath();
		context.rect(x + this.x, y + this.y, this.width, this.height);
	}
}
