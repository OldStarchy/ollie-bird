import { Subject } from 'rxjs';
import { toss } from 'toss-expression';
import z from 'zod';
import onChange from '../../react-interop/onChange';
import { ReactInterop } from '../../react-interop/ReactInterop';
import type GameObject from '../core/GameObject';
import Module from '../core/Module';
import { Err, Ok, type Result } from '../core/monad/Result';
import filterEvent from '../core/rxjs/filterEvent';
import Bird from '../game-object/Bird';
import LevelEditor from '../game-object/LevelEditor';

export const playerSpawnerDtoSchema = z.object({
	playerIndex: z.union([z.literal(0), z.literal(1)]),
});
export type PlayerSpawnerDto = z.infer<typeof playerSpawnerDtoSchema>;

export default class PlayerSpawner
	extends Module
	implements ReactInterop<PlayerSpawnerDto>
{
	static readonly displayName = 'Player Spawner';

	#change = new Subject<void>();

	@onChange((self) => self.#change.next())
	accessor playerIndex: 0 | 1 = 0;

	protected override initialize() {
		const levelController =
			this.game.findObjectsByType(LevelEditor)[0] ??
			toss(
				new Error(
					`${PlayerSpawner.displayName} requires ${LevelEditor.name}`,
				),
			);

		this.disposableStack.use(
			levelController.levelEvent$
				.pipe(filterEvent('levelStart'))
				.subscribe(() => {
					const bird = this.game.spawn(Bird);
					bird.playerIndex = this.playerIndex;
					bird.transform.position.copy(this.transform.position);
				}),
		);
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

	[ReactInterop.get](): PlayerSpawnerDto {
		return {
			playerIndex: this.playerIndex,
		};
	}

	[ReactInterop.set](value: PlayerSpawnerDto): void {
		if (Object.hasOwn(value, 'playerIndex')) {
			this.playerIndex = value.playerIndex as 0 | 1;
		}
	}

	readonly [ReactInterop.schema] = playerSpawnerDtoSchema;
	readonly [ReactInterop.asObservable] = this.#change.asObservable();

	override serialize(): PlayerSpawnerDto {
		return {
			playerIndex: this.playerIndex,
		};
	}

	static deserialize(
		obj: unknown,
		context: { gameObject: GameObject },
	): Result<PlayerSpawner, string> {
		const parsed = playerSpawnerDtoSchema.safeParse(obj);

		if (!parsed.success) {
			return Err(`Invalid PlayerSpawner data: ${parsed.error.message}`);
		}

		const spawner = context.gameObject.addModule(PlayerSpawner);

		spawner.playerIndex = parsed.data.playerIndex;

		return Ok(spawner);
	}

	static {
		Module.serializer.registerSerializationType('PlayerSpawner', this);
	}
}
