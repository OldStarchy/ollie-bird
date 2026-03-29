import { createTimeline, Timeline } from 'animejs';
import contextCheckpoint from '../../contextCheckpoint';
import type GameObject from '../core/GameObject';
import Module from '../core/Module';
import type { CinematicFrame } from './cinematic/CinematicFrame';

export default class Cinematic extends Module {
	private timeline: Timeline;
	private frames: (CinematicFrame & { start: number })[];

	constructor(owner: GameObject, frames: CinematicFrame[]) {
		super(owner);
		this.frames = frames.map((frame) => ({ ...frame, start: 0 }));
		this.timeline = this.createTimeline();

		this.disposableStack.adopt(this.timeline, (tl) => tl.cancel());
	}

	toggle(): void {
		if (this.timeline.paused) {
			this.timeline.resume();
		} else {
			this.timeline.pause();
		}
	}

	jumpToFrame(frameIndex: number): void {
		const frame = this.frames[frameIndex];
		if (!frame) {
			throw new Error(`Frame index ${frameIndex} is out of bounds`);
		}
		// TODO: #75 Jumping back doesn't always work, the opacity isn't reset
		// correctly, but playing in reverse sometimes fixes it.
		this.timeline.seek(frame.start);
	}

	getCurrentFrameIndex(): number {
		const currentTime = this.timeline.currentTime;
		for (let i = this.frames.length - 1; i >= 0; i--) {
			if (currentTime >= this.frames[i]!.start) {
				return i;
			}
		}
		return 0;
	}

	jumpForward(): void {
		const currentIndex = this.getCurrentFrameIndex();
		if (currentIndex < this.frames.length - 1) {
			this.jumpToFrame(currentIndex + 1);
		} else {
			this.owner.destroy();
		}
	}

	jumpBack(): void {
		const currentIndex = Math.max(this.getCurrentFrameIndex() - 1, 0);
		this.jumpToFrame(currentIndex);
	}

	alternate(): void {
		this.timeline.alternate();
		this.timeline.resume();
	}

	private createTimeline(): Timeline {
		const fadeTime = 600;
		const holdTime = 5000;

		const timeline = createTimeline({
			defaults: {
				duration: holdTime,
				ease: 'inOut',
			},
		});

		// Each slide is added at t-fadeTime, so add a delay so that the first
		// one starts at t=0
		timeline.add({ duration: fadeTime });

		for (let i = 0; i < this.frames.length; i++) {
			const frame = this.frames[i]!;

			//Fade in, overlapping with the previous slide's hold time
			timeline.add(
				frame.state,
				{ opacity: 1, duration: fadeTime },
				`-=${fadeTime}`,
			);

			frame.start = timeline.duration;
			// Start the zoom/pan animation at the same time as the fade in
			timeline.add(frame.state, frame.destRect, '<<');

			// Turn the frame off at the end (the next frame should have faded in by then)
			if (i < this.frames.length - 1)
				timeline.add(frame.state, { opacity: 0, duration: 0 });
		}

		// Fade out the last frame
		timeline.add(this.frames.at(-1)!.state, {
			opacity: 0,
			duration: fadeTime,
		});

		timeline.call(() => {
			this.owner.destroy();
		}, '+=1');

		return timeline;
	}

	protected override render(context: CanvasRenderingContext2D): void {
		using _ = contextCheckpoint(context);

		context.beginPath();
		context.rect(0, 0, this.game.width, this.game.height);
		context.clip();

		let lastCaption: string | null = null;
		for (const {
			sprite,
			caption,
			state: { opacity, x, y, width, height },
		} of this.frames) {
			if (opacity === 0) continue;

			{
				using _ = contextCheckpoint(context);

				context.globalAlpha = opacity;
				context.scale(this.game.width, this.game.height);
				context.scale(1 / width, 1 / height);
				context.translate(-x, -y);

				sprite.blit(context, 0, 0, 1, 1);
			}

			if (opacity >= 1) lastCaption = caption;
		}
		if (lastCaption) this.renderCaption(context, lastCaption);
	}

	private renderCaption(
		context: CanvasRenderingContext2D,
		caption: string,
	): void {
		context.font = '48px sans-serif';
		context.textAlign = 'center';
		context.textBaseline = 'middle';

		const lines = caption.split('\n');
		const lineHeight = 50;
		const totalHeight = lineHeight * lines.length;
		const startY = this.game.height - totalHeight - 50;

		context.beginPath();
		context.rect(
			0,
			startY - 20 - lineHeight / 2,
			this.game.width,
			totalHeight + 40,
		);
		context.fillStyle = 'rgba(0, 0, 0, 0.5)';
		context.fill();

		context.fillStyle = 'white';
		lines.forEach((line, index) => {
			context.fillText(
				line,
				this.game.width / 2,
				startY + index * lineHeight,
			);
		});
	}
}
