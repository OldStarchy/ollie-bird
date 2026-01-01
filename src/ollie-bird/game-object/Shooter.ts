import z from 'zod';
import ContextSave from '../../ContextSave';
import RayCollider from '../collider/RayCollider';
import {
	CELL_SIZE,
	Layer,
	TAG_DEADLY,
	TAG_LEVEL_OBJECT,
	TAG_LEVEL_STRUCTURE,
} from '../const';
import GameObject from '../core/GameObject';
import type IGame from '../core/IGame';
import type { ISerializable } from '../LevelStore';
import LevelStore from '../LevelStore';
import Modulo from '../math/Modulo';
import CircleCollider2d from '../modules/CircleCollider2d';
import Collider2d from '../modules/Collider2d';
import Resources from '../Resources';
import Bird from './Bird';
import Explosion from './Explosion';

export const shooterDtoSchema = z.object({
	$type: z.string(),
	x: z.number(),
	y: z.number(),
});

export type ShooterDto = z.infer<typeof shooterDtoSchema>;

export default class Shooter extends GameObject implements ISerializable {
	layer = Layer.Foreground;

	static readonly body = Resources.shooterBody;
	static readonly turret = Resources.shooterGun;
	static readonly pellet = Resources.shooterPellet;

	static {
		LevelStore.register(Shooter.name, Shooter);
	}

	reloadDelay: number = 1.0;
	timeSinceLastShot: number = Infinity;

	aimAngle: number = -90;
	aimSpeed: number = 90;

	protected override initialize(): void {
		super.initialize();
		this.tags.add(TAG_LEVEL_STRUCTURE);
	}

	private target: GameObject | null = null;

	protected override update(): void {
		super.update();
		this.timeSinceLastShot += this.game.secondsPerFrame;

		const bird = this.findBird();

		if (bird === null || bird.paused) {
			this.target = null;
			this.returnToCenter();
			return;
		}

		this.target = bird;
		this.shootAtBird(bird);
	}

	private findBird(): Bird | null {
		const bird =
			this.game.findObjectsByType(Bird).filter((bird) => {
				const delta = bird.transform.position.subtract(
					this.transform.position,
				);
				const ray = new RayCollider(
					this.transform.position,
					delta.normalize(),
					delta.hypot(),
				);

				const obstacleHit = this.game
					.findObjectsByTag(TAG_LEVEL_STRUCTURE)
					.some(Collider2d.collidingWith(ray));

				return !obstacleHit;
			})[0] ?? null;

		return bird;
	}

	private shootAtBird(bird: Bird): void {
		const delta = bird.transform.position.subtract(this.transform.position);

		const directionToBird = Math.atan2(delta.y, delta.x) * (180 / Math.PI);

		this.aimAtDirection(directionToBird);
		this.shootAtDirection(directionToBird);
	}

	private shootAtDirection(direction: number): void {
		const angleDelta = Modulo.difference(direction, this.aimAngle, 360);

		if (Math.abs(angleDelta) < 10) {
			this.tryShoot();
		}
	}

	private tryShoot() {
		if (this.timeSinceLastShot >= this.reloadDelay) {
			this.shoot();
			this.timeSinceLastShot = 0;
		}
	}

	private shoot(): void {
		const pellet = this.game.spawn(Pellet);

		pellet.transform.position.set(
			this.transform.position.x,
			this.transform.position.y,
		);
		const speed = 300;

		const radians = this.aimAngle * (Math.PI / 180);
		pellet.velocity.x = Math.cos(radians) * speed;
		pellet.velocity.y = Math.sin(radians) * speed;
	}

	private returnToCenter(): void {
		this.aimAtDirection(-90);
	}

	private aimAtDirection(direction: number): void {
		const angleDelta = Modulo.difference(direction, this.aimAngle, 360);

		const maxAngleChange = this.aimSpeed * this.game.secondsPerFrame;

		if (Math.abs(angleDelta) <= maxAngleChange) {
			this.aimAngle = direction;
		} else {
			this.aimAngle += angleDelta > 0 ? maxAngleChange : -maxAngleChange;
		}

		this.aimAngle = Modulo.normalize(this.aimAngle, 360);
	}

