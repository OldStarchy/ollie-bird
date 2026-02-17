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
import LevelEditor from '../game-object/LevelEditor';
import { createWalkerPrefab } from '../prefabs/createWalkerPrefab';

export const walkerSpawnerViewSchema = z.object({
	startDirection: z.enum(['left', 'right']),
});

export type WalkerSpawnerView = z.infer<typeof walkerSpawnerViewSchema>;

export const walkerSpawnerDtoSchema = z.object({
	startDirection: z.enum(['left', 'right']),
});

export type WalkerSpawnerDto = z.input<typeof walkerSpawnerDtoSchema>;

export default class WalkerSpawner
	extends Module
	implements ReactInterop<WalkerSpawnerView>
{
	@onChange((self) => self.notifyChange())
	accessor startDirection: 'left' | 'right' = 'left';

	[ReactInterop.get]() {
		return {
			startDirection: this.startDirection,
		};
	}

	[ReactInterop.set](data: WalkerSpawnerView): void {
		if (Object.hasOwn(data, 'startDirection')) {
			this.startDirection = data.startDirection;
		}
	}

	private readonly change = new Subject<void>();
	private notifyChange() {
		this.change.next();
	}
	[ReactInterop.schema] = walkerSpawnerViewSchema;
	readonly [ReactInterop.asObservable] = this.change.asObservable();

	protected override initialize(): void {
		const levelController =
			this.game.findObjectsByType(LevelEditor)[0] ??
			toss(
				new Error(`${WalkerSpawner.name} requires ${LevelEditor.name}`),
			);

		this.disposableStack.use(
			levelController.levelEvent$
				.pipe(filterEvent('levelStart'))
				.subscribe(() => {
					this.createBaddie();
				}),
		);
	}

	private createBaddie() {
		GameObject.deserializePartial(
			createWalkerPrefab(
				this.transform.position,
				this.startDirection,
				this.owner.name,
			),
			{ game: this.game },
		).unwrap();
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

	serialize(): WalkerSpawnerDto {
		return {
			startDirection: this.startDirection,
		};
	}

	static deserialize(
		obj: unknown,
		context: { gameObject: GameObject },
	): Result<Module, string> {
		const parsed = walkerSpawnerDtoSchema.safeParse(obj);

		if (!parsed.success) {
			return Err(`Invalid data: ${parsed.error.message}`);
		}

		const { startDirection } = parsed.data;

		const module = context.gameObject.addModule(WalkerSpawner);
		module.startDirection = startDirection;

		return Ok(module);
	}

	static {
		Module.serializer.registerSerializationType('WalkerSpawner', this);
	}
}
