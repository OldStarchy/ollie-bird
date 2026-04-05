import z from 'zod';
import contextCheckpoint from '../../../contextCheckpoint';
import type ColliderShape from '../collider/ColliderShape';
import type GameObject from '../GameObject';
import type { Vec2Like } from '../math/Vec2';
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

export type Collider2dDto = z.input<typeof collider2dDtoSchema>;

/**
 * Base class for attaching various 2D colliders to GameObjects.
 *
 * ## Note
 *
 * There are both "Collider Shapes" and "Collider Modules". Collider modules
 * (ie. a subclass of `Collider2d`) attach to {@link GameObject}s and provide
 * functionality for creating collider shapes based on the objects current
 * location and transform.
 *
 * To find colliding objects, you can use the static {@link collidingWith}
 * method with a collider shape.
 */
export default abstract class Collider2d
	extends Module
	implements Serializable
{
	// TODO: #81 add collision layer support

	/**
	 * Whether to render a gizmo for this collider.
	 */
	accessor renderWidget: boolean = false;

	/**
	 * The fill style for this colliders gizmo.
	 */
	accessor widgetFillStyle: string = 'rgba(0, 255, 0, 0.3)';
	/**
	 * The stroke style for this colliders gizmo.
	 */
	accessor widgetStrokeStyle: string = 'rgba(0, 255, 0, 1)';
	/**
	 * The line width for this colliders gizmo.
	 */
	accessor widgetLineWidth: number = 1;
	/**
	 * The line dash pattern for this colliders gizmo.
	 */
	accessor widgetLineDash: number[] = [];

	/**
	 * Creates and returns a collider shape for this module based on the
	 * current state of the GameObject.
	 */
	abstract getCollider(): ColliderShape;

	/**
	 * Trace the path of this collider for gizmo rendering.
	 */
	abstract doGizmoPath(context: CanvasRenderingContext2D): void;

	/**
	 * Filters the given list of objects to only those that are colliding with
	 * this collider.
	 */
	cast(objects: Array<GameObject>): Array<GameObject>;
	cast(objects: IteratorObject<GameObject>): IteratorObject<GameObject>;
	cast(
		objects: IteratorObject<GameObject> | Array<GameObject>,
	): IteratorObject<GameObject> | Array<GameObject> {
		const collider = this.getCollider();

		return objects.filter(Collider2d.collidingWith(collider));
	}

	/**
	 * Gets the center of this collider in world space.
	 */
	abstract getWorldCenter(): Vec2Like;

	// TODO: #77 this was a renderGizmos but currently its just render to avoid
	// overlaying the intro cinematic.
	protected override render(context: CanvasRenderingContext2D): void {
		if (!this.renderWidget) {
			return;
		}
		if (this.widgetStrokeStyle === null && this.widgetFillStyle === null) {
			return;
		}
		this.doRenderGizmos(context);
	}

	/**
	 * Renders this collider shape. Depends on subclasses implementing
	 * {@link doGizmoPath} to trace the path of the collider.
	 *
	 * The rendering is styled based on the `widget*` properties of this module.
	 *
	 * This is used for rendering collider gizmos when the {@link renderWidget}
	 * property is enabled. You can also call this method directly to render the
	 * collider shape in other contexts (eg. a debug overlay).
	 */
	public doRenderGizmos(context: CanvasRenderingContext2D): void {
		using _ = contextCheckpoint(context);

		context.beginPath();
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

	/**
	 * Returns a function that checks if a GameObject is colliding with the given collider.
	 *
	 * @example You can create a collider dynamically
	 *
	 * ```ts
	 * const collider = new CircleCollider(...);
	 *
	 * const collidingObjects = this.game
	 *   .getObjects(Collider2d.collidingWith(collider))
	 *   .toArray();
	 * ```
	 *
	 * @example Or use a collider provided by a Collider2d module
	 * ```ts
	 * declare const colliderModule: Collider2d;
	 *
	 * const collidingObjects = colliderModule
	 *   .cast(this.game.getObjects())
	 *   .toArray();
	 * ```
	 *
	 * @example If there are multiple Collider2d modules, you can combine their
	 * colliders for more complex shapes
	 * ```ts
	 * const collisionChecks = this.getModulesByType(Collider2d)
	 *   .filter((m) => m.enabled)
	 *   .map((c) => c.getCollider())
	 *   .map(Collider2d.collidingWith)
	 *   .toArray();
	 *
	 * const collidingObjects = this.game
	 *   .getObjects(
	 *     obj => collisionChecks.some((checkCollision) => checkCollision(obj))
	 *   )
	 *   .toArray();
	 * ```
	 * @param collider The collider to check against.
	 * @returns A function that takes a GameObject and returns a boolean indicating collision.
	 */
	static collidingWith(
		collider: ColliderShape,
	): (obj: GameObject) => boolean {
		return (obj: GameObject) => {
			return obj
				.getModulesByType(Collider2d)
				.filter((m) => m.enabled)
				.map((m) => m.getCollider())
				.some((otherCollider) =>
					collider.checkCollision(otherCollider),
				);
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

		return Ok();
	}
}
