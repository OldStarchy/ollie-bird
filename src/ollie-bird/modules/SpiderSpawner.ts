import { Subject } from 'rxjs';
import { toss } from 'toss-expression';
import { z } from 'zod';
import onChange from '../../react-interop/onChange';
import { ReactInterop } from '../../react-interop/ReactInterop';
import { CELL_SIZE } from '../const';
import GameObject from '../core/GameObject';
import Module from '../core/Module';
import { Err, Ok, type Result } from '../core/monad/Result';
import filterEvent from '../core/rxjs/filterEvent';
import {
	createSpiderPrefab,
	SPIDER_THREAD_X,
	SPIDER_THREAD_Y,
} from '../prefabs/createSpiderPrefab';
import LevelGameplayManager from './LevelGameplayManager';
import SpiderThread from './SpiderThread';

export const spiderSpawnerViewSchema = z.object({
	startDirection: z.enum(['up', 'down']),
});

export type SpiderSpawnerView = z.infer<typeof spiderSpawnerViewSchema>;

export const spiderSpawnerDtoSchema = z.object({
	startDirection: z.enum(['up', 'down']),
});

export type SpiderSpawnerDto = z.input<typeof spiderSpawnerDtoSchema>;

export default class SpiderSpawner
	extends Module
	implements ReactInterop<SpiderSpawnerView>
{
	@onChange((self) => self.notifyChange())
	accessor startDirection: 'up' | 'down' = 'down';

	[ReactInterop.get]() {
		return {
			startDirection: this.startDirection,
		};
	}

	[ReactInterop.set](data: SpiderSpawnerView): void {
		if (Object.hasOwn(data, 'startDirection')) {
			this.startDirection = data.startDirection;
		}
	}

	private readonly change = new Subject<void>();
	private notifyChange() {
		this.change.next();
	}
	[ReactInterop.schema] = spiderSpawnerViewSchema;
	readonly [ReactInterop.asObservable] = this.change.asObservable();

	protected override initialize(): void {
		const levelController =
			this.owner.game.findModuleByType(LevelGameplayManager) ??
			toss(
				new Error(
					`${SpiderSpawner.name} requires ${LevelGameplayManager.name}`,
				),
			);

		this.disposableStack.use(
			levelController.event$
				.pipe(filterEvent('levelStart'))
				.subscribe(() => {
					this.createSpider();
				}),
		);
	}

	private createSpider() {
		const position = this.transform.position;
		const anchorY = SpiderThread.findAnchorY(this.game, {
			x: position.x + SPIDER_THREAD_X,
			y: position.y + SPIDER_THREAD_Y,
		});

		this.game.spawnPrefab(
			createSpiderPrefab(
				position,
				this.startDirection,
				anchorY,
				this.owner.name,
			),
		);
	}

	protected override render(context: CanvasRenderingContext2D) {
		context.beginPath();
		context.rect(
			this.transform.position.x + CELL_SIZE * 0.2,
			this.transform.position.y + CELL_SIZE * 0.2,
			CELL_SIZE * 0.6,
			CELL_SIZE * 0.6,
		);
		context.strokeStyle = 'red';
		context.setLineDash([5, 5]);
		context.stroke();
		context.setLineDash([]);
	}

	serialize(): SpiderSpawnerDto {
		return {
			startDirection: this.startDirection,
		};
	}

	static deserialize(
		obj: unknown,
		context: { gameObject: GameObject },
	): Result<Module, string> {
		const parsed = spiderSpawnerDtoSchema.safeParse(obj);

		if (!parsed.success) {
			return Err(`Invalid data: ${parsed.error.message}`);
		}

		const { startDirection } = parsed.data;

		const module = context.gameObject.addModule(SpiderSpawner);
		module.startDirection = startDirection;

		return Ok(module);
	}

	static {
		Module.serializer.registerSerializationType('SpiderSpawner', this);
	}
}
