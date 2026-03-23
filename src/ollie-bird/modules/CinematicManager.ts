import { Subject } from 'rxjs';
import contextCheckpoint from '../../contextCheckpoint';
import type { EventMap } from '../core/EventMap';
import Module from '../core/Module';
import BirdBehavior from './bird/BirdBehavior';

/** A normalized rectangle in image space, where all values are in the range [0, 1]. */
export interface NormalizedRect {
	/** Left edge, as a fraction of the image width. */
	x: number;
	/** Top edge, as a fraction of the image height. */
	y: number;
	/** Width, as a fraction of the image width. */
	w: number;
	/** Height, as a fraction of the image height. */
	h: number;
}

export interface KenBurnsConfig {
	/**
	 * Sub-rectangle of the image (in normalized image coordinates, 0–1) to
	 * show at the start of the frame.  The renderer lerps from this rect to
	 * `endRect` over the frame's duration, scaling the current sub-rect up so
	 * it covers the entire game view.
	 *
	 * Example – show the whole image:   `{ x: 0, y: 0, w: 1, h: 1 }`
	 * Example – zoom into the centre:   `{ x: 0.25, y: 0.25, w: 0.5, h: 0.5 }`
	 */
	startRect: NormalizedRect;
	/** Sub-rectangle of the image to show at the end of the frame. */
	endRect: NormalizedRect;
}

export interface CinematicFrame {
	/** URL or import string of the image to display. */
	imageSrc: string;
	/** Duration this frame is shown, in seconds. */
	duration: number;
	/** Ken Burns pan/zoom configuration. Defaults to a subtle zoom-in. */
	kenBurns?: KenBurnsConfig;
	/** Optional caption text displayed at the bottom of the frame. */
	caption?: string;
}

export type CinematicManagerEvents = EventMap<{
	start: void;
	end: void;
	frameChange: number;
}>;

const DEFAULT_KEN_BURNS: KenBurnsConfig = {
	// Subtle zoom-in: start on the full image, end on a slightly smaller centre crop
	startRect: { x: 0, y: 0, w: 1, h: 1 },
	endRect: { x: 0.025, y: 0.025, w: 0.95, h: 0.95 },
};

/**
 * Plays a sequence of images as a cinematic intro/cutscene.
 *
 * - Call `play(frames)` to start the cinematic.
 * - While active, all BirdBehavior modules are paused.
 * - The player can press **Space** to skip to the next frame or **Escape** to
 *   skip the entire cinematic.
 * - Attach this module to a game object with a high layer number so it renders
 *   on top of all other objects.
 */
export default class CinematicManager extends Module {
	static override readonly displayName = 'CinematicManager';

	readonly #event$ = new Subject<CinematicManagerEvents>();
	readonly event$ = this.#event$.asObservable();

	#frames: CinematicFrame[] = [];
	#currentFrameIndex = 0;
	#frameElapsed = 0;
	#active = false;
	#images = new Map<string, HTMLImageElement>();
	#imageErrors = new Set<string>();

	readonly #skipKey = this.game.input.keyboard.getButton('Space');
	readonly #skipAllKey = this.game.input.keyboard.getButton('Escape');

	/** Returns `true` while a cinematic sequence is playing. */
	get isActive(): boolean {
		return this.#active;
	}

	/**
	 * Starts playing the given sequence of cinematic frames.
	 * Pauses all active BirdBehavior modules until the cinematic ends.
	 */
	play(frames: CinematicFrame[]): void {
		if (frames.length === 0) return;

		this.#frames = frames;
		this.#currentFrameIndex = 0;
		this.#frameElapsed = 0;
		this.#active = true;

		for (const frame of frames) {
			if (!this.#images.has(frame.imageSrc)) {
				const img = new Image();
				img.onerror = () => {
					this.#imageErrors.add(frame.imageSrc);
					console.warn(
						`CinematicManager: failed to load image "${frame.imageSrc}"`,
					);
				};
				img.src = frame.imageSrc;
				this.#images.set(frame.imageSrc, img);
			}
		}

		this.game.findModulesByType(BirdBehavior).forEach((b) => b.pause());

		this.#event$.next({ type: 'start' });
	}

