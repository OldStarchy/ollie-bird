import birdDown from '../../assets/bird-down.png';
import birdRight from '../../assets/bird-right.png';
import birdUp from '../../assets/bird-up.png';
import contextCheckpoint from '../../contextCheckpoint';
import onChange from '../../react-interop/onChange';
import type { BirdControls } from '../BirdControls';
import { Layer, TAG_DEADLY, TAG_LEVEL_OBJECT } from '../const';
import GameObject from '../core/GameObject';
import type IGame from '../core/IGame';
import Vec2 from '../core/math/Vec2';
import Collider2d from '../core/modules/Collider2d';
import CircleCollider2d from '../core/modules/colliders/CircleCollider2d';
import Sprite from '../core/Sprite';
import Explosion from './Explosion';
import Goal from './Goal';
import SequentialGate from './SequentialGate';
declare global {
	interface GameEventMap {
		gameOver: void;
	}
}
class Bird extends GameObject {
	static readonly defaultName: string = 'Bird';
	layer = Layer.Player;
	public ySpeed: number = 0;
	private holdTime = 0;
	private gravity: number;
	private flappedOnce = false;

	private get position(): Vec2 {
		return this.transform.position;
	}

	static sprites = {
		right: new Sprite(birdRight),
		up: new Sprite(birdUp),
		down: new Sprite(birdDown),
	};

	constructor(game: IGame) {
		super(game);
		this.tags.add(TAG_LEVEL_OBJECT);
		this.gravity = game.physics.gravity;

		const collider = this.addModule(CircleCollider2d);
		collider.radius = 20;
	}

	private paused: boolean = false;

	@onChange(
		(self) =>
			(self.controls = self.game.input.getSchema<BirdControls>(
				`Player ${self.playerIndex + 1}`,
			)),
	)
	accessor playerIndex = 0;

	controls: BirdControls = this.game.input.getSchema<BirdControls>(
		`Player ${this.playerIndex + 1}`,
	);

	get #keyFlap() {
		return this.controls.Flap;
	}
	get #keyLeft() {
		return this.controls.Left;
	}
	get #keyRight() {
		return this.controls.Right;
	}

	get #vibrationActuator() {
		return this.controls.Vibrate;
	}

	togglePause() {
		this.paused = !this.paused;
	}

	protected handleInput() {
		// Key Downs
		if (this.#keyFlap.isDown) {
			this.holdTime += this.game.secondsPerFrame;
			if (this.holdTime > 0.3 && !this.flappedOnce) {
				this.ySpeed = -6;
				this.holdTime %= 0.3;
				this.flappedOnce = true;
			}

			if (this.ySpeed > this.game.physics.gravity) {
				this.ySpeed /= 2;
				this.ySpeed = Math.max(this.ySpeed, this.game.physics.gravity);
			}

			this.gravity = this.game.physics.gravity * (this.holdTime / 0.3);
		}

		if (this.#keyRight.isDown) {
			this.position.x += 5;
		}

		if (this.#keyLeft.isDown) {
			this.position.x -= 5;
		}

		// Key Releaseds
		if (this.#keyFlap.isReleased) {
			if (!this.flappedOnce) {
				this.ySpeed = (-this.holdTime / 0.3) * 6;
			}
			this.holdTime = 0;
			this.gravity = this.game.physics.gravity;
			this.flappedOnce = false;
		}

		this.ySpeed += this.gravity;
		this.position.y += this.ySpeed;
	}

	protected checkObjCollisions() {
		const myCollider = this.getModule(CircleCollider2d);
		if (!myCollider) return;

		if (
			this.game
				.findObjectsByTag(TAG_DEADLY)
				.some(Collider2d.collidingWith(myCollider.getCollider()))
		) {
			this.die();
		}

		const passedAllGates = !this.game
			.findObjectsByType(SequentialGate)
			.some((gate) => gate.state !== 'passed');
		if (
			passedAllGates &&
			this.game
				.findObjectsByType(Goal)
				.some(Collider2d.collidingWith(myCollider.getCollider()))
		) {
			this.game.event.emit('gameOver', void 0);
			this.togglePause();

			//spawn explosions in a circle
			for (let i = 0; i < 12; i++) {
				const angle = (i / 12) * Math.PI * 2;
				const x = this.position.x + Math.cos(angle) * 200;
				const y = this.position.y + Math.sin(angle) * 200;

				this.createExplosion(x, y, -20, 100, 1);
			}
			return;
		}
	}

	protected checkOutOfBounds() {
		if (
			this.position.y > this.game.height ||
			this.position.y < 0 ||
			this.position.x < 0 ||
			this.position.x > this.game.width
		) {
			this.die();
		}
	}

	protected override update() {
		if (this.paused) {
			return;
		}

		this.handleInput();
		this.checkOutOfBounds();
		this.checkObjCollisions();
	}

	private createExplosion(
		x: number,
		y: number,
		radius: number,
		maxRadius: number,
		expansionRate: number,
	) {
		const explosion = this.game.spawn(Explosion);
		explosion.transform.position.set(x, y);
		explosion.radius = radius;
		explosion.maxRadius = maxRadius;
		explosion.expansionRate = expansionRate;
	}

	die() {
		this.game.event.emit('gameOver', void 0);
		this.#vibrationActuator?.playEffect('dual-rumble', {
			duration: 600,
			startDelay: 0,
			strongMagnitude: 1.0,
			weakMagnitude: 1.0,
		});

		this.createExplosion(...this.position.xy, 10, 50, 2);
		this.destroy();
	}

	protected override render(context: CanvasRenderingContext2D) {
		// context.fillStyle = 'yellow';
		// context.beginPath();
		// context.arc(...this.position.xy, 20, 0, Math.PI * 2);
		// context.fill();

		let spriteName = 'down';
		let flip = false;
		if (this.ySpeed < -1) {
			spriteName = 'up';
		}

		if (this.#keyRight.isDown) {
			spriteName = 'right';
		}
		if (this.#keyLeft.isDown) {
			spriteName = 'right';
			flip = true;
		}

		const sprite = Bird.sprites[spriteName as keyof typeof Bird.sprites];

		using _ = contextCheckpoint(context);
		context.translate(...this.position.xy);
		if (flip) {
			context.scale(-1, 1);
		}
		sprite.blit(context, -30, -30, 60, 60);
	}
}

export default Bird;
