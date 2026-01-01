import { describe, expect, it } from 'vitest';
import Modulo from './Modulo';

describe('Modulo', () => {
	describe('normalize', () => {
		it('should normalize positive values within range', () => {
			expect(Modulo.normalize(5, 10)).toBe(5);
			expect(Modulo.normalize(3, 8)).toBe(3);
			expect(Modulo.normalize(0, 5)).toBe(0);
		});

		it('should normalize positive values outside range', () => {
			expect(Modulo.normalize(15, 10)).toBe(5);
			expect(Modulo.normalize(23, 8)).toBe(7);
			expect(Modulo.normalize(12, 5)).toBe(2);
		});

		it('should normalize negative values', () => {
			expect(Modulo.normalize(-1, 10)).toBe(9);
			expect(Modulo.normalize(-5, 8)).toBe(3);
			expect(Modulo.normalize(-12, 5)).toBe(3);
		});

		it('should normalize large negative values', () => {
			expect(Modulo.normalize(-15, 10)).toBe(5);
			expect(Modulo.normalize(-23, 8)).toBe(1);
			expect(Modulo.normalize(-17, 5)).toBe(3);
		});

		it('should handle zero modulus edge case', () => {
			// Note: In JavaScript, x % 0 returns NaN
			expect(Modulo.normalize(5, 0)).toBeNaN();
		});

		it('should handle floating point values', () => {
			expect(Modulo.normalize(7.5, 5)).toBeCloseTo(2.5);
			expect(Modulo.normalize(-2.3, 4)).toBeCloseTo(1.7);
		});

		it('should handle exact multiples of modulus', () => {
			expect(Modulo.normalize(10, 10)).toBe(0);
			expect(Modulo.normalize(-10, 10)).toBe(0);
			expect(Modulo.normalize(20, 10)).toBe(0);
		});
	});

	describe('difference', () => {
		it('should calculate simple differences', () => {
			expect(Modulo.difference(5, 3, 10)).toBe(2);
			expect(Modulo.difference(3, 5, 10)).toBe(-2); // -2 in range [-5, 5)
			expect(Modulo.difference(0, 0, 10)).toBe(0);
		});

		it('should handle differences across modular boundary', () => {
			expect(Modulo.difference(1, 9, 10)).toBe(2); // (1-9) = -8, normalized to [-5, 5) gives -2
			expect(Modulo.difference(9, 1, 10)).toBe(-2); // (9-1) = 8, normalized to [-5, 5) gives -2
		});

		it('should handle large values', () => {
			expect(Modulo.difference(15, 3, 10)).toBe(2); // (15-3) = 12, 12 in [-5,5) becomes 2
			expect(Modulo.difference(3, 15, 10)).toBe(-2); // (3-15) = -12, -12 in [-5,5) becomes -2
		});

		it('should handle negative inputs', () => {
			expect(Modulo.difference(-2, 3, 10)).toBe(-5); // (-2-3) = -5, which is in range [-5,5)
			expect(Modulo.difference(3, -2, 10)).toBe(-5); // (3-(-2)) = 5, but 5 >= 5, so 5-10 = -5
		});

		it('should work with angle-like values (360 degrees)', () => {
			// Common use case for angular differences
			expect(Modulo.difference(10, 350, 360)).toBe(20); // -340 + 360 = 20, which is in [-180, 180)
			expect(Modulo.difference(350, 10, 360)).toBe(-20); // 340 - 180 = 160, but 340 >= 180 so 340 - 360 = -20
			expect(Modulo.difference(180, 0, 360)).toBe(-180); // 180 >= 180 so 180 - 360 = -180
			expect(Modulo.difference(0, 180, 360)).toBe(-180); // -180 is in [-180, 180)
		});

		it('should work with 2π radians', () => {
			const TWO_PI = 2 * Math.PI;
			expect(Modulo.difference(0.1, TWO_PI - 0.1, TWO_PI)).toBeCloseTo(
				0.2,
			);
			expect(Modulo.difference(TWO_PI - 0.1, 0.1, TWO_PI)).toBeCloseTo(
				-0.2,
			);
		});

		it('should handle floating point differences', () => {
			expect(Modulo.difference(7.5, 2.3, 10)).toBeCloseTo(-4.8); // 5.2 - 10 = -4.8 (since 5.2 >= 5)
			expect(Modulo.difference(2.3, 7.5, 10)).toBeCloseTo(4.8); // -5.2 + 10 = 4.8, but 4.8 < 5 so it stays
		});

		it('should handle zero modulus edge case', () => {
			expect(Modulo.difference(5, 3, 0)).toBeNaN();
		});

		it('should handle equal values', () => {
			expect(Modulo.difference(5, 5, 10)).toBe(0);
			expect(Modulo.difference(15, 5, 10)).toBe(0); // Both normalize to 5
		});
	});

	describe('edge cases and properties', () => {
		it('should maintain mathematical properties', () => {
			// For any a, b, and modulus m:
			// normalize(a + b, m) should equal normalize(normalize(a, m) + normalize(b, m), m)
			const testCases = [
				[5, 7, 10],
				[-3, 15, 8],
				[23, -11, 12],
			] as const;

			testCases.forEach(([a, b, m]) => {
				const direct = Modulo.normalize(a + b, m);
				const indirect = Modulo.normalize(
					Modulo.normalize(a, m) + Modulo.normalize(b, m),
					m,
				);
				expect(direct).toBeCloseTo(indirect);
			});
		});

		it('should handle very large numbers', () => {
			expect(Modulo.normalize(1000000007, 1000000)).toBe(7);
			expect(Modulo.normalize(-1000000007, 1000000)).toBe(999993);
		});

		it('should be consistent with difference symmetry', () => {
			// difference(a, b, m) + difference(b, a, m) should equal 0 (since they're opposite directions)
			const testCases = [
				[3, 7, 10],
				[15, 2, 8],
				[0, 5, 12],
			] as const;

			testCases.forEach(([a, b, m]) => {
				const diff1 = Modulo.difference(a, b, m);
				const diff2 = Modulo.difference(b, a, m);
				const sum = diff1 + diff2;
				expect(Math.abs(sum)).toBeCloseTo(0);
			});
		});
	});
});
