import { toss } from 'toss-expression';
import { z } from 'zod';
import { ReactInterop } from '../../react-interop/ReactInterop';
import { Layer, TAG_LEVEL_STRUCTURE } from '../const';
import GameObject, { gameObjectSchema } from '../core/GameObject';
import filterEvent from '../core/rxjs/filterEvent';
import Bird from './Bird';
import LevelEditor from './LevelEditor';

export const spawnPointDtoSchema = z.object({
	$type: z.string(),
	x: z.number(),
	y: z.number(),
	playerIndex: z.int().min(0).max(1).default(0),
});

export type SpawnPointDto = z.infer<typeof spawnPointDtoSchema>;

const spawnPointViewSchema = z.object({
	...gameObjectSchema.shape,
	playerIndex: z.coerce.number().int().min(0).max(1),
});

export type SpawnPointView = z.infer<typeof spawnPointViewSchema>;

export const SpawnPointSerializationKey = 'SpawnPoint';

export default class SpawnPoint
	extends GameObject
	implements ReactInterop<SpawnPointView>
{
	static readonly defaultName: string = 'Spawn Point';

	accessor playerIndex: 0 | 1 = 0;

	[ReactInterop.get](): SpawnPointView {
		return {
			...super[ReactInterop.get](),
			playerIndex: this.playerIndex,
		};
	}

	[ReactInterop.set](value: SpawnPointView): void {
		if (Object.hasOwn(value, 'playerIndex')) {
			this.playerIndex = value.playerIndex as 0 | 1;
		}

		super[ReactInterop.set](value);
	}

	readonly [ReactInterop.schema] = spawnPointViewSchema;

	protected override initialize() {
		this.layer = Layer.Foreground;
		const levelController =
			this.game.findObjectsByType(LevelEditor)[0] ??
			toss(new Error(`${SpawnPoint.name} requires ${LevelEditor.name}`));

		this.disposableStack.use(
			levelController.levelEvent$
				.pipe(filterEvent('levelStart'))
				.subscribe(() => {
					const bird = this.game.spawn(Bird);
					bird.playerIndex = this.playerIndex;
					bird.transform.position.copy(this.transform.position);
				}),
		);
		this.tags.add(TAG_LEVEL_STRUCTURE);
	}

	protected override render(context: CanvasRenderingContext2D) {
		context.beginPath();
		context.arc(...this.transform.position.xy, 20, 0, Math.PI * 2);
		if (this.playerIndex === 0) {
			context.strokeStyle = 'yellow';
		} else {
			context.strokeStyle = 'red';
		}
		context.setLineDash([15, 5]);
		context.lineWidth = 2;
		context.stroke();
		context.setLineDash([]);
	}
}
