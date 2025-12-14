import type ColliderShape from '../collider/ColliderShape';
import type GameObject from '../GameObject';
import Module from '../IModular';

export default abstract class Collider2d extends Module {
	renderWidget: boolean = false;
	widgetFillStyle: string = 'rgba(0, 255, 0, 0.3)';
	widgetStrokeStyle: string = 'rgba(0, 255, 0, 1)';
	widgetLineWidth: number = 1;
	widgetLineDash: number[] = [];

	abstract getCollider(): ColliderShape;

	abstract doGizmoPath(context: CanvasRenderingContext2D): void;

	protected override renderGizmos(context: CanvasRenderingContext2D): void {
		if (!this.renderWidget) {
			return;
		}
		if (this.widgetStrokeStyle === null && this.widgetFillStyle === null) {
			return;
		}
		context.save();
		try {
			this.doGizmoPath(context);

			if (this.widgetFillStyle) {
				context.fillStyle = this.widgetFillStyle;
				context.fill();
			}
			if (this.widgetStrokeStyle) {
				context.strokeStyle = this.widgetStrokeStyle;
				context.lineWidth = this.widgetLineWidth;
				context.setLineDash(this.widgetLineDash);
				context.stroke();
			}
		} finally {
			context.restore();
		}
	}

	static collidingWith(
		collider: ColliderShape,
	): (obj: GameObject) => boolean {
		return (obj: GameObject) => {
			const colliderModule = obj.getModules(Collider2d);

			for (const otherCollider of colliderModule) {
				if (collider.checkCollision(otherCollider.getCollider())) {
					return true;
				}
			}

			return false;
		};
	}
}
