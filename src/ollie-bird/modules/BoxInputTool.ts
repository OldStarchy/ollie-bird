import { Subject } from 'rxjs';
import { CELL_SIZE } from '../const';
import type { Button } from '../core/input/Button';
import Mouse from '../core/input/mouse/Mouse';
import type { Pointer } from '../core/input/Pointer';
import Rect2 from '../core/math/Rect2';
import Vec2, { type Vec2Like } from '../core/math/Vec2';
import Module from '../core/Module';

export default class BoxInputTool extends Module {
	static readonly displayName = 'BoxInputTool';

	#active = false;
	get active() {
		return this.#active;
	}
	set active(value: boolean) {
		this.#active = value;
		if (!value) this.cancel();
	}
	accessor alignToGrid = true;
	accessor renderBox = true;

	readonly gridSize = new Vec2(CELL_SIZE, CELL_SIZE);
	readonly gridOffset = new Vec2(0, 0);

	private startPoint: Vec2 | null = null;
	private currentPoint: Vec2 | null = null;

	pointer: Pointer | null = null;
	clicker: Button | null = null;
	cancelBtn: Button | null = null;

	readonly #box$ = new Subject<Rect2>();
	readonly box$ = this.#box$.asObservable();

	protected override initialize(): void {
		super.initialize();
		this.disposableStack.adopt(this.#box$, (subj) => subj.complete());

		this.pointer ??= this.game.input.mouse;
		this.clicker ??= this.game.input.mouse.getButton(Mouse.BUTTON_LEFT);
		this.cancelBtn ??= this.game.input.keyboard.getButton('Escape');
	}

	protected override update() {
		if (!this.active || !this.pointer || !this.clicker) return;

		if (this.cancelBtn?.isPressed) {
			this.cancel();
			return;
		}

		if (this.clicker.isPressed) {
			this.startPoint = this.alignPointToGrid(this.pointer);
		}
		if (!this.startPoint) return;

		this.currentPoint = this.alignPointToGrid(this.pointer);

		if (this.clicker.isReleased) {
			const rect = Rect2.fromAABB(
				this.startPoint.x,
				this.startPoint.y,
				this.currentPoint.x,
				this.currentPoint.y,
			).normalize();

			this.startPoint = null;
			this.currentPoint = null;

			if (rect.width === 0 || rect.height === 0) return;

			this.#box$.next(rect);
		}
	}

	previewBox(): Rect2 | null {
		if (!this.startPoint || !this.currentPoint) return null;

		return Rect2.fromAABB(
			this.startPoint.x,
			this.startPoint.y,
			this.currentPoint.x,
			this.currentPoint.y,
		).normalize();
	}

	cancel() {
		this.startPoint = null;
		this.currentPoint = null;
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

	protected override render(context: CanvasRenderingContext2D): void {
		if (!this.active || !this.renderBox) return;

		const rect = this.previewBox();
		if (!rect) return;

		context.strokeStyle = 'green';

		context.beginPath();
		context.strokeRect(...rect.xywh);
		context.stroke();
	}
}
