export interface Vec2Like {
	x: number;
	y: number;
}
export default class Vec2 implements Vec2Like {
	public x: number;
	public y: number;

	constructor();
	constructor(x: number, y: number);
	constructor(obj: Vec2Like);

	constructor(xOrObj?: number | Vec2Like, y?: number) {
		if (typeof xOrObj === 'number' && typeof y === 'number') {
			this.x = xOrObj;
			this.y = y;
		} else if (typeof xOrObj === 'object' && xOrObj !== null) {
			this.x = xOrObj.x;
			this.y = xOrObj.y;
		} else {
			this.x = 0;
			this.y = 0;
		}
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
		this.x /= length;
		this.y /= length;
		return this;
	}

	set(x: number, y: number): void;
	set(vec: Vec2Like): void;

	set(xOrObj: number | Vec2Like, y?: number): void {
		if (typeof xOrObj === 'number' && typeof y === 'number') {
			this.x = xOrObj;
			this.y = y;
		} else if (typeof xOrObj === 'object' && xOrObj !== null) {
			this.x = xOrObj.x;
			this.y = xOrObj.y;
		}
	}

	get xy(): [number, number] {
		return [this.x, this.y];
	}
}
