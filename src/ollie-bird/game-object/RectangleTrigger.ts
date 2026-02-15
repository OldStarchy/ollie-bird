import { z } from 'zod';
import { ReactInterop } from '../../react-interop/ReactInterop';
import GameObject from '../core/GameObject';
import Rect2 from '../core/math/Rect2';
import RectangleCollider2d from '../core/modules/colliders/RectangleCollider2d';
import Size2d from '../core/modules/Size2d';

export const rectangleTriggerDtoSchema = z.object({
	$type: z.string(),
	x: z.number(),
	y: z.number(),
	width: z.number(),
	height: z.number(),
});

export type RectangleTriggerDto = z.infer<typeof rectangleTriggerDtoSchema>;

abstract class RectangleTrigger extends GameObject {
	static readonly defaultName: string = 'Rectangle Trigger';

	style: string | null = null;

	abstract get serializationKey(): string;

	readonly size: Size2d = this.addModule(Size2d, 0, 0);

	get width(): number {
		return this.size.width;
	}
	get height(): number {
		return this.size.height;
	}

	set width(value: number) {
		this.size.width = value;
	}
	set height(value: number) {
		this.size.height = value;
	}

	protected collider = this.addModule(RectangleCollider2d, Rect2.one);

	protected override initialize(): void {
		this.layer = 0;
		this.size[ReactInterop.asObservable].subscribe(() =>
			this.updateCollider(),
		);
		this.updateCollider();
	}

	private updateCollider(): void {
		const collider = this.collider;
		collider.x = 0;
		collider.y = 0;
		collider.width = this.width;
		collider.height = this.height;
	}

	public setSize(width: number, height: number): void {
		this.width = width;
		this.height = height;
		this.updateCollider();
	}

	protected override render(context: CanvasRenderingContext2D): void {
		if (this.style !== null) {
			context.fillStyle = this.style;
			context.fillRect(
				...this.transform.position.xy,
				this.width,
				this.height,
			);
		}
	}
}

export default RectangleTrigger;
