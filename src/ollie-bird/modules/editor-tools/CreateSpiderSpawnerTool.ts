import { CELL_SIZE } from '../../const';
import type { Pointer } from '../../core/input/Pointer';
import { createSpiderSpawnerPrefab } from '../../prefabs/createSpiderSpawnerPrefab';
import Resources from '../../Resources';
import ClickToPlaceTool from './ClickToPlaceTool';

export default class CreateSpiderSpawnerTool extends ClickToPlaceTool {
	static readonly displayName = 'CreateSpiderSpawnerTool';

	protected override handleClickToPlace(pointer: Pointer): void {
		this.game.spawnPrefab(createSpiderSpawnerPrefab(pointer, 'down'));
	}

	protected override renderToolPreview(
		context: CanvasRenderingContext2D,
	): void {
		Resources.instance.sprite
			.get('spider')
			?.blit(context, 0, 0, CELL_SIZE, CELL_SIZE);
	}
}
