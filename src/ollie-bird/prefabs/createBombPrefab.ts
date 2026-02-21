import { CELL_SIZE, Layer, TAG_DEADLY, TAG_LEVEL_STRUCTURE } from '../const';
import { type GameObjectDto } from '../core/GameObject';
import type { Vec2Like } from '../core/math/Vec2';
import Module from '../core/Module';
import Animation, { type AnimationDto } from '../modules/Animation';
import BombBehavior from '../modules/BombBehavior';

export function createBombPrefab(position: Vec2Like) {
	return {
		version: 1,
		name: 'Bomb',
		tags: [TAG_LEVEL_STRUCTURE, TAG_DEADLY],
		layer: Layer.Enemys,
		transform: [position.x, position.y],
		modules: [
			{
				$type: Module.serializer.keyFor(Animation),
				data: {
					spriteSet: 'spriteset:bomb',
					rectangle: [
						-CELL_SIZE,
						-CELL_SIZE,
						CELL_SIZE * 2,
						CELL_SIZE * 2,
					],
					frameDuration: 0.4,
					loop: false,
					paused: true,
				} satisfies AnimationDto,
			},
			{
				$type: Module.serializer.keyFor(BombBehavior),
			},
		],
	} satisfies GameObjectDto;
}
