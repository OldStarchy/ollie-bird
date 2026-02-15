import { Layer, TAG_DEADLY, TAG_LEVEL_OBJECT } from '../const';
import type { GameObjectDto } from '../core/GameObject';
import type { Vec2Like } from '../core/math/Vec2';
import Module from '../core/Module';
import ExplosionBehavior from '../modules/ExplosionBehavior';

export default function createExplosionPrefab({ x, y }: Vec2Like) {
	return {
		version: 1,
		name: 'Explosion',
		layer: Layer.Foreground,
		tags: [TAG_LEVEL_OBJECT, TAG_DEADLY],
		transform: [x, y],
		modules: [
			{
				$type: Module.serializer.keyFor(ExplosionBehavior),
			},
		],
	} satisfies GameObjectDto;
}
