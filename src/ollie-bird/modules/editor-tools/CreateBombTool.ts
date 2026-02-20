import { CELL_SIZE } from '../../const';
import type { Pointer } from '../../core/input/Pointer';
import { createBombPrefab } from '../../prefabs/createBombPrefab';
import Resources from '../../Resources';
import ClickToPlaceTool from './ClickToPlaceTool';

export default class CreateBombTool extends ClickToPlaceTool {
	static readonly displayName = 'CreateBombTool';

	protected override handleClickToPlace(pointer: Pointer): void {
		this.game.spawnPrefab(createBombPrefab(pointer));
	}

	protected override renderToolPreview(
		context: CanvasRenderingContext2D,
	): void {
		Resources.instance.sprite
			.get('bomb')
			?.blit(
				context,
				-CELL_SIZE,
				-CELL_SIZE,
				CELL_SIZE * 2,
				CELL_SIZE * 2,
			);
	}
}
