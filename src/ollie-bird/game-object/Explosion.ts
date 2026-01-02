import { Layer } from '../const';
import GameObject from '../core/GameObject';

export default class Explosion extends GameObject {
	layer = Layer.Foreground;
	public radius: number = 0;
	public maxRadius: number = 100;
	public expansionRate: number = 1;

	protected override update(): void {
		if (this.radius < this.maxRadius) {
			this.radius += this.expansionRate;
		} else {
			this.destroy();
		}
	}

	protected override render(context: CanvasRenderingContext2D): void {
		if (this.radius <= 0) {
			return;
		}
		context.strokeStyle = 'orange';
		context.beginPath();
		context.arc(...this.transform.position.xy, this.radius, 0, Math.PI * 2);
		context.lineWidth = 3;
		context.stroke();
		context.lineWidth = 1;
	}
}
