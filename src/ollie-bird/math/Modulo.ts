export default class Modulo {
	/**
	 * gets the minimal difference between two angles in a modular space in the
	 * range [-modulus/2, modulus/2) such that `(a + difference(a, b, modulus)) % modulus == b`
	 */
	static difference(a: number, b: number, modulus: number): number {
		const diff = a - b;

		return Modulo.normalize(diff + modulus / 2, modulus) - modulus / 2;
	}

	/**
	 * normalizes a value into the range [0, modulus)
	 */
	static normalize(value: number, modulus: number): number {
		return ((value % modulus) + modulus) % modulus;
	}
}
