import type { Observable } from 'rxjs';
import z from 'zod';
import ContextSave from '../../ContextSave';
import { ReactInterop } from '../../react-interop/ReactInterop';
import Module from '../core/IModular';
import type { Rect2Like } from '../math/Rect2';
import Vec2, { vec2Schema, type Vec2Like } from '../math/Vec2';

export const transform2dSchema = z.object({
	position: vec2Schema,
});

type Transform2dView = z.infer<typeof transform2dSchema>;

class Transform2d extends Module implements ReactInterop<Transform2dView> {
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
		const save = new ContextSave(context);
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
}

export default Transform2d;
