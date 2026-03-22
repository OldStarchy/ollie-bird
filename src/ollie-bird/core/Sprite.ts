import { Subject } from 'rxjs';
import z from 'zod';
import { ReactInterop } from '../../react-interop/ReactInterop';
import Rect2, { rect2Schema, type Rect2Like } from './math/Rect2';
import Vec2, { vec2Schema } from './math/Vec2';

export const spriteViewSchema = z.object({
	sourceRect: rect2Schema.meta({ title: 'Source Rectangle' }),
	origin: vec2Schema.meta({ title: 'Origin' }),
});

export type SpriteView = z.infer<typeof spriteViewSchema>;

export type SpriteImageSource = HTMLImageElement | HTMLCanvasElement;

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
	#ready = false;

	readonly sourceRect = new Rect2(0, 0, 16, 16);
	readonly origin = new Vec2(0, 0);
	#image: SpriteImageSource;
	get image(): SpriteImageSource {
		return this.#image;
	}
	get ready(): boolean {
		return this.#ready;
	}

	[ReactInterop.get](): SpriteView {
		return {
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
		this.notify();
	}

	readonly [ReactInterop.schema] = spriteViewSchema;
	readonly [ReactInterop.asObservable] = this.#change$.asObservable();

	notify() {
		this.#change$.next();
	}

	constructor(image: SpriteImageSource, sourceRect?: Rect2Like);
	constructor(src: string, sourceRect?: Rect2Like);

	constructor(
		imageOrSrc: SpriteImageSource | string,
		sourceRect?: Rect2Like,
	) {
		this.#image = Sprite.toImage(imageOrSrc);

		if (sourceRect) {
			this.sourceRect.copy(sourceRect);
		} else {
			if (this.#image instanceof HTMLImageElement) {
				const img = this.#image;
				img.addEventListener(
					'load',
					() => {
						this.sourceRect.set(
							0,
							0,
							img.naturalWidth,
							img.naturalHeight,
						);
						this.#ready = true;
					},
					{ once: true },
				);
			} else if (this.#image instanceof HTMLCanvasElement) {
				this.sourceRect.set(
					0,
					0,
					this.#image.width,
					this.#image.height,
				);
			}
		}
		if (this.#image instanceof HTMLImageElement) {
			// const src = this.#image.src;
			this.#image.addEventListener(
				'load',
				() => {
					// console.log(src);
					this.#image = flattenImageColors(this.#image);
					this.#ready = true;
				},
				{ once: true },
			);
		} else {
			this.#ready = true;
			this.#image = flattenImageColors(this.#image);
		}

		this.origin[ReactInterop.asObservable].subscribe(this.#change$);
		this.sourceRect[ReactInterop.asObservable].subscribe(this.#change$);
	}

	private static toImage(
		imageOrSrc: SpriteImageSource | string,
	): SpriteImageSource {
		if (typeof imageOrSrc === 'string') {
			const img = new Image();
			img.src = imageOrSrc;
			return img;
		} else {
			return imageOrSrc;
		}
	}

	static fromSheet(
		imageOrSrc: SpriteImageSource | string,
		cells: Rect2Like[],
	): Sprite[] {
		const image = Sprite.toImage(imageOrSrc);
		return cells.map((cell) => new Sprite(image, cell));
	}

	static fromGrid<X extends number, Y extends number>(
		imageOrSrc: SpriteImageSource | string,
		tilesX: X,
		tilesY: Y,
		imageWidth: number,
		imageHeight: number,
	): FlattenTuple<Tuple<Tuple<Sprite, Y>, X>> {
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
		return sprites as FlattenTuple<Tuple<Tuple<Sprite, Y>, X>>;
	}

	blit(
		context: CanvasRenderingContext2D,
		x: number,
		y: number,
		width: number,
		height: number,
	): void {
		context.drawImage(
			this.#image,
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

const kernel = createSquareKernelIndicies(1);

// TODO: #67 Do this properly or remove flattenImageColors.
const hackyCache = new Map<SpriteImageSource, HTMLCanvasElement>();
/**
 * Processes an image and makes pixels above a certain brightness threshold transparent.
 * @param image - The source image (SpriteImageSource) to process.
 * @param threshold - Brightness threshold (0-255). Defaults to 10.
 * @returns An HTMLCanvasElement that can be used as a source for drawImage().
 */
export function flattenImageColors(
	source: SpriteImageSource,
	threshold: number = 10,
): HTMLCanvasElement {
	if (hackyCache.has(source)) {
		return hackyCache.get(source)!;
	}
	// 1. Create off-screen canvas and typed context
	const canvas: HTMLCanvasElement = document.createElement('canvas');
	const ctx = canvas.getContext('2d', { willReadFrequently: true });

	if (!ctx) {
		throw new Error('Could not get 2D context');
	}

	// 2. Use natural dimensions to ensure full resolution
	// SpriteImageSource elements have different ways to get dimensions
	canvas.width =
		source instanceof HTMLImageElement ? source.naturalWidth : source.width;
	canvas.height =
		source instanceof HTMLImageElement
			? source.naturalHeight
			: source.height;

	// 3. Draw image and extract pixel data
	ctx.drawImage(source, 0, 0);
	const imageData: ImageData = ctx.getImageData(
		0,
		0,
		canvas.width,
		canvas.height,
	);
	const data: Uint8ClampedArray = imageData.data;

	// let avgDist = 0;
	// const factor = 1 / (data.length / 4);
	const dist = [];
	// 4. Pixel manipulation loop
	for (let i = 0; i < data.length; i += 4) {
		const r = 255 - data[i]!;
		const g = 255 - data[i + 1]!;
		const b = 255 - data[i + 2]!;

		dist[i / 4] = Math.hypot(r, g, b);
		// avgDist += dist[i / 4]! * factor;
	}

	for (let i = 0; i < data.length; i += 4) {
		const x = (i / 4) % canvas.width;
		const y = Math.floor(i / 4 / canvas.width);

		let sum = dist[i / 4]!;
		let count = 1;

		for (const [dx, dy] of kernel) {
			const nx = x + dx!;
			const ny = y + dy!;

			if (nx >= 0 && nx < canvas.width && ny >= 0 && ny < canvas.height) {
				sum += dist[ny * canvas.width + nx]!;
				count++;
			}
		}

		const avgDist = sum / count;
		// Check if the pixel brightness exceeds the threshold
		if (avgDist < threshold) {
			data[i + 3] = 0;
		}
	}
	// console.log(avgDist);

	// 5. Update canvas with transparent pixels
	ctx.putImageData(imageData, 0, 0);

	hackyCache.set(source, canvas);
	return canvas;
}

function createSquareKernelIndicies(size: number): [number, number][] {
	const indicies: [number, number][] = [];
	const half = Math.floor(size / 2);
	for (let y = -half; y <= half; y++) {
		for (let x = -half; x <= half; x++) {
			indicies.push([x, y]);
		}
	}
	return indicies;
}
