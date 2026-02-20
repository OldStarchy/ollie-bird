import contextCheckpoint from '../../../contextCheckpoint';
import { CELL_SIZE } from '../../const';
import { Button } from '../../core/input/Button';
import Mouse from '../../core/input/mouse/Mouse';
import type { Pointer } from '../../core/input/Pointer';
import type { Vec2Like } from '../../core/math/Vec2';
import Vec2 from '../../core/math/Vec2';
import Module from '../../core/Module';

export default abstract class ClickToPlaceTool extends Module {
	static readonly displayName: string = 'ClickToPlaceTool';

	#active: boolean = false;
	get active() {
		return this.#active;
	}
	set active(value: boolean) {
		this.#active = value;
	}

	#pointer: Pointer | null = null;
	#clicker: Button | null = null;

	accessor alignToGrid = true;
	readonly gridSize = new Vec2(CELL_SIZE, CELL_SIZE);
	readonly gridOffset = new Vec2(0, 0);

	protected override initialize(): void {
		super.initialize();

		this.#pointer ??= this.game.input.mouse;
		this.#clicker ??= this.game.input.mouse.getButton(Mouse.BUTTON_LEFT);
	}

	protected override update() {
		if (!this.active || !this.#pointer || !this.#clicker) return;

		if (this.#clicker.isPressed) {
			this.handleClickToPlace(this.alignPointToGrid(this.#pointer));
		}
	}

	private alignPointToGrid(point: Vec2Like): Vec2 {
		if (!this.alignToGrid) return new Vec2(point.x, point.y);

		const alignedX =
			Math.round((point.x - this.gridOffset.x) / this.gridSize.x) *
				this.gridSize.x +
			this.gridOffset.x;
		const alignedY =
			Math.round((point.y - this.gridOffset.y) / this.gridSize.y) *
				this.gridSize.y +
			this.gridOffset.y;
		return new Vec2(alignedX, alignedY);
	}

	protected abstract handleClickToPlace(pointer: Vec2Like): void;

	protected abstract renderToolPreview(
		context: CanvasRenderingContext2D,
	): void;

	protected override renderGizmos(context: CanvasRenderingContext2D): void {
		if (!this.active || !this.#pointer) return;

		using _ = contextCheckpoint(context);
		context.globalAlpha = 0.3;
		const pos = this.alignPointToGrid(this.#pointer);
		context.translate(pos.x, pos.y);
		this.renderToolPreview(context);
	}
}
