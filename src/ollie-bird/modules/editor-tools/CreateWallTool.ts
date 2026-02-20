import contextCheckpoint from '../../../contextCheckpoint';
import { CELL_SIZE } from '../../const';
import GameObject from '../../core/GameObject';
import Mouse from '../../core/input/mouse/Mouse';
import Rect2 from '../../core/math/Rect2';
import createWallPrefab from '../../prefabs/createWallPrefab';
import BoxInputTool from '../BoxInputTool';
import WallRenderer from '../WallRenderer';

export default class CreateWallTool extends BoxInputTool {
	static readonly displayName = 'CreateWallTool';

	protected override initialize(): void {
		super.initialize();

		this.renderBox = false;
		this.pointer = this.game.input.mouse;
		this.clicker = this.game.input.mouse.getButton(Mouse.BUTTON_LEFT);
		this.cancelBtn = this.game.input.keyboard.getButton('Escape');
	}

	protected override handleBlockPlaced(rect: Rect2) {
		if (!this.active) return;

		GameObject.deserializePartial(createWallPrefab(rect), {
			game: this.game,
		}).logErr('Failed to create wall');
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

		WallRenderer.renderWall(context, pointerBox, CELL_SIZE / 2);

		const previewRect = this.previewBox();
		if (!previewRect) return;

		WallRenderer.renderWall(context, previewRect);
	}
}
