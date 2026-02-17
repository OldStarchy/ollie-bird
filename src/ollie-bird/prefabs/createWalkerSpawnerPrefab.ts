import { Layer, TAG_LEVEL_STRUCTURE } from '../const';
import { type GameObjectDto } from '../core/GameObject';
import type { Vec2Like } from '../core/math/Vec2';
import Module from '../core/Module';
import WalkerSpawner, { type WalkerSpawnerDto } from '../modules/WalkerSpawner';

export function createWalkerSpawnerPrefab(
	position: Vec2Like,
	startDirection: 'left' | 'right',
) {
	return {
		version: 1,
		name: 'Walker Spawner',
		tags: [TAG_LEVEL_STRUCTURE],
		layer: Layer.Foreground,
		transform: [position.x, position.y],
		modules: [
			{
				$type: Module.serializer.keyFor(WalkerSpawner),
				data: {
					startDirection,
				} satisfies WalkerSpawnerDto,
			},
		],
	} satisfies GameObjectDto;
}
