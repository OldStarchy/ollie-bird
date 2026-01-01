import { z } from 'zod';
import { CELL_SIZE, LAYER_FOREGROUND, TAG_LEVEL_STRUCTURE } from '../const';
import GameObject from '../core/GameObject';
import type IGame from '../core/IGame';
import type { ISerializable } from '../LevelStore';
import Baddie from './Baddie';

export const baddieSpawnerDtoSchema = z.object({
	$type: z.string(),
	x: z.number(),
	y: z.number(),
});

export type BaddieSpawnerDto = z.infer<typeof baddieSpawnerDtoSchema>;

export default class BaddieSpawner extends GameObject implements ISerializable {
	layer = LAYER_FOREGROUND;

	protected override initialize(): void {
		this.tags.add(TAG_LEVEL_STRUCTURE);
		this.onGameEvent('gameStart', () => {
			const baddie = this.game.spawn(Baddie);
			baddie.transform.position.copy(this.transform.position);
		});
	}

	protected override render(context: CanvasRenderingContext2D) {
		context.beginPath();
		context.rect(
			this.transform.position.x,
			this.transform.position.y + CELL_SIZE / 2,
			CELL_SIZE,
			CELL_SIZE / 2,
		);
		context.strokeStyle = 'red';
		context.setLineDash([5, 5]);
		context.stroke();
		context.setLineDash([]);
	}

	serialize(): BaddieSpawnerDto {
		return {
			$type: this.constructor.name,
			x: this.transform.position.x,
			y: this.transform.position.y,
		};
	}

	static spawnDeserialize(game: IGame, data: unknown): BaddieSpawner | null {
		const parseResult = baddieSpawnerDtoSchema.safeParse(data);
		if (!parseResult.success) {
			console.error(
				'Failed to parse BaddieSpawner data:',
				parseResult.error,
			);
			return null;
		}

		const { x, y } = parseResult.data;
		const spawner = game.spawn(BaddieSpawner);
		spawner.transform.position.set(x, y);
		return spawner;
	}
}
