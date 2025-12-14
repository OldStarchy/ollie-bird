import CircleCollider from '../collider/CircleCollider';
import type ICollider from '../collider/ICollider';
import RayCollider from '../collider/RayCollider';
import RectangleCollider from '../collider/RectangleCollider';
import type GameObject from '../GameObject';
import Module from '../IModular';

export default class Collider2d extends Module {
	collider: ICollider = new CircleCollider(20);

	renderWidget: boolean = false;
	widgetFillStyle: string = 'rgba(0, 255, 0, 0.3)';
	widgetStrokeStyle: string = 'rgba(0, 255, 0, 1)';
	widgetLineWidth: number = 1;
	widgetLineDash: number[] = [];

	findCollisions(): Array<GameObject> {
		const collider2ds = this.owner.game.findModulesByType(Collider2d);

		const result: Array<GameObject> = [];

		for (const other of collider2ds) {
			if (other === this) {
				continue;
			}

			if (
				this.collider.checkCollision(
					this.owner.transform.position,
					other.collider,
					other.owner.transform.position,
				)
			) {
				result.push(other.owner);
			}
		}

		return result;
	}

	protected override renderGizmos(context: CanvasRenderingContext2D): void {
		if (this.renderWidget) {
			if (
				this.widgetStrokeStyle === null &&
				this.widgetFillStyle === null
			) {
				return;
			}

			if (this.collider instanceof CircleCollider) {
				context.beginPath();
				context.arc(
					...this.owner.transform.position.xy,
					20,
					0,
					Math.PI * 2,
				);

				return;
			}

			if (this.collider instanceof RectangleCollider) {
				context.beginPath();
				context.rect(
					this.owner.transform.position.x,
					this.owner.transform.position.y,
					this.collider.width,
					this.collider.height,
				);
			}

			if (this.collider instanceof RayCollider) {
				const startX = this.owner.transform.position.x;
				const startY = this.owner.transform.position.y;
				const endX =
					startX + this.collider.direction.x * this.collider.distance;
				const endY =
					startY + this.collider.direction.y * this.collider.distance;

				context.beginPath();
				context.moveTo(startX, startY);
				context.lineTo(endX, endY);
			}

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
	}
}
