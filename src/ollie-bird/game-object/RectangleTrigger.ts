import GameObject from '../GameObject';
import RectangleCollider2d from '../modules/RectangleCollider2d';

class RectangleTrigger extends GameObject {
	layer = 0;
	style: string | null = null;
	public width: number = 0;
	public height: number = 0;

	protected collider = this.addModule(RectangleCollider2d);

	protected override initialize(): void {
		this.updateCollider();
	}

	private updateCollider(): void {
		const collider = this.collider;
		collider.left = 0;
		collider.top = 0;
		collider.width = this.width;
		collider.height = this.height;
	}

	public setSize(width: number, height: number): void {
		this.width = width;
		this.height = height;
		this.updateCollider();
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
