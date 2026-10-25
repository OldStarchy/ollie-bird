import { Layer, TAG_LEVEL_STRUCTURE } from '../const';
import { type GameObjectDto } from '../core/GameObject';
import type { Vec2Like } from '../core/math/Vec2';
import Module from '../core/Module';
import SpiderSpawner, { type SpiderSpawnerDto } from '../modules/SpiderSpawner';

export function createSpiderSpawnerPrefab(
	position: Vec2Like,
	startDirection: 'up' | 'down',
) {
	return {
		version: 1,
		name: 'Spider Spawner',
		tags: [TAG_LEVEL_STRUCTURE],
		layer: Layer.Foreground,
		transform: [position.x, position.y],
		modules: [
			{
				$type: Module.serializer.keyFor(SpiderSpawner),
				data: {
					startDirection,
				} satisfies SpiderSpawnerDto,
			},
		],
	} satisfies GameObjectDto;
}
