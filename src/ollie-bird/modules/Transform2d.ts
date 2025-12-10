import Module from '../IModular';
import Vec2 from '../Vec2';

class Transform2d extends Module {
	readonly position: Vec2 = new Vec2();

	push(context: CanvasRenderingContext2D): Disposable {
		context.save();
		context.translate(...this.position.xy);

		return {
			[Symbol.dispose]: () => {
				context.restore();
			},
		};
	}
}

export default Transform2d;
