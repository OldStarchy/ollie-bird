import { z } from 'zod';
import { Layer, TAG_LEVEL_STRUCTURE } from '../const';
import GameObject from '../core/GameObject';
import type IGame from '../core/IGame';
import type { ISerializable } from '../LevelStore';
import LevelStore from '../LevelStore';
import Bird from './Bird';

export const spawnPointDtoSchema = z.object({
	$type: z.string(),
	x: z.number(),
	y: z.number(),
});

export type SpawnPointDto = z.infer<typeof spawnPointDtoSchema>;

export const SpawnPointSerializationKey = 'SpawnPoint';

export default class SpawnPoint extends GameObject implements ISerializable {
	static readonly defaultName: string = 'Spawn Point';
	layer = Layer.Foreground;

	static {
		LevelStore.instance.register(SpawnPointSerializationKey, SpawnPoint);
	}

	protected override initialize() {
		this.onGameEvent('gameStart', () => {
			this.game
				.spawn(Bird)
				.transform.position.copy(this.transform.position);
		});
		this.tags.add(TAG_LEVEL_STRUCTURE);
	}

	protected override render(context: CanvasRenderingContext2D) {
		context.beginPath();
		context.arc(...this.transform.position.xy, 20, 0, Math.PI * 2);
		context.strokeStyle = 'yellow';
		context.setLineDash([5, 5]);
		context.stroke();
		context.setLineDash([]);
	}

	serialize(): SpawnPointDto {
		return {
			$type: SpawnPointSerializationKey,
			x: this.transform.position.x,
			y: this.transform.position.y,
		};
	}

	static spawnDeserialize(game: IGame, data: unknown): SpawnPoint | null {
		const parseResult = spawnPointDtoSchema.safeParse(data);
		if (!parseResult.success) {
			console.error(
				'Failed to parse SpawnPoint data:',
				parseResult.error,
			);
			return null;
		}

		const { x, y } = parseResult.data;
		const spawnPoint = game.spawn(SpawnPoint);
		spawnPoint.transform.position.set(x, y);
		return spawnPoint;
	}
}
