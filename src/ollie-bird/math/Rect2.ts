export interface Rect2Like {
	x: number;
	y: number;
	width: number;
	height: number;
}

export default class Rect2 implements Rect2Like {
	constructor(
		public x: number,
		public y: number,
		public width: number,
		public height: number,
	) {}

	static fromAABB(
		minX: number,
		minY: number,
		maxX: number,
		maxY: number,
	): Rect2 {
		return new Rect2(minX, minY, maxX - minX, maxY - minY);
	}

	noramlize(): this {
		if (this.width <= 0) {
			this.x += this.width;
			this.width = -this.width;
		}

		if (this.height <= 0) {
			this.y += this.height;
			this.height = -this.height;
		}

		return this;
	}

	normalized(): Rect2 {
		let x = this.x;
		let y = this.y;
		let width = this.width;
		let height = this.height;

		if (width <= 0) {
			x += width;
			width = -width;
		}

		if (height <= 0) {
			y += height;
			height = -height;
		}

		return new Rect2(x, y, width, height);
	}
}
