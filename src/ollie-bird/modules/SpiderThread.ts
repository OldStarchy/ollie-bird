import z from 'zod';
import contextCheckpoint from '../../contextCheckpoint';
import { TAG_LEVEL_STRUCTURE } from '../const';
import RayCollider from '../core/collider/RayCollider';
import type GameObject from '../core/GameObject';
import type IGame from '../core/IGame';
import type { Vec2Like } from '../core/math/Vec2';
import Module from '../core/Module';
import Collider2d from '../core/modules/Collider2d';
import { Err, Ok, type Result } from '../core/monad/Result';

const spiderThreadDtoSchema = z.object({
	anchorY: z.number().default(0),
	offset: z.object({ x: z.number(), y: z.number() }).default({ x: 0, y: 0 }),
});

export type SpiderThreadDto = z.input<typeof spiderThreadDtoSchema>;

/**
 * Renders a vertical thread from the owner up to a fixed point. Purely
 * cosmetic, the thread has no collider.
 */
export default class SpiderThread extends Module {
	/**
	 * World space y coordinate the thread hangs from.
	 */
	accessor anchorY: number = 0;
	/**
	 * Local offset of where the thread attaches to the owner.
	 */
	accessor offset: Vec2Like = { x: 0, y: 0 };

	protected override render(context: CanvasRenderingContext2D): void {
		const x = this.transform.position.x + this.offset.x;
		const y = this.transform.position.y + this.offset.y;

		using _ = contextCheckpoint(context);
		context.beginPath();
		context.moveTo(x, this.anchorY);
		context.lineTo(x, y);
		context.strokeStyle = 'rgba(70, 68, 72, 0.8)';
		context.lineWidth = 1;
		context.stroke();
	}

	/**
	 * Finds the y coordinate of the nearest level structure directly above
	 * `origin`, or 0 (the top of the level) if there is nothing above it.
	 */
	static findAnchorY(game: IGame, origin: Vec2Like): number {
		const structures = game.findObjectsByTag(TAG_LEVEL_STRUCTURE).toArray();
		const hitsWithin = (distance: number) =>
			structures.some(
				Collider2d.collidingWith(
					new RayCollider(origin, { x: 0, y: -1 }, distance),
				),
			);

		if (!hitsWithin(origin.y)) return 0;

		// A longer ray always hits whatever a shorter one does, so binary
		// search for the shortest ray that hits something.
		let min = 0;
		let max = origin.y;
		while (max - min > 0.5) {
			const mid = (min + max) / 2;
			if (hitsWithin(mid)) {
				max = mid;
			} else {
				min = mid;
			}
		}

		return origin.y - max;
	}

	serialize(): SpiderThreadDto {
		return {
			anchorY: this.anchorY,
			offset: this.offset,
		};
	}

	static deserialize(
		obj: unknown,
		context: { gameObject: GameObject },
	): Result<Module, string> {
		const parseResult = spiderThreadDtoSchema.safeParse(obj);
		if (!parseResult.success) {
			return Err(
				`Failed to deserialize SpiderThread: ${parseResult.error.message}`,
			);
		}

		const data = parseResult.data;
		const module = context.gameObject.addModule(SpiderThread);
		module.anchorY = data.anchorY;
		module.offset = data.offset;

		return Ok(module);
	}

	static {
		Module.serializer.registerSerializationType('SpiderThread', this);
	}
}
