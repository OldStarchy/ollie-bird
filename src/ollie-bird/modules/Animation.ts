import { Subject, type Observable } from 'rxjs';
import z from 'zod';
import Resources from '../Resources';
import type GameObject from '../core/GameObject';
import Module from '../core/Module';
import type Sprite from '../core/Sprite';
import Rect2 from '../core/math/Rect2';
import { Err, Ok, type Result } from '../core/monad/Result';

export type AnimationEvents = 'ended' | 'looped';

const animationDtoSchema = z.object({
	spriteSet: z.string().startsWith('spriteset:').optional(),
	rectangle: z.tuple([z.number(), z.number(), z.number(), z.number()]),
	frameDuration: z.number().optional(),
	loop: z.boolean().optional(),
	paused: z.boolean().optional(),
});

export type AnimationDto = z.input<typeof animationDtoSchema>;

interface SpriteSetResourceLocator {
	type: 'spriteset';
	name: string;
}

export default class Animation extends Module {
	static readonly displayName = 'Animation';

	#timeSinceFrameStart = 0;
	#currentFrame = 0;

	readonly rectangle = new Rect2(0, 0, 16, 16);

	accessor paused = false;

	get currentFrame(): number {
		return this.#currentFrame;
	}
	set currentFrame(value: number) {
		if (value < 0 || value >= this.images.length) {
			throw new Error(
				`Frame index out of bounds: ${value} (must be between 0 and ${
					this.images.length - 1
				})`,
			);
		}
		this.#currentFrame = value;
	}

	readonly #events$ = new Subject<AnimationEvents>();
	readonly events$: Observable<AnimationEvents> = this.#events$;

	#spriteSet: SpriteSetResourceLocator | null = null;
	get spriteSet(): SpriteSetResourceLocator | null {
		return this.#spriteSet;
	}
	set spriteSet(value: SpriteSetResourceLocator | null) {
		this.#spriteSet = value;
		if (value) {
			const sprites = Resources.instance.spriteSet.get(value.name);
			this.images = sprites.map((s) => s);
		} else {
			this.images = [];
		}
	}

	private images: Sprite[] = [];
	public frameDuration: number = 0.1;
	public loop: boolean = true;

	protected override update(): void {
		if (this.images.length === 0) return;
		if (this.paused) return;

		this.advanceFrameTime(this.owner.game.secondsPerFrame);
	}

	protected advanceFrameTime(deltaTime: number): void {
		this.#timeSinceFrameStart += deltaTime;

		if (this.#timeSinceFrameStart >= this.frameDuration) {
			const framesToAdvance = Math.floor(
				this.#timeSinceFrameStart / this.frameDuration,
			);
			this.#timeSinceFrameStart %= this.frameDuration;

			this.advanceFrames(framesToAdvance);
		}
	}

	protected advanceFrames(count: number): void {
		this.#currentFrame += count;

		if (this.#currentFrame >= this.images.length) {
			this.handleLoopOrEnd();
		}
	}

	protected handleLoopOrEnd(): void {
		if (this.loop) {
			this.#currentFrame = this.#currentFrame % this.images.length;
			this.#events$.next('looped');
		} else {
			this.#currentFrame = this.images.length - 1;
			this.paused = true;
			this.#events$.next('ended');
		}
	}

	protected override render(context: CanvasRenderingContext2D): void {
		if (this.images.length === 0) return;

		let frameIndex = this.#currentFrame;

		if (frameIndex >= this.images.length) {
			frameIndex = this.images.length - 1;
		} else if (frameIndex < 0) {
			frameIndex = 0;
		}

		const image = this.images[frameIndex]!;
		image.blit(
			context,
			this.owner.transform.position.x + this.rectangle.x,
			this.owner.transform.position.y + this.rectangle.y,
			this.rectangle.width,
			this.rectangle.height,
		);
	}

	serialize(): AnimationDto {
		return {
			spriteSet: this.#spriteSet
				? `spriteset:${this.#spriteSet.name}`
				: undefined,
			rectangle: this.rectangle.xywh,
			frameDuration: this.frameDuration,
			loop: this.loop,
			paused: this.paused,
		};
	}

	static deserialize(
		obj: unknown,
		context: { gameObject: GameObject },
	): Result<Module, string> {
		const parsed = animationDtoSchema.safeParse(obj);

		if (!parsed.success) {
			return Err(`Invalid data: ${parsed.error.message}`);
		}

		const { spriteSet, rectangle, frameDuration, loop, paused } =
			parsed.data;

		const anim = context.gameObject.addModule(Animation);
		if (spriteSet) {
			const [, name] = spriteSet.split(':') as [string, string];
			anim.spriteSet = { type: 'spriteset', name };
			// TODO(#59): await resource load
		}
		anim.rectangle.set(...rectangle);
		if (frameDuration !== undefined) anim.frameDuration = frameDuration;
		if (loop !== undefined) anim.loop = loop;
		if (paused !== undefined) anim.paused = paused;

		return Ok(anim);
	}

	static {
		Module.serializer.registerSerializationType('Animation', this);
	}
}
