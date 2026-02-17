import contextCheckpoint from '../../../contextCheckpoint';
import { CELL_SIZE } from '../../const';
import GameObject from '../../core/GameObject';
import Mouse from '../../core/input/mouse/Mouse';
import Rect2 from '../../core/math/Rect2';
import Module from '../../core/Module';
import createWallPrefab from '../../prefabs/createWallPrefab';
import BoxInputTool from '../BoxInputTool';
import WallRenderer from '../WallRenderer';

export default class CreateWallTool extends Module {
	static readonly displayName = 'CreateWallTool';

	get active() {
		return this.boxInputTool.active;
	}
	set active(value: boolean) {
		this.boxInputTool.active = value;
	}

	private boxInputTool: BoxInputTool;

	constructor(owner: GameObject) {
		super(owner);

		this.boxInputTool = this.addTransientModule(BoxInputTool);
	}

	protected override initialize(): void {
		super.initialize();

		this.boxInputTool.active = this.active;
		this.boxInputTool.renderBox = false;
		this.boxInputTool.pointer = this.game.input.mouse;
		this.boxInputTool.clicker = this.game.input.mouse.getButton(
			Mouse.BUTTON_LEFT,
		);
		this.boxInputTool.cancelBtn =
			this.game.input.keyboard.getButton('Escape');

		this.boxInputTool.box$.subscribe((rect) => this.createBox(rect));
	}

	private createBox(rect: Rect2) {
		if (!this.active) return;

		GameObject.deserializePartial(createWallPrefab(rect), {
			game: this.game,
		}).logErr('Failed to create wall');
	}

	protected override render(context: CanvasRenderingContext2D): void {
		if (!this.active) return;
		if (!this.boxInputTool.pointer) return;

		const pointerBox = new Rect2(
			this.boxInputTool.pointer.x + CELL_SIZE,
			this.boxInputTool.pointer.y + CELL_SIZE,
			CELL_SIZE,
			CELL_SIZE,
		);

		using _ = contextCheckpoint(context);
		context.globalAlpha = 0.3;

		WallRenderer.renderWall(context, pointerBox, CELL_SIZE / 2);

		const previewRect = this.boxInputTool.previewBox();
		if (!previewRect) return;

		WallRenderer.renderWall(context, previewRect);
	}
}
