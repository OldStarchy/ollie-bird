import { Layer, TAG_GOAL, TAG_LEVEL_STRUCTURE } from '../const';
import type { GameObjectDto } from '../core/GameObject';
import type { Rect2Like } from '../core/math/Rect2';
import Module from '../core/Module';
import RectangleCollider2d, {
	type RectangleCollider2dDto,
} from '../core/modules/colliders/RectangleCollider2d';

export default function createGoalPrefab({ x, y, width, height }: Rect2Like) {
	return {
		version: 1,
		name: 'Goal',
		tags: [TAG_LEVEL_STRUCTURE, TAG_GOAL],
		layer: Layer.Background,
		transform: [x, y],
		modules: [
			{
				$type: Module.serializer.keyFor(RectangleCollider2d),
				data: {
					rect: [0, 0, width, height],
					base: {
						renderWidget: true,
					},
				} satisfies RectangleCollider2dDto,
			},
		],
	} satisfies GameObjectDto;
}
