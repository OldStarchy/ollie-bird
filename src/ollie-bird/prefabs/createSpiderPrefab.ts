import { CELL_SIZE, Layer, TAG_DEADLY, TAG_LEVEL_OBJECT } from '../const';
import { type GameObjectDto } from '../core/GameObject';
import type { Vec2Like } from '../core/math/Vec2';
import Module from '../core/Module';
import RectangleCollider2d, {
	type RectangleCollider2dDto,
} from '../core/modules/colliders/RectangleCollider2d';
import Animation, { type AnimationDto } from '../modules/Animation';
import SpiderThread, { type SpiderThreadDto } from '../modules/SpiderThread';
import WalkBackAndForthBehavior, {
	type WalkBackAndForthBehaviorDto,
} from '../modules/WalkBackAndForthBehavior';

/**
 * Local x coordinate the thread attaches to the spider at.
 */
export const SPIDER_THREAD_X = CELL_SIZE / 2;
/**
 * Local y coordinate the thread attaches to the spider at.
 */
export const SPIDER_THREAD_Y = CELL_SIZE * 0.3;

export function createSpiderPrefab(
	position: Vec2Like,
	startDirection: 'up' | 'down',
	threadAnchorY: number,
	nameSuffix: string | undefined = undefined,
) {
	return {
		version: 1,
		name: 'Spider' + (nameSuffix ? ` (${nameSuffix})` : ''),
		tags: [TAG_LEVEL_OBJECT, TAG_DEADLY],
		layer: Layer.Enemys,
		transform: [position.x, position.y],
		modules: [
			{
				$type: Module.serializer.keyFor(RectangleCollider2d),
				data: {
					rect: [
						CELL_SIZE * 0.2,
						CELL_SIZE * 0.2,
						CELL_SIZE * 0.6,
						CELL_SIZE * 0.6,
					],
				} satisfies RectangleCollider2dDto,
			},
			{
				$type: Module.serializer.keyFor(WalkBackAndForthBehavior),
				data: {
					direction:
						startDirection === 'up'
							? { x: 0, y: -1 }
							: { x: 0, y: 1 },
					center: {
						x: CELL_SIZE / 2,
						y: CELL_SIZE / 2,
					},
					radius: CELL_SIZE * 0.3,
				} satisfies WalkBackAndForthBehaviorDto,
			},
			{
				$type: Module.serializer.keyFor(SpiderThread),
				data: {
					anchorY: threadAnchorY,
					offset: { x: SPIDER_THREAD_X, y: SPIDER_THREAD_Y },
				} satisfies SpiderThreadDto,
			},
			{
				$type: Module.serializer.keyFor(Animation),
				data: {
					spriteSet: 'spriteset:spider',
					rectangle: [0, 0, CELL_SIZE, CELL_SIZE],
					frameDuration: 0.3,
					loop: true,
					paused: false,
				} satisfies AnimationDto,
			},
		],
	} satisfies GameObjectDto;
}
