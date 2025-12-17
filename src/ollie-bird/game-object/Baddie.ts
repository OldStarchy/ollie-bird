import { CELL_SIZE, LAYER_ENEMYS, TAG_LEVEL_OBJECT } from '../const';
import GameObject from '../GameObject';
import RectangleCollider2d from '../modules/RectangleCollider2d';

import baddie1 from '../../assets/baddie-1.png';
import baddie2 from '../../assets/baddie-2.png';
import RayCollider from '../collider/RayCollider';
import Collider2d from '../modules/Collider2d';
import Obstacle from './Obstacle';

export default class Baddie extends GameObject {
	layer = LAYER_ENEMYS;
	dir = Math.sign(Math.random() - 0.5) || 1;
	time = 0;
	speed = 2;

	static sprites = {
		baddie1: new Image(),
		baddie2: new Image(),
	};

	static {
		Baddie.sprites.baddie1.src = baddie1;
		Baddie.sprites.baddie2.src = baddie2;
	}

	protected override initialize(): void {
		this.tags.add(TAG_LEVEL_OBJECT);

		const hurtBox = this.addModule(RectangleCollider2d);
		hurtBox.left = 0;
		hurtBox.top = CELL_SIZE * 0.5;
		hurtBox.width = CELL_SIZE;
		hurtBox.height = CELL_SIZE * 0.5;
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

		if (nextX < 0 || nextX > this.game.canvas.width - CELL_SIZE) {
			this.dir *= -1;
		} else {
			this.transform.position.x = nextX;
		}

		this.time += 1;
	}

	protected override render(context: CanvasRenderingContext2D) {
		using _ = this.transform.push(context);

		context.fillStyle = 'red';
		context.fillRect(0, CELL_SIZE / 2, CELL_SIZE, CELL_SIZE / 2);

		const sprite =
			this.time % 20 < 10
				? Baddie.sprites.baddie1
				: Baddie.sprites.baddie2;

		context.drawImage(
			sprite,
			-CELL_SIZE * 0.2,
			-CELL_SIZE * 0.2 + CELL_SIZE / 2,
			CELL_SIZE * 1.4,
			(1.4 * CELL_SIZE) / 2,
		);
	}
}
