import {
	CELL_SIZE,
	LAYER_ENEMYS,
	TAG_DEADLY,
	TAG_LEVEL_OBJECT,
} from '../const';
import GameObject from '../core/GameObject';
import RectangleCollider2d from '../modules/RectangleCollider2d';

import baddie1 from '../../assets/baddie-1.png';
import baddie2 from '../../assets/baddie-2.png';
import RayCollider from '../collider/RayCollider';
import Sprite from '../core/Sprite';
import Animation from '../modules/Animation';
import Collider2d from '../modules/Collider2d';
import Obstacle from './Obstacle';

export default class Baddie extends GameObject {
	layer = LAYER_ENEMYS;
	dir = Math.sign(Math.random() - 0.5) || 1;
	speed = 2;

	static frames = [baddie1, baddie2].map((src) => new Sprite(src));

	protected override initialize(): void {
		this.tags.add(TAG_LEVEL_OBJECT);
		this.tags.add(TAG_DEADLY);

		this.addModule(RectangleCollider2d, {
			x: 0,
			y: CELL_SIZE * 0.5,
			width: CELL_SIZE,
			height: CELL_SIZE * 0.5,
		});

		const anim = this.addModule(Animation, Baddie.frames, 0.3);
		anim.rectangle.set(0, CELL_SIZE / 2, CELL_SIZE, CELL_SIZE / 2);
	}

	protected override update() {
		const ray = new RayCollider(
			{
				x: this.transform.position.x + CELL_SIZE * 0.5,
				y: this.transform.position.y + CELL_SIZE * 0.75,
			},
			{ x: this.dir, y: 0 },
			CELL_SIZE / 2,
		);

		const hit =
			this.game
				.findObjectsByType(Obstacle)
				.filter(Collider2d.collidingWith(ray)).length > 0;

		if (hit) {
			this.dir *= -1;
		}

		const nextX = this.transform.position.x + this.dir * this.speed;

		if (nextX < 0 || nextX > this.game.width - CELL_SIZE) {
			this.dir *= -1;
		} else {
			this.transform.position.x = nextX;
		}
	}
}
