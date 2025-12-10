import GameObject from '../GameObject';
import RectangleCollider from '../RectangleCollider';

class RectangleTrigger extends GameObject {
	layer = 0;
	style: string | null = null;
	public width: number = 0;
	public height: number = 0;

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

	getCollider(): RectangleCollider {
		return new RectangleCollider(
			...this.transform.position.xy,
			this.width,
			this.height,
		);
	}
}

export default RectangleTrigger;
