import { Subject } from 'rxjs';
import z from 'zod';
import { ReactInterop } from '../../../react-interop/ReactInterop';

export const vec2Schema = z.object({
	x: z.coerce.number(),
	y: z.coerce.number(),
});

export interface Vec2Like {
	x: number;
	y: number;
}

export default class Vec2 implements Vec2Like, ReactInterop<Vec2Like> {
	readonly #change = new Subject<void>();

	#x: number;
	#y: number;

	get x(): number {
		return this.#x;
	}
	set x(value: number) {
		this.#x = value;
		this.notify();
	}

	get y(): number {
		return this.#y;
	}
	set y(value: number) {
		this.#y = value;
		this.notify();
	}

	get xy(): [number, number] {
		return [this.#x, this.#y];
	}
	set xy(value: [number, number]) {
		[this.#x, this.#y] = value;
		this.notify();
	}

	constructor(x: number, y: number) {
		this.#x = x;
		this.#y = y;
	}

	private notify() {
		this.#change.next();
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

	static get right(): Vec2 {
		return new Vec2(1, 0);
	}

	static get up(): Vec2 {
		return new Vec2(0, -1);
	}

	static get left(): Vec2 {
		return new Vec2(-1, 0);
	}

	static get down(): Vec2 {
		return new Vec2(0, 1);
	}

	add(vec: Vec2Like): Vec2 {
		return new Vec2(this.x + vec.x, this.y + vec.y);
	}

	iadd(vec: Vec2Like): this {
		this.#x += vec.x;
		this.#y += vec.y;
		this.notify();
		return this;
	}

	subtract(vec: Vec2Like): Vec2 {
		return new Vec2(this.x - vec.x, this.y - vec.y);
	}

	isubtract(vec: Vec2Like): this {
		this.#x -= vec.x;
		this.#y -= vec.y;
		this.notify();
		return this;
	}

	scale(scalar: number): Vec2 {
		return new Vec2(this.x * scalar, this.y * scalar);
	}

	iscale(scalar: number): this {
		this.#x *= scalar;
		this.#y *= scalar;
		this.notify();
		return this;
	}

	abs(): Vec2 {
		return new Vec2(Math.abs(this.x), Math.abs(this.y));
	}

	iabs(): this {
		this.#x = Math.abs(this.#x);
		this.#y = Math.abs(this.#y);
		this.notify();
		return this;
	}

	hypot(): number {
		return Math.hypot(this.x, this.y);
	}

	normalized(): Vec2 {
		const length = this.hypot();
		if (length === 0) {
			return new Vec2(0, 0);
		}
		return new Vec2(this.x / length, this.y / length);
	}

	normalize(): this {
		const length = this.hypot();
		if (length === 0) {
			return this;
		}
		this.#x /= length;
		this.#y /= length;
		this.notify();
		return this;
	}

	set(x: number, y: number): this {
		this.#x = x;
		this.#y = y;
		this.notify();
		return this;
	}

	copy(vec: Vec2Like): this {
		this.#x = vec.x;
		this.#y = vec.y;
		this.notify();
		return this;
	}

	clone(): Vec2 {
		return new Vec2(this.#x, this.#y);
	}

	[ReactInterop.set](data: Vec2Like): void {
		this.#x = data.x;
		this.#y = data.y;
		this.notify();
	}

	[ReactInterop.get](): Vec2Like {
		return { x: this.#x, y: this.#y };
	}

	readonly [ReactInterop.asObservable] = this.#change.asObservable();

	readonly [ReactInterop.schema] = vec2Schema;
}
