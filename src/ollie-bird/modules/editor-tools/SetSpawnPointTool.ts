import { CELL_SIZE } from '../../const';
import GameObject from '../../core/GameObject';
import { Button } from '../../core/input/Button';
import type { Pointer } from '../../core/input/Pointer';
import { Option } from '../../core/monad/Option';
import { createPlayerSpawnerPrefab } from '../../prefabs/createPlayerSpawnerPrefab';
import Resources from '../../Resources';
import PlayerSpawner from '../PlayerSpawner';
import ClickToPlaceTool from './ClickToPlaceTool';

export default class SetSpawnPointTool extends ClickToPlaceTool {
	static readonly displayName = 'SetSpawnPointTool';

	#ctrlKey: Button | null = null;

	protected override initialize(): void {
		super.initialize();

		this.#ctrlKey ??= this.game.input.keyboard.getButton('ControlLeft');
	}

	protected override handleClickToPlace(pointer: Pointer): void {
		const player = this.#ctrlKey?.isDown ? 1 : 0;

		this.game
			.findObjectsByTag('player-spawner')
			.flatMap((obj) => [...Option.of(obj.getModule(PlayerSpawner))])
			.filter((sp) => sp.playerIndex === player)
			.forEach((sp) => sp?.owner.destroy());

		GameObject.deserializePartial(
			createPlayerSpawnerPrefab(pointer, player),
			{
				game: this.game,
			},
		).logErr('Failed to create player spawner');
	}

	protected override renderToolPreview(
		context: CanvasRenderingContext2D,
	): void {
		Resources.instance.sprite
			.get('bird-icon')
			?.blit(
				context,
				-CELL_SIZE / 2,
				-CELL_SIZE / 2,
				CELL_SIZE,
				CELL_SIZE,
			);
	}
}
