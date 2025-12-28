import { describe, expect, test } from 'vitest';
import Circle from './Circle';
import Rectangle from './Rectangle';

describe('Rectangle', () => {
	describe('Rectangle-Rectangle Collision', () => {
		test('non-overlapping', () => {
			const rectA = new Rectangle(0, 0, 10, 10);
			const rectB = new Rectangle(20, 0, 10, 10);

			expect(rectA.checkCollision(rectB)).toBe(false);
		});

		test('overlapping', () => {
			const rectA = new Rectangle(0, 0, 15, 15);
			const rectB = new Rectangle(10, 10, 15, 15);

			expect(rectA.checkCollision(rectB)).toBe(true);
		});

		test('edge touching', () => {
			const rectA = new Rectangle(0, 0, 10, 10);
			const rectB = new Rectangle(10, 0, 10, 10);

			expect(rectA.checkCollision(rectB)).toBe(true);
		});

		test('one inside another', () => {
			const rectA = new Rectangle(0, 0, 20, 20);
			const rectB = new Rectangle(5, 5, 5, 5);

			expect(rectA.checkCollision(rectB)).toBe(true);
		});
	});

	describe('Rectangle-Circle Collision', () => {
		test('non-overlapping', () => {
			const rect = new Rectangle(0, 0, 10, 10);
			const circle = new Circle(20, 20, 5);

			expect(rect.checkCollision(circle)).toBe(false);
		});

		test('overlapping', () => {
			const rect = new Rectangle(0, 0, 15, 15);
			const circle = new Circle(10, 10, 10);

			expect(rect.checkCollision(circle)).toBe(true);
		});

		test('tangential', () => {
			const rect = new Rectangle(0, 0, 10, 10);
			const circle = new Circle(15, 5, 5);

			expect(rect.checkCollision(circle)).toBe(true);
		});

		test('circle inside rectangle', () => {
			const rect = new Rectangle(0, 0, 20, 20);
			const circle = new Circle(10, 10, 5);

			expect(rect.checkCollision(circle)).toBe(true);
		});
	});
});
