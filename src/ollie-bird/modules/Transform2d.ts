import type GameObject from '../GameObject';
import Module from '../IModular';
import Mat3 from '../math/Mat3';
import Vec2 from '../math/Vec2';

class Transform2d extends Module {
	#parent?: Transform2d = undefined;
	#transform: Mat3 = Mat3.identity();

	readonly localPosition: Vec2 = new Vec2();

	get parent(): Transform2d | undefined {
		return this.#parent;
	}
	set parent(value: Transform2d | undefined) {
		this.#parent = value;
	}

	#position: Vec2 = new Vec2();

	get worldToLocalMatrix(): Mat3 {
		if (this.#parent) {
			return this.#parent.worldToLocalMatrix.multiply(this.#transform);
		}

		return this.#transform;
	}

	get position(): Vec2 {
		this.#position.copy(
			this.worldToLocalMatrix.transformPoint(this.localPosition),
		);
		return this.#position;
	}

	constructor(owner: GameObject) {
		super(owner);
	}

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
