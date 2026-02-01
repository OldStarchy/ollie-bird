import { describe, expect, test } from 'vitest';
import CircleCollider from './CircleCollider';
import RectangleCollider from './RectangleCollider';

describe('RectangleCollider', () => {
	describe('Rectangle-Rectangle Collision', () => {
		test('non-overlapping', () => {
			const rectA = new RectangleCollider(0, 0, 10, 10);
			const rectB = new RectangleCollider(20, 0, 10, 10);

			expect(rectA.checkCollision(rectB)).toBe(false);
		});

		test('overlapping', () => {
			const rectA = new RectangleCollider(0, 0, 15, 15);
			const rectB = new RectangleCollider(10, 10, 15, 15);

			expect(rectA.checkCollision(rectB)).toBe(true);
		});

		test('edge touching', () => {
			const rectA = new RectangleCollider(0, 0, 10, 10);
			const rectB = new RectangleCollider(10, 0, 10, 10);

			expect(rectA.checkCollision(rectB)).toBe(true);
		});

		test('one inside another', () => {
			const rectA = new RectangleCollider(0, 0, 20, 20);
			const rectB = new RectangleCollider(5, 5, 5, 5);

			expect(rectA.checkCollision(rectB)).toBe(true);
		});
	});

	describe('Rectangle-Circle Collision', () => {
		test('non-overlapping', () => {
			const rect = new RectangleCollider(0, 0, 10, 10);
			const circle = new CircleCollider(20, 20, 5);

			expect(rect.checkCollision(circle)).toBe(false);
		});

		test('overlapping', () => {
			const rect = new RectangleCollider(0, 0, 15, 15);
			const circle = new CircleCollider(10, 10, 10);

			expect(rect.checkCollision(circle)).toBe(true);
		});

		test('tangential', () => {
			const rect = new RectangleCollider(0, 0, 10, 10);
			const circle = new CircleCollider(15, 5, 5);

			expect(rect.checkCollision(circle)).toBe(true);
		});

		test('circle inside rectangle', () => {
			const rect = new RectangleCollider(0, 0, 20, 20);
			const circle = new CircleCollider(10, 10, 5);

			expect(rect.checkCollision(circle)).toBe(true);
		});
	});
});
