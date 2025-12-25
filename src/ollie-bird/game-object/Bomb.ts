import { CELL_SIZE, TAG_DEADLY, TAG_LEVEL_STRUCTURE } from '../const';
import GameObject from '../GameObject';
import Animation from '../modules/Animation';
import CircleCollider2d from '../modules/CircleCollider2d';
import Collider2d from '../modules/Collider2d';
import Resources from '../Resources';
import Bird from './Bird';

export default class Bomb extends GameObject {
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
		this.anim.events.on('ended', () => {
			this.anim.enabled = false;
			this.collider.enabled = false;
		});

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
		if (!this.anim.paused) {
			return;
		}

		const myCollider = this.triggerCollider.getCollider();

		const hitBird = this.game
			.findObjectsByType(Bird)
			.some(Collider2d.collidingWith(myCollider));

		if (hitBird) {
			this.anim.paused = false;
		}
	}
}
