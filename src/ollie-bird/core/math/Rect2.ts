import { Subject } from 'rxjs';
import z from 'zod';
import { ReactInterop } from '../../../react-interop/ReactInterop';

export const rect2Schema = z.object({
	x: z.coerce.number(),
	y: z.coerce.number(),
	width: z.coerce.number(),
	height: z.coerce.number(),
});

export type Rect2Like = z.infer<typeof rect2Schema>;

export default class Rect2 implements Rect2Like, ReactInterop<Rect2Like> {
	readonly #change = new Subject<void>();

	#x: number;
	#y: number;
	#width: number;
	#height: number;

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

	get width(): number {
		return this.#width;
	}
	set width(value: number) {
		this.#width = value;
		this.notify();
	}

	get height(): number {
		return this.#height;
	}
	set height(value: number) {
		this.#height = value;
		this.notify();
	}

	get xy(): [number, number] {
		return [this.#x, this.#y];
	}
	set xy(value: [number, number]) {
		[this.#x, this.#y] = value;
		this.notify();
	}

	get wh(): [number, number] {
		return [this.#width, this.#height];
	}
	set wh(value: [number, number]) {
		[this.#width, this.#height] = value;
		this.notify();
	}

	get xywh(): [number, number, number, number] {
		return [this.#x, this.#y, this.#width, this.#height];
	}
	set xywh(value: [number, number, number, number]) {
		[this.#x, this.#y, this.#width, this.#height] = value;
		this.notify();
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

	private notify() {
		this.#change.next();
	}

	copy(rect: Rect2Like): this {
		this.#x = rect.x;
		this.#y = rect.y;
		this.#width = rect.width;
		this.#height = rect.height;
		this.notify();
		return this;
	}

	set(x: number, y: number, width: number, height: number): this {
		this.#x = x;
		this.#y = y;
		this.#width = width;
		this.#height = height;
		this.notify();
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

		this.notify();
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

	[ReactInterop.set](data: Rect2Like): void {
		this.#x = data.x;
		this.#y = data.y;
		this.#width = data.width;
		this.#height = data.height;
		this.notify();
	}
	[ReactInterop.get](): Rect2Like {
		return {
			x: this.#x,
			y: this.#y,
			width: this.#width,
			height: this.#height,
		};
	}
	readonly [ReactInterop.asObservable] = this.#change.asObservable();
	readonly [ReactInterop.schema] = rect2Schema;
}
