import { CELL_SIZE } from '../../const';
import GameObject from '../../core/GameObject';
import type { Pointer } from '../../core/input/Pointer';
import { createWalkerSpawnerPrefab } from '../../prefabs/createWalkerSpawnerPrefab';
import Resources from '../../Resources';
import ClickToPlaceTool from './ClickToPlaceTool';

export default class CreateWalkerSpawnerTool extends ClickToPlaceTool {
	static readonly displayName = 'CreateWalkerSpawnerTool';

	protected override handleClickToPlace(pointer: Pointer): void {
		GameObject.deserializePartial(
			createWalkerSpawnerPrefab(pointer, 'left'),
			{
				game: this.game,
			},
		).logErr('Failed to create walker spawner');
	}

	protected override renderToolPreview(
		context: CanvasRenderingContext2D,
	): void {
		Resources.instance.sprite
			.get('walker')
			?.blit(context, 0, CELL_SIZE / 2, CELL_SIZE, CELL_SIZE / 2);
	}
}
