import { Layer, TAG_DEADLY, TAG_LEVEL_STRUCTURE } from '../const';
import type { GameObjectDto } from '../core/GameObject';
import type { Rect2Like } from '../core/math/Rect2';
import Module from '../core/Module';
import type { RectangleCollider2dDto } from '../core/modules/colliders/RectangleCollider2d';
import RectangleCollider2d from '../core/modules/colliders/RectangleCollider2d';
import WallRenderer from '../modules/WallRenderer';

export default function createWallPrefab({ x, y, width, height }: Rect2Like) {
	return {
		version: 1,
		name: 'Obstacle',
		tags: [TAG_LEVEL_STRUCTURE, TAG_DEADLY],
		layer: Layer.Background,
		transform: [x, y],
		modules: [
			{
				$type: Module.serializer.keyFor(RectangleCollider2d),
				data: {
					rect: [0, 0, width, height],
				} satisfies RectangleCollider2dDto,
			},
			{
				$type: Module.serializer.keyFor(WallRenderer),
			},
		],
	} satisfies GameObjectDto;
}
