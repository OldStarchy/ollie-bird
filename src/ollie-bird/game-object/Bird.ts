import birdDown from '../../assets/bird-down.png';
import birdRight from '../../assets/bird-right.png';
import birdUp from '../../assets/bird-up.png';
import ButtonState from '../ButtonState';
import CircleCollider from '../CircleCollider';
import { TAG_LEVEL_OBJECT } from '../const';
import GameObject from '../GameObject';
import type IGame from '../IGame';
import Vec2 from '../Vec2';
import Baddie from './Baddie';
import Explosion from './Explosion';
import Goal from './Goal';
import Obstacle from './Obstacle';

class Bird extends GameObject {
	layer = GameObject.LAYER_PLAYER;
	public position = new Vec2();

	public ySpeed: number = 0;

	static sprites = {
		right: new Image(),
		up: new Image(),
		down: new Image(),
	};

	static {
		this.sprites.right.src = birdRight;
		this.sprites.up.src = birdUp;
		this.sprites.down.src = birdDown;
	}

	constructor(game: IGame) {
		super(game);
		this.tags.add(TAG_LEVEL_OBJECT);
	}

	private paused: boolean = false;

	togglePause() {
		this.paused = !this.paused;
	}
	step() {
		if (this.paused) {
			return;
		}
		this.ySpeed += this.game.physics.g;

		if (this.game.keyboard.getKey('ArrowUp') === ButtonState.Pressed) {
			this.ySpeed = -6;
		}

		if (this.game.keyboard.isKeyDown('ArrowRight')) {
			this.position.x += 5;
		}

		if (this.game.keyboard.isKeyDown('ArrowLeft')) {
			this.position.x -= 5;
		}

		this.position.y += this.ySpeed;

		if (
			this.position.y > this.game.canvas.height ||
			this.position.y < 0 ||
			this.position.x < 0 ||
			this.position.x > this.game.canvas.width
		) {
			this.die();
		}

		for (const obj of this.game.objects) {
			if (obj instanceof Obstacle || obj instanceof Baddie) {
				if (
					this.getCollider().isCollidingWithRectangle(
						obj.getCollider(),
					)
				) {
					this.die();
				}
			} else if (obj instanceof Goal) {
				if (
					this.getCollider().isCollidingWithRectangle(
						obj.getCollider(),
					)
				) {
					this.togglePause();

					//spawn explosions in a circle
					for (let i = 0; i < 12; i++) {
						const angle = (i / 12) * Math.PI * 2;
						const x = this.position.x + Math.cos(angle) * 200;
						const y = this.position.y + Math.sin(angle) * 200;
						this.game.objects.add(
							new Explosion(this.game, x, y, -20, 100, 1),
						);
					}
				}
			}
		}
	}

	die() {
		console.log('Collision detected!');
		this.game.objects.add(
			new Explosion(
				this.game,
				this.position.x,
				this.position.y,
				10,
				50,
				2,
			),
		);
		this.destroy();
	}
	getCollider(): CircleCollider {
		return new CircleCollider(...this.position.xy, 20);
	}

	render(context: CanvasRenderingContext2D) {
		// context.fillStyle = 'yellow';
		// context.beginPath();
		// context.arc(...this.position.xy, 20, 0, Math.PI * 2);
		// context.fill();

		let spriteName = 'down';
		let flip = false;
		if (this.ySpeed < -1) {
			spriteName = 'up';
		}

		if (this.game.keyboard.isKeyDown('ArrowRight')) {
			spriteName = 'right';
		}
		if (this.game.keyboard.isKeyDown('ArrowLeft')) {
			spriteName = 'right';
			flip = true;
		}

		const sprite = Bird.sprites[spriteName as keyof typeof Bird.sprites];

		context.save();
		context.translate(this.position.x, this.position.y);
		if (flip) {
			context.scale(-1, 1);
		}
		context.drawImage(sprite, -30, -30, 60, 60);
		context.restore();
	}
}

export default Bird;
