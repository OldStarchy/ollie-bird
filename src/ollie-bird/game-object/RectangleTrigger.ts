import { z } from 'zod';
import GameObject from '../core/GameObject';
import RectangleCollider2d from '../core/modules/colliders/RectangleCollider2d';

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

	protected collider!: RectangleCollider2d;

	protected override initialize(): void {
		this.layer = 0;
		this.collider =
			this.getModule(RectangleCollider2d) ??
			this.addModule(RectangleCollider2d);
	}

	public setSize(width: number, height: number): void {
		this.collider.width = width;
		this.collider.height = height;
	}

	protected override render(context: CanvasRenderingContext2D): void {
		if (this.style !== null) {
			context.fillStyle = this.style;
			context.fillRect(
				...this.transform.position.xy,
				this.collider.width,
				this.collider.height,
			);
		}
	}
}

export default RectangleTrigger;
