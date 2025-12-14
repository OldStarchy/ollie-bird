import RectangleCollider from '../collider/RectangleCollider';
import { GRID_SIZE, LAYER_ENEMYS, TAG_LEVEL_OBJECT } from '../const';
import GameObject from '../GameObject';
import Obstacle from './Obstacle';

import baddie1 from '../../assets/baddie-1.png';
import baddie2 from '../../assets/baddie-2.png';
import RayCollider from '../collider/RayCollider';
import Collider2d from '../modules/Collider2d';

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
		this.addModule(Collider2d).collider = new RectangleCollider(
			0,
			GRID_SIZE / 2,
			GRID_SIZE,
			GRID_SIZE / 2,
		);
	}

	protected override update() {
		const ray = new RayCollider({ x: this.dir, y: 0 }, this.speed);

		const hit = this.game
			.findModulesByType(Collider2d)
			.filter((col) => col.owner instanceof Obstacle)
			.some((col) => {
				ray.checkCollision(
					this.transform.position,
					col.collider,
					col.owner.transform.position,
				);
			});

		if (
			hit ||
			this.transform.position.x < 0 ||
			this.transform.position.x > this.game.canvas.width
		) {
			this.dir *= -1;
		} else {
			this.transform.position.x += this.dir * this.speed;
		}

		this.time += 1;
	}

	protected override render(context: CanvasRenderingContext2D) {
		using _ = this.transform.push(context);

		context.fillStyle = 'red';
		context.fillRect(0, GRID_SIZE / 2, GRID_SIZE, GRID_SIZE / 2);

		const sprite =
			this.time % 20 < 10
				? Baddie.sprites.baddie1
				: Baddie.sprites.baddie2;

		context.drawImage(
			sprite,
			-GRID_SIZE * 0.2,
			-GRID_SIZE * 0.2 + GRID_SIZE / 2,
			GRID_SIZE * 1.4,
			(1.4 * GRID_SIZE) / 2,
		);
	}
}
