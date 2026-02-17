import { Subject } from 'rxjs';
import { CELL_SIZE } from '../const';
import type { Button } from '../core/input/Button';
import type { Pointer } from '../core/input/Pointer';
import Rect2 from '../core/math/Rect2';
import Vec2, { type Vec2Like } from '../core/math/Vec2';
import Module from '../core/Module';

export default class BoxInputTool extends Module {
	static readonly displayName = 'BoxInputTool';

	accessor enabled = false;
	accessor alignToGrid = true;

	readonly gridSize = new Vec2(CELL_SIZE, CELL_SIZE);
	readonly gridOffset = new Vec2(0, 0);

	private startPoint: Vec2 | null = null;
	private currentPoint: Vec2 | null = null;

	pointer: Pointer | null = null;
	clicker: Button | null = null;
	cancelBtn: Button | null = null;

	readonly #box$ = new Subject<Rect2>();
	readonly box$ = this.#box$.asObservable();

	update() {
		if (!this.enabled || !this.pointer || !this.clicker) return;

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

			this.#box$.next(rect);
		}
	}

	cancel() {
		this.startPoint = null;
		this.currentPoint = null;
	}

	private alignPointToGrid(point: Vec2Like): Vec2 {
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
		if (!this.startPoint || !this.currentPoint) return;

		const rect = Rect2.fromAABB(
			this.startPoint.x,
			this.startPoint.y,
			this.currentPoint.x,
			this.currentPoint.y,
		).normalize();

		context.strokeStyle = 'green';

		context.beginPath();
		context.strokeRect(...rect.xywh);
		context.stroke();
	}
}
