import Module from '../IModular';
import type { Rect2Like } from '../math/Rect2';
import Vec2, { type Vec2Like } from '../Vec2';

class Transform2d extends Module {
	readonly position: Vec2 = Vec2.zero;

	push(context: CanvasRenderingContext2D): Disposable {
		context.save();
		context.translate(...this.position.xy);

		return {
			[Symbol.dispose]: () => {
				context.restore();
			},
		};
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
