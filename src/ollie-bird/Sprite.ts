import Rect2, { type Rect2Like } from './math/Rect2';

export default class Sprite {
	readonly sourceRect = new Rect2(0, 0, 16, 16);
	readonly image: HTMLImageElement;

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
		cellWidth: number,
		cellHeight: number,
		imageWidth: number,
		imageHeight: number,
	): Sprite[] {
		const image = Sprite.toImage(imageOrSrc);
		const sprites: Sprite[] = [];
		for (let y = 0; y < imageHeight; y += cellHeight) {
			for (let x = 0; x < imageWidth; x += cellWidth) {
				sprites.push(
					new Sprite(image, {
						x: x,
						y: y,
						width: cellWidth,
						height: cellHeight,
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
