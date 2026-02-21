import contextCheckpoint from '../../../contextCheckpoint';
import { CELL_SIZE, TAG_GOAL } from '../../const';
import Mouse from '../../core/input/mouse/Mouse';
import Rect2 from '../../core/math/Rect2';
import createGoalPrefab from '../../prefabs/createGoalPrefab';
import BoxInputTool from '../BoxInputTool';

export default class SetGoalTool extends BoxInputTool {
	static readonly displayName = 'SetGoalTool';

	protected override initialize(): void {
		super.initialize();

		this.renderBox = true;
		this.pointer = this.game.input.mouse;
		this.clicker = this.game.input.mouse.getButton(Mouse.BUTTON_LEFT);
		this.cancelBtn = this.game.input.keyboard.getButton('Escape');
	}

	protected override handleBlockPlaced(rect: Rect2) {
		if (!this.active) return;

		this.game.findObjectsByTag(TAG_GOAL).forEach((obj) => obj.destroy());

		this.game.spawnPrefab(createGoalPrefab(rect));
	}

	protected override renderGizmos(context: CanvasRenderingContext2D): void {
		super.renderGizmos(context);

		if (!this.active) return;
		if (!this.pointer) return;

		const pointerBox = new Rect2(
			this.pointer.x + CELL_SIZE,
			this.pointer.y + CELL_SIZE,
			CELL_SIZE,
			CELL_SIZE,
		);

		using _ = contextCheckpoint(context);
		context.globalAlpha = 0.3;

		context.beginPath();
		context.rect(
			pointerBox.x,
			pointerBox.y,
			pointerBox.width,
			pointerBox.height,
		);

		context.fillStyle = 'rgba(0, 255, 0)';
		context.strokeStyle = 'rgba(0, 255, 0)';

		context.fill();
	}
}
