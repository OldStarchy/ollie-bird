import { Subject } from 'rxjs';
import { toss } from 'toss-expression';
import { z } from 'zod';
import baddie1 from '../../assets/baddie-1.png';
import baddie2 from '../../assets/baddie-2.png';
import onChange from '../../react-interop/onChange';
import { ReactInterop } from '../../react-interop/ReactInterop';
import {
	CELL_SIZE,
	Layer,
	TAG_DEADLY,
	TAG_LEVEL_OBJECT,
	TAG_LEVEL_STRUCTURE,
} from '../const';
import GameObject, {
	gameObjectSchema,
	type GameObjectView,
} from '../core/GameObject';
import type IGame from '../core/IGame';
import RectangleCollider2d from '../core/modules/colliders/RectangleCollider2d';
import filterEvent from '../core/rxjs/filterEvent';
import Sprite from '../core/Sprite';
import Animation from '../modules/Animation';
import WalkBackAndForthBehavior from '../modules/WalkBackAndForthBehavior';
import LevelEditor from './LevelEditor';

export const baddieSchema = z.object({
	startDirection: z.enum(['left', 'right']),
});

export type BaddieView = z.infer<typeof baddieSchema>;

export const baddieSpawnerDtoSchema = z.object({
	$type: z.string(),
	...gameObjectSchema.shape,
	...baddieSchema.shape,
});

export type BaddieSpawnerDto = z.infer<typeof baddieSpawnerDtoSchema>;

export default class BaddieSpawner
	extends GameObject
	implements ReactInterop<BaddieView>
{
	static readonly defaultName: string = 'Baddie Spawner';

	static frames = [baddie1, baddie2].map((src) => new Sprite(src));

	constructor(game: IGame) {
		super(game);

		this.layer = Layer.Foreground;
	}

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
		...gameObjectSchema.shape,
		...baddieSchema.shape,
	});
	readonly [ReactInterop.asObservable] = this.change.asObservable();

	protected override initialize(): void {
		this.tags.add(TAG_LEVEL_STRUCTURE);

		const levelController =
			this.game.findObjectsByType(LevelEditor)[0] ??
			toss(
				new Error(`${BaddieSpawner.name} requires ${LevelEditor.name}`),
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
		const baddie = this.game.spawn(GameObject);
		baddie.name = `Baddie (${this.name})`;

		baddie.layer = Layer.Enemys;
		baddie.tags.add(TAG_LEVEL_OBJECT);
		baddie.tags.add(TAG_DEADLY);

		baddie.addModule(RectangleCollider2d).setRect({
			x: 0,
			y: CELL_SIZE * 0.5,
			width: CELL_SIZE,
			height: CELL_SIZE * 0.5,
		});

		const anim = baddie.addModule(Animation, BaddieSpawner.frames, 0.3);
		anim.rectangle.set(0, CELL_SIZE / 2, CELL_SIZE, CELL_SIZE / 2);

		baddie.transform.position.copy(this.transform.position);

		const walkBehavior = baddie.addModule(WalkBackAndForthBehavior);
		walkBehavior.direction =
			this.startDirection === 'left' ? { x: -1, y: 0 } : { x: 1, y: 0 };
		walkBehavior.center = {
			x: CELL_SIZE / 2,
			y: CELL_SIZE * 0.75,
		};
		walkBehavior.radius = CELL_SIZE / 2;
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
}