	protected override render(context: CanvasRenderingContext2D): void {
		using _ = new ContextSave(context);
		{
			using _ = this.transform.push(context);
			{
				using _ = new ContextSave(context);
				context.rotate(Math.PI / 2);

				context.rotate(this.aimAngle * (Math.PI / 180));
				Shooter.turret.blit(
					context,
					-CELL_SIZE / 2,
					-CELL_SIZE / 2,
					CELL_SIZE,
					CELL_SIZE / 2,
				);
			}

			Shooter.body.blit(
				context,
				-CELL_SIZE / 2,
				-CELL_SIZE / 2,
				CELL_SIZE,
				CELL_SIZE,
			);

			// const x = 100 * Math.cos((this.aimAngle * Math.PI) / 180);
			// const y = 100 * Math.sin((this.aimAngle * Math.PI) / 180);

			// context.strokeStyle = 'red';
			// context.beginPath();
			// context.moveTo(0, 0);
			// context.lineTo(x, y);
			// context.stroke();
		}

		if (this.target) {
			context.setLineDash([10, 40]);
			context.lineDashOffset = this.timeSinceLastShot * 40;
			context.strokeStyle = 'black';
			context.lineWidth = 1;
			context.beginPath();
			context.moveTo(
				this.transform.position.x,
				this.transform.position.y,
			);
			context.lineTo(
				this.target.transform.position.x,
				this.target.transform.position.y,
			);
			context.stroke();
		}
	}

	serialize(): ShooterDto {
		return {
			$type: this.constructor.name,
			x: this.transform.position.x,
			y: this.transform.position.y,
		};
	}

	static spawnDeserialize(game: IGame, data: unknown): Shooter | null {
		const parseResult = shooterDtoSchema.safeParse(data);
		if (!parseResult.success) {
			console.error('Failed to parse Shooter data:', parseResult.error);
			return null;
		}

		const { x, y } = parseResult.data;
		const bomb = game.spawn(Shooter);
		bomb.transform.position.set(x, y);
		return bomb;
	}
}

class Pellet extends GameObject {
	layer = Layer.Foreground;

	velocity = { x: 0, y: 0 };

	protected override initialize(): void {
		super.initialize();
		this.tags.add(TAG_DEADLY);
		this.tags.add(TAG_LEVEL_OBJECT);
		this.addModule(CircleCollider2d).radius = CELL_SIZE / 8;
	}

	protected override update(): void {
		super.update();

		this.transform.position.iadd({
			x: this.velocity.x * this.game.secondsPerFrame,
			y: this.velocity.y * this.game.secondsPerFrame,
		});

		this.checkOutOfBounds();
		this.checkObjCollisions();
	}

	protected checkObjCollisions() {
		const myCollider = this.getModule(CircleCollider2d);
		if (!myCollider) return;

		if (
			this.game
				.findObjectsByTag(TAG_DEADLY)
				.filter((obj) => obj !== this)
				.some(Collider2d.collidingWith(myCollider.getCollider()))
		) {
			this.die();
		}
	}

	protected checkOutOfBounds() {
		if (
			this.transform.position.y > this.game.height ||
			this.transform.position.y < 0 ||
			this.transform.position.x < 0 ||
			this.transform.position.x > this.game.width
		) {
			this.die();
		}
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
		this.createExplosion(...this.transform.position.xy, 10, 50, 2);
		this.destroy();
	}

	protected override render(context: CanvasRenderingContext2D): void {
		using _ = this.transform.push(context);
		{
			Shooter.pellet.blit(
				context,
				-CELL_SIZE,
				-CELL_SIZE,
				CELL_SIZE * 2,
				CELL_SIZE * 2,
			);
		}
	}
}
