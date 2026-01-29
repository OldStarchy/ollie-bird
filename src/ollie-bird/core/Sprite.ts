import { Subject } from 'rxjs';
import z from 'zod';
import { ReactInterop } from '../../react-interop/ReactInterop';
import Rect2, { rect2Schema, type Rect2Like } from '../math/Rect2';
import Vec2, { vec2Schema } from '../math/Vec2';

export const spriteViewSchema = z.object({
	src: z.string().meta({ title: 'Image Source' }),
	sourceRect: rect2Schema.meta({ title: 'Source Rectangle' }),
	origin: vec2Schema.meta({ title: 'Origin' }),
});

export type SpriteView = z.infer<typeof spriteViewSchema>;

declare global {
	interface ObjectConstructor {
		hasOwn<K extends PropertyKey>(
			value: object,
			key: K,
		): value is { [P in K]: unknown };
	}
}

export default class Sprite implements ReactInterop<SpriteView> {
	readonly #change$ = new Subject<void>();

	readonly sourceRect = new Rect2(0, 0, 16, 16);
	readonly origin = new Vec2(0, 0);
	readonly image: HTMLImageElement;

	get src(): string {
		return this.image.src.split('/').pop() || '';
	}

	[ReactInterop.get](): SpriteView {
		return {
			src: this.src,
			sourceRect: this.sourceRect[ReactInterop.get](),
			origin: this.origin[ReactInterop.get](),
		};
	}
	[ReactInterop.set](value: SpriteView): void {
		if (Object.hasOwn(value, 'sourceRect')) {
			this.sourceRect[ReactInterop.set](value.sourceRect!);
		}
		if (Object.hasOwn(value, 'origin')) {
			this.origin[ReactInterop.set](value.origin!);
		}
		if (Object.hasOwn(value, 'src')) {
			this.image.src = value.src!;
		}
		this.notify();
	}

	readonly [ReactInterop.schema] = spriteViewSchema;
	readonly [ReactInterop.asObservable] = this.#change$.asObservable();

	notify() {
		this.#change$.next();
	}

	constructor(image: HTMLImageElement, sourceRect?: Rect2Like);
	constructor(src: string, sourceRect?: Rect2Like);

	constructor(imageOrSrc: HTMLImageElement | string, sourceRect?: Rect2Like) {
		this.image = Sprite.toImage(imageOrSrc);

		if (sourceRect) {
			this.sourceRect.copy(sourceRect);
		} else {
			this.image.addEventListener(
				'load',
				() => {
					this.sourceRect.set(
						0,
						0,
						this.image.naturalWidth,
						this.image.naturalHeight,
					);
				},
				{ once: true },
			);
		}

		this.origin[ReactInterop.asObservable].subscribe(this.#change$);
		this.sourceRect[ReactInterop.asObservable].subscribe(this.#change$);
	}

	private static toImage(
		imageOrSrc: HTMLImageElement | string,
	): HTMLImageElement {
		if (typeof imageOrSrc === 'string') {
			const img = new Image();
			img.src = imageOrSrc;
			return img;
		} else {
			return imageOrSrc;
		}
	}

	static fromSheet(
		imageOrSrc: HTMLImageElement | string,
		cells: Rect2Like[],
	): Sprite[] {
		const image = Sprite.toImage(imageOrSrc);
		return cells.map((cell) => new Sprite(image, cell));
	}

	static fromGrid(
		imageOrSrc: HTMLImageElement | string,
		tilesX: number,
		tilesY: number,
		imageWidth: number,
		imageHeight: number,
	): Sprite[] {
		const image = Sprite.toImage(imageOrSrc);
		const sprites: Sprite[] = [];
		const width = imageWidth / tilesX;
		const height = imageHeight / tilesY;

		for (let y = 0; y < tilesY; y++) {
			for (let x = 0; x < tilesX; x++) {
				sprites.push(
					new Sprite(image, {
						x: x * width,
						y: y * height,
						width: width,
						height: height,
					}),
				);
			}
		}
		return sprites;
	}

	blit(
		context: CanvasRenderingContext2D,
		x: number,
		y: number,
		width: number,
		height: number,
	): void {
		context.drawImage(
			this.image,
			this.sourceRect.x,
			this.sourceRect.y,
			this.sourceRect.width,
			this.sourceRect.height,
			x,
			y,
			width,
			height,
		);
	}
}
