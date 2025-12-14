import type { Vec2Like } from './Vec2';

type MatrixValues = [
	number,
	number,
	number,
	number,
	number,
	number,
	number,
	number,
	number,
];

export default class Mat3 {
	#values: MatrixValues;

	constructor(values?: MatrixValues) {
		// prettier-ignore
		this.#values = values ?? [
			1, 0, 0,
			0, 1, 0,
			0, 0, 1,
		];
	}

	multiply(rhs: Mat3): Mat3 {
		const result = new Mat3();
		// prettier-ignore
		result.#values = [
			this.#values[0] * rhs.#values[0] + this.#values[1] * rhs.#values[3] + this.#values[2] * rhs.#values[6],
			this.#values[0] * rhs.#values[1] + this.#values[1] * rhs.#values[4] + this.#values[2] * rhs.#values[7],
			this.#values[0] * rhs.#values[2] + this.#values[1] * rhs.#values[5] + this.#values[2] * rhs.#values[8],

			this.#values[3] * rhs.#values[0] + this.#values[4] * rhs.#values[3] + this.#values[5] * rhs.#values[6],
			this.#values[3] * rhs.#values[1] + this.#values[4] * rhs.#values[4] + this.#values[5] * rhs.#values[7],
			this.#values[3] * rhs.#values[2] + this.#values[4] * rhs.#values[5] + this.#values[5] * rhs.#values[8],

			this.#values[6] * rhs.#values[0] + this.#values[7] * rhs.#values[3] + this.#values[8] * rhs.#values[6],
			this.#values[6] * rhs.#values[1] + this.#values[7] * rhs.#values[4] + this.#values[8] * rhs.#values[7],
			this.#values[6] * rhs.#values[2] + this.#values[7] * rhs.#values[5] + this.#values[8] * rhs.#values[8],
		];
		return result;
	}

	transformPoint(vec: Vec2Like): Vec2Like {
		const x =
			this.#values[0] * vec.x + this.#values[1] * vec.y + this.#values[2];
		const y =
			this.#values[3] * vec.x + this.#values[4] * vec.y + this.#values[5];
		const w =
			this.#values[6] * vec.x + this.#values[7] * vec.y + this.#values[8];

		return {
			x: x / w,
			y: y / w,
		};
	}

	transformDirection(vec: Vec2Like): Vec2Like {
		const x = this.#values[0] * vec.x + this.#values[1] * vec.y;
		const y = this.#values[3] * vec.x + this.#values[4] * vec.y;

		return {
			x,
			y,
		};
	}

	static translation(tx: number, ty: number): Mat3 {
		const mat = new Mat3();
		// prettier-ignore
		mat.#values = [
			1, 0, tx,
			0, 1, ty,
			0, 0, 1,
		];
		return mat;
	}

	static rotation(angleInRadians: number): Mat3 {
		const cos = Math.cos(angleInRadians);
		const sin = Math.sin(angleInRadians);
		const mat = new Mat3();
		// prettier-ignore
		mat.#values = [
			cos, -sin, 0,
			sin, cos, 0,
			0, 0, 1,
		];
		return mat;
	}

	static identity(): Mat3 {
		const mat = new Mat3();
		// prettier-ignore
		mat.#values = [
			1, 0, 0,
			0, 1, 0,
			0, 0, 1,
		];
		return mat;
	}
}
