import { GRID_SIZE, LAYER_ENEMYS, TAG_LEVEL_OBJECT } from '../const';
import GameObject from '../GameObject';
import RectangleCollider from '../RectangleCollider';
import Obstacle from './Obstacle';

import baddie1 from '../../assets/baddie-1.png';
import baddie2 from '../../assets/baddie-2.png';

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
	}

	getCollider(): RectangleCollider {
		return new RectangleCollider(
			this.transform.position.x,
			this.transform.position.y + GRID_SIZE * 0.5,
			GRID_SIZE,
			GRID_SIZE * 0.5,
		);
	}

	protected override update() {
		const collider = new RectangleCollider(
			this.transform.position.x + this.dir + this.speed,
			this.transform.position.y,
			GRID_SIZE,
			GRID_SIZE,
		);

		const onGround = this.game.findObjectsByType(Obstacle).some((obj) => {
			const otherCollider = obj.getCollider();
			return otherCollider.isCollidingWith(collider);
		});

		if (
			onGround ||
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
		const disposable = this.transform.push(context);

		try {
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
		} finally {
			disposable[Symbol.dispose]();
		}
	}
}
