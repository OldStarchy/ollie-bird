import z from 'zod';
import type { NotifyPropertyChanged } from '../../property/NotifyPropertyChanged';
import { property } from '../../property/property';
import EventSource from '../EventSource';
import Rect2, { type Rect2Like } from '../math/Rect2';

export default class Sprite implements NotifyPropertyChanged {
	readonly propertyChanged = new EventSource<{
		change: { name: PropertyKey };
	}>();

	readonly sourceRect = new Rect2(0, 0, 16, 16);
	readonly image: HTMLImageElement;

	@property(z.string().meta({ title: 'Image Source' }))
	get src(): string {
		return this.image.src.split('/').pop() || '';
	}

	@property(z.number().meta({ title: 'Source X' }))
	set x(value: number) {
		this.sourceRect.x = value;
	}
	get x(): number {
		return this.sourceRect.x;
	}
	@property(z.number().meta({ title: 'Source Y' }))
	set y(value: number) {
		this.sourceRect.y = value;
	}
	get y(): number {
		return this.sourceRect.y;
	}
	@property(z.number().min(1).meta({ title: 'Source Width' }))
	set width(value: number) {
		this.sourceRect.width = value;
	}
	get width(): number {
		return this.sourceRect.width;
	}
	@property(z.number().min(1).meta({ title: 'Source Height' }))
	set height(value: number) {
		this.sourceRect.height = value;
	}
	get height(): number {
		return this.sourceRect.height;
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
