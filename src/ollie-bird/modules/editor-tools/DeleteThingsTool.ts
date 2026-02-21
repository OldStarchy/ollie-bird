import contextCheckpoint from '../../../contextCheckpoint';
import { CELL_SIZE, TAG_LEVEL_STRUCTURE } from '../../const';
import PointCollider from '../../core/collider/PointCollider';
import RectangleCollider from '../../core/collider/RectangleCollider';
import type GameObject from '../../core/GameObject';
import Mouse from '../../core/input/mouse/Mouse';
import Rect2 from '../../core/math/Rect2';
import Collider2d from '../../core/modules/Collider2d';
import Animation from '../Animation';
import BoxInputTool from '../BoxInputTool';

export default class DeleteThingsTool extends BoxInputTool {
	static readonly displayName = 'DeleteThingsTool';

	protected override initialize(): void {
		super.initialize();

		this.alignToGrid = false;
		this.renderBox = true;
		this.pointer = this.game.input.mouse;
		this.clicker = this.game.input.mouse.getButton(Mouse.BUTTON_LEFT);
		this.cancelBtn = this.game.input.keyboard.getButton('Escape');
	}

	private findThingsToDelete(rect: Rect2): GameObject[] {
		const rectCollider = new RectangleCollider(...rect.xywh);
		return this.game
			.findObjectsByTag(TAG_LEVEL_STRUCTURE)
			.filter(
				(obj) =>
					Collider2d.collidingWith(rectCollider)(obj) ||
					rectCollider.checkCollision(
						new PointCollider(...obj.transform.position.xy),
					),
			)
			.toArray();
	}

	protected override handleBlockPlaced(rect: Rect2) {
		if (!this.active) return;

		this.findThingsToDelete(rect).forEach((obj) => obj.destroy());
	}

	protected override renderGizmos(context: CanvasRenderingContext2D): void {
		super.renderGizmos(context);

		if (!this.active) return;

		if (!this.pointer) return;
		{
			using _ = contextCheckpoint(context);
			const previewRect = this.previewBox();
			if (previewRect) {
				context.beginPath();

				context.strokeStyle = 'rgba(255, 0, 0, 0.5)';
				context.lineWidth = 4;

				this.findThingsToDelete(previewRect).forEach((obj) => {
					context.beginPath();
					this.outlineObject(context, obj);
					context.stroke();
				});
			}
		}
		const pointerBox = new Rect2(
			this.pointer.x + CELL_SIZE,
			this.pointer.y + CELL_SIZE,
			CELL_SIZE,
			CELL_SIZE,
		);

		using _ = contextCheckpoint(context);

		context.globalAlpha = 0.3;

		context.strokeStyle = 'rgba(255, 0, 0, 1)';
		context.lineWidth = 1;
		context.beginPath();
		context.rect(
			pointerBox.x,
			pointerBox.y,
			pointerBox.width,
			pointerBox.height,
		);
		context.stroke();

		const [cx, cy] = pointerBox.center;

		context.fillStyle = 'black';
		context.textAlign = 'center';
		context.textBaseline = 'middle';
		context.font = '30px sans-serif';
		context.fillText('❌', cx, cy);
	}

	private outlineObject(
		context: CanvasRenderingContext2D,
		obj: GameObject,
	): void {
		const colliders = obj
			.getModulesByType(Collider2d)
			.filter((m) => m.enabled)
			.toArray();
		if (colliders.length > 0) {
			colliders.forEach((collider) => collider.doGizmoPath(context));
			return;
		}

		const animation = obj.getModule(Animation);
		if (animation) {
			context.rect(
				obj.transform.position.x + animation.rectangle.x,
				obj.transform.position.y + animation.rectangle.y,
				animation.rectangle.width,
				animation.rectangle.height,
			);
			return;
		}

		context.arc(
			obj.transform.position.x,
			obj.transform.position.y,
			CELL_SIZE,
			0,
			Math.PI * 2,
		);
	}
}
