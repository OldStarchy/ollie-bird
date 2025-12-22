import GameObject from '../GameObject';
import type { ISerializable } from '../LevelStore';
import RectangleCollider2d from '../modules/RectangleCollider2d';
import { z } from 'zod';

export const rectangleTriggerDtoSchema = z.object({
	$type: z.string(),
	x: z.number(),
	y: z.number(),
	width: z.number(),
	height: z.number(),
});

export type RectangleTriggerDto = z.infer<typeof rectangleTriggerDtoSchema>;

class RectangleTrigger extends GameObject implements ISerializable {
	layer = 0;
	style: string | null = null;
	public width: number = 0;
	public height: number = 0;

	protected collider = this.addModule(RectangleCollider2d);

	protected override initialize(): void {
		this.updateCollider();
	}

	private updateCollider(): void {
		const collider = this.collider;
		collider.left = 0;
		collider.top = 0;
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

	serialize(): RectangleTriggerDto {
		return {
			$type: this.constructor.name,
			x: this.transform.position.x,
			y: this.transform.position.y,
			width: this.width,
			height: this.height,
		};
	}
}

export default RectangleTrigger;
