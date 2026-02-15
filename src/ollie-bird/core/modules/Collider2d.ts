import z from 'zod';
import contextCheckpoint from '../../../contextCheckpoint';
import type ColliderShape from '../collider/ColliderShape';
import type GameObject from '../GameObject';
import Module from '../Module';
import { Ok, Result } from '../monad/Result';
import type { Serializable } from '../Serializer';

export const collider2dDtoSchema = z
	.object({
		renderWidget: z.boolean().optional(),
		widgetFillStyle: z.string().optional(),
		widgetStrokeStyle: z.string().optional(),
		widgetLineWidth: z.number().min(0).optional(),
		widgetLineDash: z.array(z.number().min(0)).optional(),
	})
	.optional();

export type Collider2dDto = z.infer<typeof collider2dDtoSchema>;

export default abstract class Collider2d
	extends Module
	implements Serializable
{
	accessor renderWidget: boolean = false;
	accessor widgetFillStyle: string = 'rgba(0, 255, 0, 0.3)';
	accessor widgetStrokeStyle: string = 'rgba(0, 255, 0, 1)';
	accessor widgetLineWidth: number = 1;
	accessor widgetLineDash: number[] = [];

	abstract getCollider(): ColliderShape;

	protected abstract doGizmoPath(context: CanvasRenderingContext2D): void;

	cast(objects: Array<GameObject>): Array<GameObject>;
	cast(objects: IteratorObject<GameObject>): IteratorObject<GameObject>;
	cast(
		objects: IteratorObject<GameObject> | Array<GameObject>,
	): IteratorObject<GameObject> | Array<GameObject> {
		const collider = this.getCollider();

		return objects.filter(Collider2d.collidingWith(collider));
	}

	protected override renderGizmos(context: CanvasRenderingContext2D): void {
		if (!this.renderWidget) {
			return;
		}
		if (this.widgetStrokeStyle === null && this.widgetFillStyle === null) {
			return;
		}
		this.doRenderGizmos(context);
	}

	public doRenderGizmos(context: CanvasRenderingContext2D): void {
		using _ = contextCheckpoint(context);

		this.doGizmoPath(context);

		if (this.widgetFillStyle) {
			context.fillStyle = this.widgetFillStyle;
			context.fill();
		}
		if (this.widgetStrokeStyle) {
			context.strokeStyle = this.widgetStrokeStyle;
			context.lineWidth = this.widgetLineWidth;
			context.setLineDash(this.widgetLineDash);
			context.stroke();
		}
	}

	static collidingWith(
		collider: ColliderShape,
	): (obj: GameObject) => boolean {
		return (obj: GameObject) => {
			const colliderModule = obj
				.getModulesByType(Collider2d)
				.filter((m) => m.enabled);

			for (const otherCollider of colliderModule) {
				if (collider.checkCollision(otherCollider.getCollider())) {
					return true;
				}
			}

			return false;
		};
	}

	static serializeBase(module: Collider2d): Collider2dDto {
		return {
			renderWidget: module.renderWidget,
			widgetFillStyle: module.widgetFillStyle,
			widgetStrokeStyle: module.widgetStrokeStyle,
			widgetLineWidth: module.widgetLineWidth,
			widgetLineDash: module.widgetLineDash,
		};
	}

	static deserializeBase(
		obj: unknown,
		context: { collider: Collider2d },
	): Result<void, string> {
		const parsed = Result.zodParse(collider2dDtoSchema, obj);
		if (parsed.isErr()) {
			return parsed.mapErr(
				(err) =>
					`Invalid Collider2d base data: ${z.prettifyError(err)}`,
			);
		}

		const data = parsed.unwrap();
		const { collider } = context;

		if (data) {
			if (data.renderWidget) collider.renderWidget = data.renderWidget;
			if (data.widgetFillStyle)
				collider.widgetFillStyle = data.widgetFillStyle;
			if (data.widgetStrokeStyle)
				collider.widgetStrokeStyle = data.widgetStrokeStyle;
			if (data.widgetLineWidth)
				collider.widgetLineWidth = data.widgetLineWidth;
			if (data.widgetLineDash)
				collider.widgetLineDash = data.widgetLineDash;
		}

		return Ok(undefined);
	}
}
