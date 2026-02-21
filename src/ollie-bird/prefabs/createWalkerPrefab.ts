import { CELL_SIZE, Layer, TAG_DEADLY, TAG_LEVEL_OBJECT } from '../const';
import { type GameObjectDto } from '../core/GameObject';
import type { Vec2Like } from '../core/math/Vec2';
import Module from '../core/Module';
import RectangleCollider2d, {
	type RectangleCollider2dDto,
} from '../core/modules/colliders/RectangleCollider2d';
import Animation, { type AnimationDto } from '../modules/Animation';
import WalkBackAndForthBehavior, {
	type WalkBackAndForthBehaviorDto,
} from '../modules/WalkBackAndForthBehavior';

export function createWalkerPrefab(
	position: Vec2Like,
	startDirection: 'left' | 'right',
	nameSuffix: string | undefined = undefined,
) {
	return {
		version: 1,
		name: 'Walker' + (nameSuffix ? ` (${nameSuffix})` : ''),
		tags: [TAG_LEVEL_OBJECT, TAG_DEADLY],
		layer: Layer.Enemys,
		transform: [position.x, position.y],
		modules: [
			{
				$type: Module.serializer.keyFor(RectangleCollider2d),
				data: {
					rect: [0, CELL_SIZE * 0.5, CELL_SIZE, CELL_SIZE * 0.5],
				} satisfies RectangleCollider2dDto,
			},
			{
				$type: Module.serializer.keyFor(WalkBackAndForthBehavior),
				data: {
					direction:
						startDirection === 'left'
							? { x: -1, y: 0 }
							: { x: 1, y: 0 },
					center: {
						x: CELL_SIZE / 2,
						y: CELL_SIZE * 0.75,
					},
					radius: CELL_SIZE / 2,
				} satisfies WalkBackAndForthBehaviorDto,
			},
			{
				$type: Module.serializer.keyFor(Animation),
				data: {
					spriteSet: 'spriteset:walker',
					rectangle: [0, CELL_SIZE * 0.5, CELL_SIZE, CELL_SIZE * 0.5],
					frameDuration: 0.3,
					loop: true,
					paused: false,
				} satisfies AnimationDto,
			},
		],
	} satisfies GameObjectDto;
}
