import Module from '../core/Module';

export default class ExplosionBehavior extends Module {
	radius: number = 0;
	maxRadius: number = 100;
	expansionRate: number = 1;

	protected override update(): void {
		if (this.radius < this.maxRadius) {
			this.radius += this.expansionRate;
		} else {
			this.owner.destroy();
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

	static {
		Module.serializer.registerSerializationType(
			'ExplosionBehavior',
			ExplosionBehavior,
		);
	}
}
