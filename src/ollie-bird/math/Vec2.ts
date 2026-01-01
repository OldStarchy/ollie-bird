export interface Vec2Like {
	x: number;
	y: number;
}
export default class Vec2 implements Vec2Like {
	public x: number;
	public y: number;

	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
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

	iadd(vec: Vec2Like): this {
		this.x += vec.x;
		this.y += vec.y;
		return this;
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
		this.x /= length;
		this.y /= length;
		return this;
	}

	set(x: number, y: number): void {
		this.x = x;
		this.y = y;
	}

	copy(vec: Vec2Like): void {
		this.x = vec.x;
		this.y = vec.y;
	}

	get xy(): [number, number] {
		return [this.x, this.y];
	}
}
