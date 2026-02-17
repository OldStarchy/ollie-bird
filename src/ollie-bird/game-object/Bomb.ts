import { filter } from 'rxjs';
import { toss } from 'toss-expression';
import { z } from 'zod';
import { CELL_SIZE, TAG_DEADLY, TAG_LEVEL_STRUCTURE } from '../const';
import GameObject from '../core/GameObject';
import Collider2d from '../core/modules/Collider2d';
import CircleCollider2d from '../core/modules/colliders/CircleCollider2d';
import filterEvent from '../core/rxjs/filterEvent';
import Animation from '../modules/Animation';
import Resources from '../Resources';
import Bird from './Bird';
import LevelEditor from './LevelEditor';

export const bombDtoSchema = z.object({
	$type: z.string(),
	x: z.number(),
	y: z.number(),
});

export type BombDto = z.input<typeof bombDtoSchema>;

export default class Bomb extends GameObject {
	static readonly defaultName: string = 'Bomb';

	private anim!: Animation;
	private collider!: CircleCollider2d;
	private triggerCollider!: CircleCollider2d;

	protected override initialize(): void {
		super.initialize();
		this.layer = 150;
		this.tags.add(TAG_DEADLY);
		this.tags.add(TAG_LEVEL_STRUCTURE);

		this.anim = this.addModule(Animation);
		this.anim.images = Resources.instance.spriteSet.get('bomb');
		this.anim.frameDuration = 0.4;
		this.anim.loop = false;
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

		const levelController =
			this.game.findObjectsByType(LevelEditor)[0] ??
			toss(new Error(`${Bomb.name} requires ${LevelEditor.name}`));

		this.disposableStack.use(
			levelController.levelEvent$
				.pipe(filterEvent('levelStart'))
				.subscribe(() => {
					this.anim.enabled = true;
					this.anim.paused = true;
					this.anim.currentFrame = 0;
					this.anim.frameDuration = 0.4;
					this.collider.enabled = false;
					this.triggerCollider.enabled = false;
				}),
		);
	}

	#wasFrame4 = false;
	protected override beforeUpdate(): void {
		const currentFrame = this.anim.currentFrame;

		if (currentFrame === 4) {
			this.collider.enabled = true;

			if (!this.#wasFrame4) {
				this.game.findObjectsByType(Bird).forEach((bird) =>
					bird.controls.Vibrate?.playEffect('dual-rumble', {
						duration: 100,
						startDelay: 0,
						strongMagnitude: 0.0,
						weakMagnitude: 0.5,
					}),
				);
			}
			this.#wasFrame4 = true;
		} else {
			this.#wasFrame4 = false;
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
}
