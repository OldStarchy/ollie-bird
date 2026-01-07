import EventSource from '../EventSource';

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

	constructor(x: number, y: number) {
		this.#x = x;
		this.#y = y;
	}

	readonly change = new EventSource<{ change: void }>();
	private notifyChange() {
		this.change.emit('change', void 0);
	}

	static from(other: Vec2Like): Vec2 {
		return new Vec2(other.x, other.y);
	}

	static get zero(): Vec2 {
		return new Vec2(0, 0);
	}

	static get one(): Vec2 {
		return new Vec2(1, 1);
	}

	add(vec: Vec2Like): Vec2 {
		return new Vec2(this.x + vec.x, this.y + vec.y);
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

	inormalize(): Vec2 {
		const length = this.hypot();
		if (length === 0) {
			return this;
		}
		this.#x /= length;
		this.#y /= length;
		this.notifyChange();
		return this;
	}

	set(x: number, y: number): void {
		this.#x = x;
		this.#y = y;
		this.notifyChange();
	}

	copy(vec: Vec2Like): void {
		this.#x = vec.x;
		this.#y = vec.y;
		this.notifyChange();
	}

	get xy(): [number, number] {
		return [this.#x, this.#y];
	}

	clone(): Vec2 {
		return new Vec2(this.#x, this.#y);
	}
}
