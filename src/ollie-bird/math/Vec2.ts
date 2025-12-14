import Signal from '../Signal';

export interface Vec2Like {
	x: number;
	y: number;
}
export default class Vec2 implements Vec2Like {
	#x: number;
	#y: number;

	get x(): number {
		return this.#x;
	}

	get y(): number {
		return this.#y;
	}

	set x(value: number) {
		if (this.#x !== value) {
			this.#x = value;
			this.changed.emit();
		}
	}

	set y(value: number) {
		if (this.#y !== value) {
			this.#y = value;
			this.changed.emit();
		}
	}

	readonly changed = new Signal<void>();

	constructor();
	constructor(x: number, y: number);
	constructor(obj: Vec2Like);

	constructor(xOrObj?: number | Vec2Like, y?: number) {
		if (typeof xOrObj === 'number' && typeof y === 'number') {
			this.#x = xOrObj;
			this.#y = y;
		} else if (typeof xOrObj === 'object' && xOrObj !== null) {
			this.#x = xOrObj.x;
			this.#y = xOrObj.y;
		} else {
			this.#x = 0;
			this.#y = 0;
		}
	}

	add(vec: Vec2Like): Vec2 {
		return new Vec2(this.x + vec.x, this.y + vec.y);
	}

	iadd(vec: Vec2Like): void {
		this.#x += vec.x;
		this.#y += vec.y;
		this.changed.emit();
	}

	subtract(vec: Vec2Like): Vec2 {
		return new Vec2(this.x - vec.x, this.y - vec.y);
	}

	scale(scalar: number): Vec2 {
		return new Vec2(this.x * scalar, this.y * scalar);
	}

	abs(): Vec2 {
		return new Vec2(Math.abs(this.x), Math.abs(this.y));
	}

	hypot(): number {
		return Math.hypot(this.x, this.y);
	}

	normalize(): Vec2 {
		const length = this.hypot();
		if (length === 0) {
			return new Vec2(0, 0);
		}
		return new Vec2(this.x / length, this.y / length);
	}

	copy(other: Vec2Like): void {
		this.#x = other.x;
		this.#y = other.y;
		this.changed.emit();
	}

	set(x: number, y: number): void {
		this.#x = x;
		this.#y = y;
		this.changed.emit();
	}

	get xy(): [number, number] {
		return [this.x, this.y];
	}

	set xy(value: [number, number]) {
		this.#x = value[0];
		this.#y = value[1];

		this.changed.emit();
	}
}
