import { Subject, type Observable } from 'rxjs';
import type GameObject from '../core/GameObject';
import Module from '../core/Module';
import type Sprite from '../core/Sprite';
import Rect2 from '../core/math/Rect2';

export type AnimationEvents = 'ended' | 'looped';

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

	constructor(
		owner: GameObject,
		public images: Sprite[],
		public frameDuration: number,
		public loop: boolean = true,
	) {
		if (images.length <= 1) {
			throw new Error('Animation must have at least two frames.');
		}
		super(owner);
	}

	protected override update(): void {
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

	static {
		Module.serializer.registerSerializationType('Animation', this);
	}
}
