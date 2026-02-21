import { Layer, TAG_CHECKPOINT, TAG_LEVEL_STRUCTURE } from '../const';
import type { GameObjectDto } from '../core/GameObject';
import type { Rect2Like } from '../core/math/Rect2';
import Module from '../core/Module';
import CircleCollider2d, {
	type CircleCollider2dDto,
} from '../core/modules/colliders/CircleCollider2d';
import RectangleCollider2d, {
	type RectangleCollider2dDto,
} from '../core/modules/colliders/RectangleCollider2d';
import Checkpoint from '../modules/Checkpoint';

export default function createCheckpointPrefab({
	x,
	y,
	width,
	height,
}: Rect2Like) {
	const collider =
		width === height
			? {
					$type: Module.serializer.keyFor(CircleCollider2d),
					data: {
						center: [width / 2, height / 2],
						radius: Math.max(width, height) / 2,
					} satisfies CircleCollider2dDto,
				}
			: {
					$type: Module.serializer.keyFor(RectangleCollider2d),
					data: {
						rect: [0, 0, width, height],
					} satisfies RectangleCollider2dDto,
				};
	return {
		version: 1,
		name: 'Checkpoint',
		tags: [TAG_LEVEL_STRUCTURE, TAG_CHECKPOINT],
		layer: Layer.Items,
		transform: [x, y],
		modules: [
			collider,
			{
				$type: Module.serializer.keyFor(Checkpoint),
			},
		],
	} satisfies GameObjectDto;
}
