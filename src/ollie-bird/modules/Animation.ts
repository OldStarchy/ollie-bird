import EventSource from '../EventSource';
import type GameObject from '../GameObject';
import Module from '../IModular';
import Rect2 from '../math/Rect2';
import type Sprite from '../Sprite';

export interface AnimationEventsMap {
	ended: void;
	looped: void;
}
export default class Animation extends Module {
	private time = 0;
	public paused = false;
	readonly rectangle = new Rect2(0, 0, 16, 16);

	readonly events: EventSource<AnimationEventsMap> = new EventSource();

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

		this.time += this.owner.game.secondsPerFrame;
		const totalDuration = this.frameDuration * this.images.length;

		if (this.time > totalDuration || this.time < 0) {
			if (this.loop) {
				this.events.emit('looped', void 0);
				this.time = ((this.time % totalDuration) + totalDuration) % totalDuration;
			} else {
				if (this.frameDuration > 0) this.time = totalDuration;
				else this.time = 0;
				this.events.emit('ended', void 0);
				this.paused = true;
			}
		}
	}

	protected override render(context: CanvasRenderingContext2D): void {
		let frameIndex = Math.floor(this.time / this.frameDuration);

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
}
