import { GRID_SIZE, TAG_LEVEL_OBJECT } from '../const';
import GameObject from '../GameObject';
import type IGame from '../IGame';
import RectangleCollider from '../RectangleCollider';
import Obstacle from './Obstacle';

import baddie1 from '../../assets/baddie-1.png';
import baddie2 from '../../assets/baddie-2.png';

export default class Baddie extends GameObject {
	layer = GameObject.LAYER_ENEMYS;
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

	constructor(game: IGame, public x: number, public y: number) {
		super(game);
		this.tags.add(TAG_LEVEL_OBJECT);
	}

	getCollider(): RectangleCollider {
		return new RectangleCollider(
			this.x,
			this.y + GRID_SIZE * 0.5,
			GRID_SIZE,
			GRID_SIZE * 0.5,
		);
	}

	step() {
		const collider = new RectangleCollider(
			this.x + this.dir + this.speed,
			this.y,
			GRID_SIZE,
			GRID_SIZE,
		);

		const onGround = [...this.game.objects]
			.filter((obj) => obj instanceof Obstacle)
			.some((obj) => {
				const otherCollider = obj.getCollider();
				return otherCollider.isCollidingWith(collider);
			});

		if (onGround || this.x < 0 || this.x > this.game.canvas.width) {
			this.dir *= -1;
		} else {
			this.x += this.dir * this.speed;
		}

		this.time += 1;
	}

	render(context: CanvasRenderingContext2D) {
		context.fillStyle = 'red';
		context.fillRect(
			this.x,
			this.y + GRID_SIZE / 2,
			GRID_SIZE,
			GRID_SIZE / 2,
		);

		const sprite =
			this.time % 20 < 10
				? Baddie.sprites.baddie1
				: Baddie.sprites.baddie2;

		context.drawImage(
			sprite,
			this.x - GRID_SIZE * 0.2,
			this.y - GRID_SIZE * 0.2 + GRID_SIZE / 2,
			GRID_SIZE * 1.4,
			(1.4 * GRID_SIZE) / 2,
		);
	}
}
