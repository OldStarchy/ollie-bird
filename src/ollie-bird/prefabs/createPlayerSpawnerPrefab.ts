import { Layer, TAG_LEVEL_STRUCTURE } from '../const';
import { type GameObjectDto } from '../core/GameObject';
import type { Vec2Like } from '../core/math/Vec2';
import Module from '../core/Module';
import PlayerSpawner, { type PlayerSpawnerDto } from '../modules/PlayerSpawner';

export function createPlayerSpawnerPrefab(position: Vec2Like, player: 0 | 1) {
	return {
		version: 1,
		name: 'Player Spawn Point',
		tags: ['player-spawner', TAG_LEVEL_STRUCTURE],
		layer: Layer.Foreground,
		transform: [position.x, position.y],
		modules: [
			{
				$type: Module.serializer.keyFor(PlayerSpawner),
				data: {
					playerIndex: player,
				} satisfies PlayerSpawnerDto,
			},
		],
	} satisfies GameObjectDto;
}
