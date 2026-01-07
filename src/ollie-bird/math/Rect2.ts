import EventSource from '../EventSource';

export interface Rect2Like {
	x: number;
	y: number;
	width: number;
	height: number;
}

export default class Rect2 implements Rect2Like {
	#x: number;
	#y: number;
	#width: number;
	#height: number;

	get x(): number {
		return this.#x;
	}
	set x(value: number) {
		this.#x = value;
		this.notifyChange();
	}

	get y(): number {
		return this.#y;
	}
	set y(value: number) {
		this.#y = value;
		this.notifyChange();
	}

	get width(): number {
		return this.#width;
	}
	set width(value: number) {
		this.#width = value;
		this.notifyChange();
	}

	get height(): number {
		return this.#height;
	}
	set height(value: number) {
		this.#height = value;
		this.notifyChange();
	}

	constructor(x: number, y: number, width: number, height: number) {
		this.#x = x;
		this.#y = y;
		this.#width = width;
		this.#height = height;
	}

	static fromAABB(
		minX: number,
		minY: number,
		maxX: number,
		maxY: number,
	): Rect2 {
		return new Rect2(minX, minY, maxX - minX, maxY - minY);
	}

	static get one(): Rect2 {
		return new Rect2(0, 0, 1, 1);
	}

	readonly change = new EventSource<{ change: void }>();
	private notifyChange() {
		this.change.emit('change', void 0);
	}

	copy(rect: Rect2Like): this {
		this.#x = rect.x;
		this.#y = rect.y;
		this.#width = rect.width;
		this.#height = rect.height;
		this.notifyChange();
		return this;
	}

	set(x: number, y: number, width: number, height: number): this {
		this.#x = x;
		this.#y = y;
		this.#width = width;
		this.#height = height;
		this.notifyChange();
		return this;
	}

	aspectRatio(): number | undefined {
		if (this.#height === 0) {
			return undefined;
		}

		return this.#width / this.#height;
	}

	normalize(): this {
		if (this.#width <= 0) {
			this.#x += this.#width;
			this.#width = -this.#width;
		}

		if (this.#height <= 0) {
			this.#y += this.#height;
			this.#height = -this.#height;
		}

		this.notifyChange();
		return this;
	}

	normalized(): Rect2 {
		let x = this.#x;
		let y = this.#y;
		let width = this.#width;
		let height = this.#height;

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

	clone(): Rect2 {
		return new Rect2(this.#x, this.#y, this.#width, this.#height);
	}
}
