import z from 'zod';
import RayCollider from '../../collider/RayCollider';
import type GameObject from '../../GameObject';
import type { Vec2Like } from '../../math/Vec2';
import Vec2 from '../../math/Vec2';
import Module from '../../Module';
import { Err, Ok, type Result } from '../../monad/Result';
import type { Serializable } from '../../Serializer';
import Collider2d from '../Collider2d';

const rayCollider2dDtoSchema = z.object({
	base: z.unknown(),
	origin: z.tuple([z.number(), z.number()]),
	direction: z.tuple([z.number(), z.number()]),
	distance: z.number().min(0),
});
type RayCollider2dDto = z.infer<typeof rayCollider2dDtoSchema>;

export default class RayCollider2d extends Collider2d implements Serializable {
	static readonly displayName = 'RayCollider2d';

	accessor origin: Vec2Like = { x: 0, y: 0 };
	accessor direction: Vec2Like = { x: 1, y: 0 };
	accessor distance: number = 10;

	override getCollider() {
		const { x, y } = this.owner.transform.position;
		return new RayCollider(
			{ x: x + this.origin.x, y: y + this.origin.y },
			this.direction,
			this.distance,
		);
	}

	override doGizmoPath(context: CanvasRenderingContext2D): void {
		const { x, y } = this.owner.transform.position;
		const dir = Vec2.from(this.direction).normalize();

		context.beginPath();
		context.moveTo(x + this.origin.x, y + this.origin.y);
		context.lineTo(
			x + this.origin.x + dir.x * this.distance,
			y + this.origin.y + dir.y * this.distance,
		);
	}

	override serialize(): RayCollider2dDto {
		return {
			base: Collider2d.serializeBase(this),
			origin: [this.origin.x, this.origin.y],
			direction: [this.direction.x, this.direction.y],
			distance: this.distance,
		};
	}

	static deserialize(
		obj: unknown,
		context: { gameObject: GameObject },
	): Result<RayCollider2d, string> {
		const parsed = rayCollider2dDtoSchema.safeParse(obj);

		if (!parsed.success) {
			return Err(`Invalid RayCollider2d data: ${parsed.error.message}`);
		}

		const { base, origin, direction, distance } = parsed.data;
		const collider = context.gameObject.addModule(RayCollider2d);
		collider.origin = { x: origin[0], y: origin[1] };
		collider.direction = { x: direction[0], y: direction[1] };
		collider.distance = distance;

		Collider2d.deserializeBase(base, { collider });

		return Ok(collider);
	}

	static {
		Module.serializer.registerSerializationType('RayCollider2d', this);
	}
}
