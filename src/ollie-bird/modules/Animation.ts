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
		super(owner);
	}

	protected override update(): void {
		if (this.paused) return;

		this.time += this.owner.game.secondsPerFrame;
		const totalDuration = this.frameDuration * this.images.length;

		if (this.time > totalDuration) {
			if (this.loop) {
				this.events.emit('looped', void 0);
				this.time = this.time % totalDuration;
			} else {
				this.time = totalDuration;
				this.events.emit('ended', void 0);
				this.paused = true;
			}
		}
	}

	protected override render(context: CanvasRenderingContext2D): void {
		const frameIndex = Math.floor(this.time / this.frameDuration);

		if (frameIndex < this.images.length) {
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
}
