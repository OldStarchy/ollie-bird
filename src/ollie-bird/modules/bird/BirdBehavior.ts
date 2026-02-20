import { toss } from 'toss-expression';
import z from 'zod';
import contextCheckpoint from '../../../contextCheckpoint';
import onChange from '../../../react-interop/onChange';
import type { BirdControls } from '../../BirdControls';
import { TAG_CHECKPOINT, TAG_DEADLY, TAG_GOAL } from '../../const';
import GameObject from '../../core/GameObject';
import Vec2 from '../../core/math/Vec2';
import Module from '../../core/Module';
import Collider2d from '../../core/modules/Collider2d';
import CircleCollider2d from '../../core/modules/colliders/CircleCollider2d';
import { Option } from '../../core/monad/Option';
import '../../core/monad/OptionResultInterop';
import { Err, Ok, type Result } from '../../core/monad/Result';
import createExplosionPrefab from '../../prefabs/createExplosionPrefab';
import Resources, { BirdSpriteSet } from '../../Resources';
import Checkpoint from '../Checkpoint';
import ExplosionBehavior from '../ExplosionBehavior';
import LevelGameplayManager from '../LevelGameplayManager';

const birdBehaviorDtoSchema = z.object({
	playerIndex: z.union([z.literal(0), z.literal(1)]),
});
export type BirdBehaviorDto = z.input<typeof birdBehaviorDtoSchema>;

export default class BirdBehavior extends Module {
	static readonly displayName: string = 'Bird';

	static readonly raiseToSpreadTime = 0.15;

	static readonly spritesRight: BirdSpriteSet =
		Resources.instance.birdSpriteSet.get('birdRightSprites');
	static readonly spritesFront: BirdSpriteSet =
		Resources.instance.birdSpriteSet.get('birdFrontSprites');

	public ySpeed: number = 0;
	private flapHoldTime = 0;
	private gravity: number;
	private flappedOnce = false;
	private flapFrameHold: number = 0;
	private levelGameplayManager: LevelGameplayManager;
	private sprites: BirdSpriteSet;
	private paused: boolean = false;
	@onChange(
		(self) =>
			(self.controls = self.game.input.getSchema<BirdControls>(
				`Player ${self.playerIndex + 1}`,
			)),
	)
	accessor playerIndex: 0 | 1 = 0;

	private get position(): Vec2 {
		return this.owner.transform.position;
	}

	constructor(owner: GameObject) {
		super(owner);
		this.sprites = BirdBehavior.spritesFront;

		this.gravity = this.owner.game.physics.gravity;

		this.levelGameplayManager =
			this.owner.game
				.getObjects()
				.map((obj) => obj.getModule(LevelGameplayManager))
				.filter((m) => m !== null)[0] ??
			toss(
				new Error(
					`${BirdBehavior.displayName} requires a ${LevelGameplayManager.displayName} in the scene`,
				),
			);
	}

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
			this.flapHoldTime += this.game.secondsPerFrame;
			if (this.flapHoldTime > 0.3 && !this.flappedOnce) {
				this.ySpeed = -6;
				this.flapHoldTime %= 0.3;
				this.flappedOnce = true;
				this.flapFrameHold = 0.3;
			}

			if (this.ySpeed > this.game.physics.gravity) {
				this.ySpeed /= 2;
				this.ySpeed = Math.max(this.ySpeed, this.game.physics.gravity);
			}

			this.gravity =
				this.game.physics.gravity * (this.flapHoldTime / 0.3);
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
				this.ySpeed = (-this.flapHoldTime / 0.3) * 6;
				this.flapFrameHold = 0.3;
			}
			this.flapHoldTime = 0;
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
			.findObjectsByTag(TAG_CHECKPOINT)
			.map((obj) => obj.getModule(Checkpoint)!)
			.some((gate) => gate.state !== 'passed');
		if (
			passedAllGates &&
			this.game
				.findObjectsByTag(TAG_GOAL)
				.some(Collider2d.collidingWith(myCollider.getCollider()))
		) {
			this.levelGameplayManager.handleBirdReachedGoal(this.owner);
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

	override update() {
		if (this.paused) {
			return;
		}

		this.handleInput();
		this.checkOutOfBounds();
		this.checkObjCollisions();

		if (this.flapFrameHold > 0) {
			this.flapFrameHold -= this.game.secondsPerFrame;
		} else {
			this.flapFrameHold = 0;
		}

		super.update();
	}

	private createExplosion(
		x: number,
		y: number,
		radius: number,
		maxRadius: number,
		expansionRate: number,
	) {
		GameObject.deserializePartial(createExplosionPrefab({ x, y }), {
			game: this.game,
		})
			.logErr('Failed to create explosion')
			.ok()
			.andThen((obj) => Option.of(obj.getModule(ExplosionBehavior)))
			.inspect((obj) => {
				obj.radius = radius;
				obj.maxRadius = maxRadius;
				obj.expansionRate = expansionRate;
			});
	}

	die() {
		this.levelGameplayManager.handleBirdDied(this.owner);
		this.#vibrationActuator?.playEffect('dual-rumble', {
			duration: 600,
			startDelay: 0,
			strongMagnitude: 1.0,
			weakMagnitude: 1.0,
		});

		this.createExplosion(...this.position.xy, 10, 50, 2);
		this.owner.destroy();
	}

	override render(context: CanvasRenderingContext2D) {
		// context.fillStyle = 'yellow';
		// context.beginPath();
		// context.arc(...this.position.xy, 20, 0, Math.PI * 2);
		// context.fill();

		let spriteName: keyof BirdSpriteSet = 'idle';
		let flip = false;

		if (this.#keyRight.isDown) {
			this.sprites = BirdBehavior.spritesRight;
		} else if (this.#keyLeft.isDown) {
			this.sprites = BirdBehavior.spritesRight;
			flip = true;
		} else {
			this.sprites = BirdBehavior.spritesFront;
		}

		if (this.flapFrameHold > 0) {
			spriteName = 'flap';
		} else if (this.#keyFlap.isDown) {
			spriteName = 'raise';
			if (this.flapHoldTime > BirdBehavior.raiseToSpreadTime) {
				spriteName = 'spread';
			}
		} else if (this.ySpeed > 0) {
			spriteName = 'dive';
		} else {
			spriteName = 'spread';
		}

		const sprite = this.sprites[spriteName as keyof typeof this.sprites];

		using _ = contextCheckpoint(context);
		context.translate(...this.position.xy);
		if (flip) {
			context.scale(-1, 1);
		}
		sprite.blit(context, -30, -30, 60, 60);

		super.render(context);
	}

	serialize(): BirdBehaviorDto {
		return {
			playerIndex: this.playerIndex,
		};
	}

	static deserialize(
		_obj: unknown,
		context: { gameObject: GameObject },
	): Result<Module, string> {
		const parseResult = birdBehaviorDtoSchema.safeParse(_obj);

		if (!parseResult.success) {
			return Err(
				`Failed to deserialize BirdBehavior: ${parseResult.error.message}`,
			);
		}

		const module = context.gameObject.addModule(this);

		module.playerIndex = parseResult.data.playerIndex;

		return Ok(module);
	}

	static {
		Module.serializer.registerSerializationType('BirdBehavior', this);
	}
}
