import type { Observable } from 'rxjs';
import z from 'zod';
import contextCheckpoint from '../../../contextCheckpoint';
import { ReactInterop } from '../../../react-interop/ReactInterop';
import type GameObject from '../GameObject';
import Module from '../Module';
import type { Serializable } from '../Serializer';
import type { Rect2Like } from '../math/Rect2';
import Vec2, { vec2Schema, type Vec2Like } from '../math/Vec2';
import { Err, Ok, Result } from '../monad/Result';

export const transform2dSchema = z.object({
	position: vec2Schema,
});

type Transform2dView = z.infer<typeof transform2dSchema>;

export const transform2dDtoSchema = z.tuple([z.number(), z.number()]);
type Transform2dDto = z.infer<typeof transform2dDtoSchema>;

class Transform2d
	extends Module
	implements ReactInterop<Transform2dView>, Serializable
{
	static readonly displayName = 'Transform2d';

	readonly position: Vec2 = Vec2.zero;

	[ReactInterop.get](): Transform2dView {
		return {
			position: {
				x: this.position.x,
				y: this.position.y,
			},
		};
	}

	[ReactInterop.set](value: Transform2dView): void {
		this.position.x = value.position.x;
		this.position.y = value.position.y;
	}

	get [ReactInterop.asObservable](): Observable<void> {
		return this.position[ReactInterop.asObservable];
	}

	readonly [ReactInterop.schema] = transform2dSchema;

	push(context: CanvasRenderingContext2D): Disposable {
		const save = contextCheckpoint(context);
		context.translate(...this.position.xy);

		return save;
	}

	transformPoint(point: Vec2Like): Vec2Like {
		return {
			x: point.x + this.position.x,
			y: point.y + this.position.y,
		};
	}

	transformRect(rect: Rect2Like): Rect2Like {
		return {
			x: rect.x + this.position.x,
			y: rect.y + this.position.y,
			width: rect.width,
			height: rect.height,
		};
	}

	serialize(): Transform2dDto {
		return this.position.xy;
	}

	static deserialize(
		obj: unknown,
		context: { gameObject: GameObject },
	): Result<Transform2d, string> {
		const parsed = transform2dDtoSchema.safeParse(obj);

		if (!parsed.success) {
			return Err(`Invalid Transform2d data: ${parsed.error.message}`);
		}

		const transform = context.gameObject.transform;

		const [x, y] = parsed.data;
		transform.position.set(x, y);

		return Ok(transform);
	}
}

export default Transform2d;
