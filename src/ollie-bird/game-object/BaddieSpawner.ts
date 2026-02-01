import { Subject } from 'rxjs';
import { z } from 'zod';
import onChange from '../../react-interop/onChange';
import { ReactInterop } from '../../react-interop/ReactInterop';
import { CELL_SIZE, Layer, TAG_LEVEL_STRUCTURE } from '../const';
import GameObject, {
	gameObjectViewSchema,
	type GameObjectView,
} from '../core/GameObject';
import type IGame from '../core/IGame';
import type { ISerializable } from '../LevelStore';
import LevelStore from '../LevelStore';
import Baddie from './Baddie';

export const baddieSchema = z.object({
	startDirection: z.enum(['left', 'right']),
});

export type BaddieView = z.infer<typeof baddieSchema>;

export const baddieSpawnerDtoSchema = z.object({
	$type: z.string(),
	...gameObjectViewSchema.shape,
	...baddieSchema.shape,
});

export type BaddieSpawnerDto = z.infer<typeof baddieSpawnerDtoSchema>;

export default class BaddieSpawner
	extends GameObject
	implements ISerializable, ReactInterop<BaddieView>
{
	static readonly #serializationKey = 'BaddieSpawner';

	static {
		LevelStore.instance.register(
			BaddieSpawner.#serializationKey,
			BaddieSpawner,
		);
	}
	layer = Layer.Foreground;

	@onChange((self) => self.notifyChange())
	accessor startDirection: 'left' | 'right' = 'left';

	[ReactInterop.get]() {
		return {
			startDirection: this.startDirection,
			...super[ReactInterop.get](),
		};
	}

	[ReactInterop.set](data: BaddieView & GameObjectView): void {
		this.startDirection = data.startDirection;
		super[ReactInterop.set](data);
	}

	private readonly change = new Subject<void>();
	private notifyChange() {
		this.change.next();
	}
	[ReactInterop.schema] = z.object({
		...gameObjectViewSchema.shape,
		...baddieSchema.shape,
	});
	readonly [ReactInterop.asObservable] = this.change.asObservable();

	protected override initialize(): void {
		this.tags.add(TAG_LEVEL_STRUCTURE);
		this.onGameEvent('gameStart', () => {
			const baddie = this.game.spawn(Baddie);
			baddie.transform.position.copy(this.transform.position);
			baddie.dir = this.startDirection === 'left' ? -1 : 1;
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
			$type: BaddieSpawner.#serializationKey,
			...this[ReactInterop.get](),
		};
	}

	static spawnDeserialize(game: IGame, data: unknown): BaddieSpawner {
		const parseResult = baddieSpawnerDtoSchema.parse(data);

		const { x, y } = parseResult.position;
		const spawner = game.spawn(BaddieSpawner);
		spawner.name = parseResult.name;
		spawner.transform.position.set(x, y);
		spawner.startDirection = parseResult.startDirection;
		return spawner;
	}
}
