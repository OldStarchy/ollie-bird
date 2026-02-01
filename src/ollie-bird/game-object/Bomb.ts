import { filter } from 'rxjs';
import { z } from 'zod';
import { CELL_SIZE, TAG_DEADLY, TAG_LEVEL_STRUCTURE } from '../const';
import GameObject from '../core/GameObject';
import type IGame from '../core/IGame';
import Collider2d from '../core/modules/Collider2d';
import CircleCollider2d from '../core/modules/colliders/CircleCollider2d';
import type { ISerializable } from '../LevelStore';
import LevelStore from '../LevelStore';
import Animation from '../modules/Animation';
import Resources from '../Resources';
import Bird from './Bird';

export const bombDtoSchema = z.object({
	$type: z.string(),
	x: z.number(),
	y: z.number(),
});

export type BombDto = z.infer<typeof bombDtoSchema>;

export default class Bomb extends GameObject implements ISerializable {
	static {
		LevelStore.register(Bomb.name, Bomb);
	}

	private anim!: Animation;
	private collider!: CircleCollider2d;
	private triggerCollider!: CircleCollider2d;

	protected override initialize(): void {
		super.initialize();
		this.layer = 150;
		this.tags.add(TAG_DEADLY);
		this.tags.add(TAG_LEVEL_STRUCTURE);

		this.anim = this.addModule(Animation, Resources.bomb, 0.4, false);
		this.anim.paused = true;
		this.disposableStack.use(
			this.anim.events$
				.pipe(filter((e) => e === 'ended'))
				.subscribe(() => {
					this.anim.enabled = false;
					this.collider.enabled = false;
				}),
		);

		this.anim.rectangle.set(
			-CELL_SIZE,
			-CELL_SIZE,
			CELL_SIZE * 2,
			CELL_SIZE * 2,
		);

		this.collider = this.addModule(CircleCollider2d);
		this.collider.radius = CELL_SIZE * 4;
		this.collider.enabled = false;
		this.collider.renderWidget = true;

		this.triggerCollider = this.addModule(CircleCollider2d);
		this.triggerCollider.radius = CELL_SIZE * 2;
		this.triggerCollider.enabled = false; //disable to prevent it killing the player
		this.triggerCollider.renderWidget = true;

		this.onGameEvent('gameStart', () => {
			this.anim.enabled = true;
			this.anim.paused = true;
			this.anim.currentFrame = 0;
			this.collider.enabled = false;
			this.triggerCollider.enabled = false;
		});
	}

	protected override beforeUpdate(): void {
		const currentFrame = this.anim.currentFrame;

		if (currentFrame === 4) {
			this.collider.enabled = true;
		}
	}

	protected override update() {
		if (this.anim.currentFrame > 3) {
			this.anim.frameDuration = 0.1;
		}

		if (this.anim.paused) {
			const myCollider = this.triggerCollider.getCollider();

			const hitBird = this.game
				.findObjectsByType(Bird)
				.some(Collider2d.collidingWith(myCollider));

			if (hitBird) {
				this.anim.paused = false;
			}
		}
	}

	serialize(): BombDto {
		return {
			$type: this.constructor.name,
			x: this.transform.position.x,
			y: this.transform.position.y,
		};
	}

	static spawnDeserialize(game: IGame, data: unknown): Bomb | null {
		const parseResult = bombDtoSchema.safeParse(data);
		if (!parseResult.success) {
			console.error('Failed to parse Bomb data:', parseResult.error);
			return null;
		}

		const { x, y } = parseResult.data;
		const bomb = game.spawn(Bomb);
		bomb.transform.position.set(x, y);
		return bomb;
	}
}
