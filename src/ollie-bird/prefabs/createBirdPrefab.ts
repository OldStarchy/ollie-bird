import { Layer, TAG_LEVEL_OBJECT, TAG_PLAYER } from '../const';
import { type GameObjectDto } from '../core/GameObject';
import type { Vec2Like } from '../core/math/Vec2';
import Module from '../core/Module';
import CircleCollider2d, {
	type CircleCollider2dDto,
} from '../core/modules/colliders/CircleCollider2d';
import BirdBehavior, {
	type BirdBehaviorDto,
} from '../modules/bird/BirdBehavior';

export function createBirdPrefab(position: Vec2Like, playerIndex: 0 | 1) {
	return {
		version: 1,
		name: 'Bird',
		tags: [TAG_LEVEL_OBJECT, TAG_PLAYER],
		layer: Layer.Player,
		transform: [position.x, position.y],
		modules: [
			{
				$type: Module.serializer.keyFor(BirdBehavior),
				data: {
					playerIndex,
				} satisfies BirdBehaviorDto,
			},
			{
				$type: Module.serializer.keyFor(CircleCollider2d),
				data: {
					radius: 20,
				} satisfies CircleCollider2dDto,
			},
		],
	} satisfies GameObjectDto;
}
