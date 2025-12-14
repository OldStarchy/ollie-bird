import GameObject from '../GameObject';
import RectangleCollider from '../collider/RectangleCollider';
import Collider2d from '../modules/Collider2d';

class RectangleTrigger extends GameObject {
	layer = 0;
	style: string | null = null;

	private rectCollider = new RectangleCollider(0, 0, 0, 0);

	public get width(): number {
		return this.rectCollider.width;
	}
	public set width(value: number) {
		this.rectCollider.width = value;
	}
	public get height(): number {
		return this.rectCollider.height;
	}
	public set height(value: number) {
		this.rectCollider.height = value;
	}

	protected override initialize() {
		super.initialize();
		this.addModule(Collider2d).collider = this.rectCollider;
	}

	protected override render(context: CanvasRenderingContext2D): void {
		if (this.style !== null) {
			context.fillStyle = this.style;
			context.fillRect(
				...this.transform.position.xy,
				this.width,
				this.height,
			);
		}
	}
}

export default RectangleTrigger;
