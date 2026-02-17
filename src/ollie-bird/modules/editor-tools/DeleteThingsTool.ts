import contextCheckpoint from '../../../contextCheckpoint';
import { CELL_SIZE, TAG_LEVEL_STRUCTURE } from '../../const';
import PointCollider from '../../core/collider/PointCollider';
import RectangleCollider from '../../core/collider/RectangleCollider';
import type GameObject from '../../core/GameObject';
import Mouse from '../../core/input/mouse/Mouse';
import Rect2 from '../../core/math/Rect2';
import Module from '../../core/Module';
import Collider2d from '../../core/modules/Collider2d';
import Animation from '../Animation';
import BoxInputTool from '../BoxInputTool';

export default class DeleteThingsTool extends Module {
	static readonly displayName = 'DeleteThingsTool';

	get active() {
		return this.boxInputTool.active;
	}
	set active(value: boolean) {
		this.boxInputTool.active = value;
	}

	private boxInputTool!: BoxInputTool;

	protected override setup(): void {
		super.setup();
		this.boxInputTool = this.addTransientModule(BoxInputTool);
	}

	protected override initialize(): void {
		super.initialize();

		this.boxInputTool.active = this.active;
		this.boxInputTool.renderBox = true;
		this.boxInputTool.pointer = this.game.input.mouse;
		this.boxInputTool.clicker = this.game.input.mouse.getButton(
			Mouse.BUTTON_LEFT,
		);
		this.boxInputTool.cancelBtn =
			this.game.input.keyboard.getButton('Escape');

		this.boxInputTool.box$.subscribe((rect) => this.createBox(rect));
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
			);
	}

	private createBox(rect: Rect2) {
		if (!this.active) return;

		this.findThingsToDelete(rect).forEach((obj) => obj.destroy());
	}

	protected override render(context: CanvasRenderingContext2D): void {
		if (!this.active) return;

		if (!this.boxInputTool.pointer) return;
		{
			using _ = contextCheckpoint(context);
			const previewRect = this.boxInputTool.previewBox();
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
			this.boxInputTool.pointer.x + CELL_SIZE,
			this.boxInputTool.pointer.y + CELL_SIZE,
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
