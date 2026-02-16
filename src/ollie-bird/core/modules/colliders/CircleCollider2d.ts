import z from 'zod';
import CircleCollider from '../../collider/CircleCollider';
import type GameObject from '../../GameObject';
import type { Vec2Like } from '../../math/Vec2';
import Module from '../../Module';
import { Err, Ok, type Result } from '../../monad/Result';
import type { Serializable } from '../../Serializer';
import Collider2d, { collider2dDtoSchema } from '../Collider2d';

const circleCollider2dDtoSchema = z.object({
	base: collider2dDtoSchema,
	center: z.tuple([z.number(), z.number()]),
	radius: z.number().min(0),
});
export type CircleCollider2dDto = z.input<typeof circleCollider2dDtoSchema>;

export default class CircleCollider2d
	extends Collider2d
	implements Serializable
{
	static readonly displayName = 'CircleCollider2d';

	accessor center: Vec2Like = { x: 0, y: 0 };
	accessor radius: number = 10;

	override getCollider() {
		const { x, y } = this.owner.transform.position;
		return new CircleCollider(
			x + this.center.x,
			y + this.center.y,
			this.radius,
		);
	}

	override getWorldCenter(): Vec2Like {
		const { x, y } = this.owner.transform.position;
		return {
			x: x + this.center.x,
			y: y + this.center.y,
		};
	}

	override doGizmoPath(context: CanvasRenderingContext2D): void {
		const { x, y } = this.owner.transform.position;
		context.beginPath();
		context.arc(
			x + this.center.x,
			y + this.center.y,
			this.radius,
			0,
			Math.PI * 2,
		);
	}

	override serialize(): CircleCollider2dDto {
		return {
			base: Collider2d.serializeBase(this),
			center: [this.center.x, this.center.y],
			radius: this.radius,
		};
	}

	static deserialize(
		obj: unknown,
		context: { gameObject: GameObject },
	): Result<CircleCollider2d, string> {
		const parsed = circleCollider2dDtoSchema.safeParse(obj);

		if (!parsed.success) {
			return Err(
				`Invalid CircleCollider2d data: ${parsed.error.message}`,
			);
		}

		const { base, center, radius } = parsed.data;
		const [centerX, centerY] = center;
		const collider = context.gameObject.addModule(CircleCollider2d);

		collider.center = { x: centerX, y: centerY };
		collider.radius = radius;

		Collider2d.deserializeBase(base, { collider });

		return Ok(collider);
	}

	static {
		Module.serializer.registerSerializationType('CircleCollider2d', this);
	}
}
