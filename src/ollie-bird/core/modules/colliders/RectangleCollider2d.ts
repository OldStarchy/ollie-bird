import z from 'zod';
import RectangleCollider from '../../collider/RectangleCollider';
import type GameObject from '../../GameObject';
import type { Rect2Like } from '../../math/Rect2';
import Module from '../../Module';
import { Err, Ok, type Result } from '../../monad/Result';
import type { Serializable } from '../../Serializer';
import Collider2d, { collider2dDtoSchema } from '../Collider2d';

const rectangleCollider2dDtoSchema = z.object({
	base: collider2dDtoSchema,
	rect: z.tuple([z.number(), z.number(), z.number(), z.number()]),
});
type RectangleCollider2dDto = z.infer<typeof rectangleCollider2dDtoSchema>;

export default class RectangleCollider2d
	extends Collider2d
	implements Serializable
{
	static readonly displayName = 'RectangleCollider2d';

	accessor x: number;
	accessor y: number;
	accessor width: number;
	accessor height: number;

	constructor(owner: GameObject, rect: Rect2Like) {
		super(owner);

		this.x = rect.x;
		this.y = rect.y;
		this.width = rect.width;
		this.height = rect.height;
	}

	override getCollider() {
		const { x, y } = this.owner.transform.position;
		return new RectangleCollider(
			x + this.x,
			y + this.y,
			this.width,
			this.height,
		);
	}

	override doGizmoPath(context: CanvasRenderingContext2D): void {
		const { x, y } = this.owner.transform.position;
		context.beginPath();
		context.rect(x + this.x, y + this.y, this.width, this.height);
	}

	override serialize(): RectangleCollider2dDto {
		return {
			base: Collider2d.serializeBase(this),
			rect: [this.x, this.y, this.width, this.height],
		};
	}

	static deserialize(
		obj: unknown,
		context: { gameObject: GameObject },
	): Result<RectangleCollider2d, string> {
		const parsed = rectangleCollider2dDtoSchema.safeParse(obj);

		if (!parsed.success) {
			return Err(
				`Invalid RectangleCollider2d data: ${parsed.error.message}`,
			);
		}

		const { base, rect } = parsed.data;
		const [x, y, width, height] = rect;

		const collider = context.gameObject.addModule(RectangleCollider2d, {
			x,
			y,
			width,
			height,
		});

		Collider2d.deserializeBase(base, { collider });

		return Ok(collider);
	}

	static {
		Module.serializer.registerSerializationType(
			'RectangleCollider2d',
			this,
		);
	}
}