	/** Stops the cinematic immediately and resumes gameplay. */
	stop(): void {
		if (!this.#active) return;
		this.#active = false;

		this.game.findModulesByType(BirdBehavior).forEach((b) => b.resume());

		this.#event$.next({ type: 'end' });
	}

	protected override update(): void {
		if (!this.#active) return;

		if (this.#skipAllKey.isPressed) {
			this.stop();
			return;
		}

		const currentFrame = this.#frames[this.#currentFrameIndex];
		if (!currentFrame) {
			this.stop();
			return;
		}

		this.#frameElapsed += this.game.secondsPerFrame;
		// Clamp elapsed time to prevent floating-point accumulation
		this.#frameElapsed = Math.min(
			this.#frameElapsed,
			currentFrame.duration,
		);

		const shouldAdvance =
			this.#frameElapsed >= currentFrame.duration ||
			this.#skipKey.isPressed;

		if (shouldAdvance) {
			this.#currentFrameIndex++;
			this.#frameElapsed = 0;

			if (this.#currentFrameIndex >= this.#frames.length) {
				this.stop();
				return;
			}

			this.#event$.next({
				type: 'frameChange',
				data: this.#currentFrameIndex,
			});
		}

		super.update();
	}

	protected override render(context: CanvasRenderingContext2D): void {
		if (!this.#active) return;

		const frame = this.#frames[this.#currentFrameIndex];
		if (!frame) return;

		using _ = contextCheckpoint(context);

		const gw = this.game.width;
		const gh = this.game.height;

		context.fillStyle = 'black';
		context.fillRect(0, 0, gw, gh);

		const img = this.#images.get(frame.imageSrc);
		if (
			img &&
			img.complete &&
			img.naturalWidth > 0 &&
			!this.#imageErrors.has(frame.imageSrc)
		) {
			this.#renderImageWithKenBurns(context, img, frame, gw, gh);
		}

		if (frame.caption) {
			this.#renderCaption(context, frame.caption, gw, gh);
		}

		this.#renderSkipHint(context, gw, gh);

		super.render(context);
	}

	#renderImageWithKenBurns(
		context: CanvasRenderingContext2D,
		img: HTMLImageElement,
		frame: CinematicFrame,
		gw: number,
		gh: number,
	): void {
		const t = Math.min(
			this.#frameElapsed / Math.max(frame.duration, 0.001),
			1,
		);
		const kb = frame.kenBurns ?? DEFAULT_KEN_BURNS;

		// Lerp between the two normalized rects
		const rx = kb.startRect.x + (kb.endRect.x - kb.startRect.x) * t;
		const ry = kb.startRect.y + (kb.endRect.y - kb.startRect.y) * t;
		const rw = kb.startRect.w + (kb.endRect.w - kb.startRect.w) * t;
		const rh = kb.startRect.h + (kb.endRect.h - kb.startRect.h) * t;

		// Convert normalized rect to pixel source coordinates
		const iw = img.naturalWidth;
		const ih = img.naturalHeight;
		const srcX = rx * iw;
		const srcY = ry * ih;
		const srcW = rw * iw;
		const srcH = rh * ih;

		// Scale the source rect to cover the game view (object-fit: cover)
		const srcAspect = srcW / srcH;
		const viewAspect = gw / gh;
		let dstW: number;
		let dstH: number;
		if (srcAspect > viewAspect) {
			// Source rect is wider than the view: fill by height, center horizontally
			dstH = gh;
			dstW = gh * srcAspect;
		} else {
			// Source rect is taller than the view: fill by width, center vertically
			dstW = gw;
			dstH = gw / srcAspect;
		}

		const dstX = (gw - dstW) / 2;
		const dstY = (gh - dstH) / 2;

		context.save();
		context.beginPath();
		context.rect(0, 0, gw, gh);
		context.clip();
		context.drawImage(img, srcX, srcY, srcW, srcH, dstX, dstY, dstW, dstH);
		context.restore();
	}

	#renderCaption(
		context: CanvasRenderingContext2D,
		caption: string,
		gw: number,
		gh: number,
	): void {
		const fontSize = Math.round(gh * 0.04);
		context.font = `${fontSize}px sans-serif`;
		context.textAlign = 'center';
		context.textBaseline = 'bottom';

		const metrics = context.measureText(caption);
		const padding = fontSize * 0.5;
		const textX = gw / 2;
		const textY = gh * 0.9;
		const boxWidth = metrics.width + padding * 2;
		const boxHeight = fontSize + padding * 2;

		context.fillStyle = 'rgba(0, 0, 0, 0.6)';
		context.fillRect(
			textX - boxWidth / 2,
			textY - boxHeight,
			boxWidth,
			boxHeight,
		);

		context.fillStyle = 'white';
		context.fillText(caption, textX, textY - padding);
	}

	#renderSkipHint(
		context: CanvasRenderingContext2D,
		gw: number,
		gh: number,
	): void {
		const fontSize = Math.round(gh * 0.025);
		context.font = `${fontSize}px sans-serif`;
		context.textAlign = 'right';
		context.textBaseline = 'bottom';
		context.fillStyle = 'rgba(255, 255, 255, 0.5)';
		context.fillText(
			'SPACE - next  |  ESC - skip all',
			gw * 0.97,
			gh * 0.97,
		);
	}
}
