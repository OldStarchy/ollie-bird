import ContextSave from '../../../ContextSave';
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

	protected abstract doGizmoPath(context: CanvasRenderingContext2D): void;

	cast(objects: Array<GameObject>): Array<GameObject>;
	cast(objects: IteratorObject<GameObject>): IteratorObject<GameObject>;
	cast(
		objects: IteratorObject<GameObject> | Array<GameObject>,
	): IteratorObject<GameObject> | Array<GameObject> {
		const collider = this.getCollider();

		return objects.filter(Collider2d.collidingWith(collider));
	}

	protected override renderGizmos(context: CanvasRenderingContext2D): void {
		if (!this.renderWidget) {
			return;
		}
		if (this.widgetStrokeStyle === null && this.widgetFillStyle === null) {
			return;
		}
		this.doRenderGizmos(context);
	}

	public doRenderGizmos(context: CanvasRenderingContext2D): void {
		using _ = new ContextSave(context);

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
	}

	static collidingWith(
		collider: ColliderShape,
	): (obj: GameObject) => boolean {
		return (obj: GameObject) => {
			const colliderModule = obj
				.getModules(Collider2d)
				.filter((m) => m.enabled);

			for (const otherCollider of colliderModule) {
				if (collider.checkCollision(otherCollider.getCollider())) {
					return true;
				}
			}

			return false;
		};
	}
}
