import z from 'zod';
import { TAG_LEVEL_STRUCTURE } from '../const';
import PointCollider from '../core/collider/PointCollider';
import type GameObject from '../core/GameObject';
import type { Vec2Like } from '../core/math/Vec2';
import Module from '../core/Module';
import Collider2d from '../core/modules/Collider2d';
import { Err, Ok, type Result } from '../core/monad/Result';

const walkBackAndForthBehaviorDtoSchema = z.object({
	speed: z.number().default(2),
	direction: z
		.object({ x: z.number(), y: z.number() })
		.default({ x: 1, y: 0 }),
	center: z.object({ x: z.number(), y: z.number() }).default({ x: 0, y: 0 }),
	radius: z.number().default(100),
});

export type WalkBackAndForthBehaviorDto = z.input<
	typeof walkBackAndForthBehaviorDtoSchema
>;

export default class WalkBackAndForthBehavior extends Module {
	accessor speed: number = 2;
	accessor direction: Vec2Like = { x: 1, y: 0 };
	accessor center: Vec2Like = { x: 0, y: 0 };
	accessor radius: number = 100;

	update() {
		const transform = this.owner.transform;
		transform.position.x += this.direction.x * this.speed;
		transform.position.y += this.direction.y * this.speed;

		this.checkForCollisionsAndReverse();
	}

	private checkForCollisionsAndReverse() {
		const game = this.owner.game;
		const check = this.getNextCheckPoint();

		if (this.pointOutOfBounds(check.x, check.y)) {
			this.direction.x *= -1;
			this.direction.y *= -1;
			return;
		}

		const collidingObjects = game
			.findObjectsByTag(TAG_LEVEL_STRUCTURE)
			.filter(
				Collider2d.collidingWith(new PointCollider(check.x, check.y)),
			);

		if (collidingObjects.length > 0) {
			this.direction.x *= -1;
			this.direction.y *= -1;
		}
	}

	private getNextCheckPoint(): Vec2Like {
		return {
			x:
				this.owner.transform.position.x +
				this.center.x +
				this.direction.x * (this.radius + this.speed),
			y:
				this.owner.transform.position.y +
				this.center.y +
				this.direction.y * (this.radius + this.speed),
		};
	}

	private pointOutOfBounds(x: number, y: number): boolean {
		const game = this.owner.game;
		return x < 0 || x > game.width || y < 0 || y > game.height;
	}

	serialize(): WalkBackAndForthBehaviorDto {
		return {
			speed: this.speed,
			direction: this.direction,
			center: this.center,
			radius: this.radius,
		};
	}

	static deserialize(
		obj: unknown,
		context: { gameObject: GameObject },
	): Result<Module, string> {
		const parseResult = walkBackAndForthBehaviorDtoSchema.safeParse(obj);
		if (!parseResult.success) {
			return Err(
				`Failed to deserialize WalkBackAndForthBehavior: ${parseResult.error.message}`,
			);
		}

		const data = parseResult.data;
		const module = context.gameObject.addModule(WalkBackAndForthBehavior);
		module.speed = data.speed;
		module.direction = data.direction;
		module.center = data.center;
		module.radius = data.radius;

		return Ok(module);
	}

	static {
		Module.serializer.registerSerializationType(
			'WalkBackAndForthBehavior',
			this,
		);
	}
}
