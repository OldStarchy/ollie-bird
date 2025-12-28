import { describe, expect, test } from 'vitest';
import Circle from './Circle';
import Ray from './Ray';
import Rectangle from './Rectangle';

describe('Ray', () => {
	describe('Ray-Ray Collision', () => {
		test('non-intersecting rays', () => {
			const rayA = new Ray({ x: 0, y: 0 }, { x: 1, y: 0 }, 10);
			const rayB = new Ray({ x: 0, y: 5 }, { x: 1, y: 0 }, 10);

			expect(rayA.checkCollision(rayB)).toBe(false);
		});

		test('intersecting rays', () => {
			const rayA = new Ray({ x: 0, y: 0 }, { x: 1, y: 0 }, 10);
			const rayB = new Ray({ x: 5, y: -5 }, { x: 0, y: 1 }, 10);

			expect(rayA.checkCollision(rayB)).toBe(true);
		});

		test('parallel rays', () => {
			const rayA = new Ray({ x: 0, y: 0 }, { x: 1, y: 0 }, 10);
			const rayB = new Ray({ x: 0, y: 5 }, { x: 1, y: 0 }, 10);

			expect(rayA.checkCollision(rayB)).toBe(false);
		});

		test('rays pointing away from each other', () => {
			const rayA = new Ray({ x: 0, y: 0 }, { x: 1, y: 0 }, 5);
			const rayB = new Ray({ x: 10, y: 0 }, { x: 1, y: 0 }, 5);

			expect(rayA.checkCollision(rayB)).toBe(false);
		});

		test('rays intersecting at origin', () => {
			const rayA = new Ray({ x: 0, y: 0 }, { x: 1, y: 0 }, 10);
			const rayB = new Ray({ x: 0, y: 0 }, { x: 0, y: 1 }, 10);

			expect(rayA.checkCollision(rayB)).toBe(true);
		});

		test('rays intersecting beyond distance', () => {
			const rayA = new Ray({ x: 0, y: 0 }, { x: 1, y: 0 }, 3);
			const rayB = new Ray({ x: 5, y: -5 }, { x: 0, y: 1 }, 3);

			expect(rayA.checkCollision(rayB)).toBe(false);
		});

		test('diagonal rays intersecting', () => {
			const rayA = new Ray({ x: 0, y: 0 }, { x: 1, y: 1 }, 10);
			const rayB = new Ray({ x: 0, y: 5 }, { x: 1, y: -1 }, 10);

			expect(rayA.checkCollision(rayB)).toBe(true);
		});
	});

	describe('Ray-Rectangle Collision', () => {
		test('ray missing rectangle', () => {
			const ray = new Ray({ x: 0, y: 0 }, { x: 1, y: 0 }, 10);
			const rect = new Rectangle(0, 10, 10, 10);

			expect(ray.checkCollision(rect)).toBe(false);
		});

		test('ray hitting rectangle center', () => {
			const ray = new Ray({ x: 0, y: 5 }, { x: 1, y: 0 }, 20);
			const rect = new Rectangle(10, 0, 10, 10);

			expect(ray.checkCollision(rect)).toBe(true);
		});

		test('ray hitting rectangle edge', () => {
			const ray = new Ray({ x: 0, y: 5 }, { x: 1, y: 0 }, 20);
			const rect = new Rectangle(10, 0, 10, 10);

			expect(ray.checkCollision(rect)).toBe(true);
		});

		test('ray origin inside rectangle', () => {
			const ray = new Ray({ x: 5, y: 5 }, { x: 1, y: 0 }, 10);
			const rect = new Rectangle(0, 0, 10, 10);

			expect(ray.checkCollision(rect)).toBe(true);
		});

		test('ray too short to reach rectangle', () => {
			const ray = new Ray({ x: 0, y: 5 }, { x: 1, y: 0 }, 5);
			const rect = new Rectangle(10, 0, 10, 10);

			expect(ray.checkCollision(rect)).toBe(false);
		});

		test('ray pointing away from rectangle', () => {
			const ray = new Ray({ x: 0, y: 5 }, { x: -1, y: 0 }, 10);
			const rect = new Rectangle(10, 0, 10, 10);

			expect(ray.checkCollision(rect)).toBe(false);
		});

		test('vertical ray hitting horizontal rectangle', () => {
			const ray = new Ray({ x: 5, y: 0 }, { x: 0, y: 1 }, 20);
			const rect = new Rectangle(0, 10, 10, 5);

			expect(ray.checkCollision(rect)).toBe(true);
		});

		test('diagonal ray hitting rectangle', () => {
			const ray = new Ray({ x: 0, y: 0 }, { x: 1, y: 1 }, 20);
			const rect = new Rectangle(5, 5, 5, 5);

			expect(ray.checkCollision(rect)).toBe(true);
		});

		test('ray with zero x-direction', () => {
			const ray = new Ray({ x: 5, y: 0 }, { x: 0, y: 1 }, 20);
			const rect = new Rectangle(0, 10, 10, 5);

			expect(ray.checkCollision(rect)).toBe(true);
		});

		test('ray with zero y-direction', () => {
			const ray = new Ray({ x: 0, y: 5 }, { x: 1, y: 0 }, 20);
			const rect = new Rectangle(10, 0, 10, 10);

			expect(ray.checkCollision(rect)).toBe(true);
		});
	});

	describe('Ray-Circle Collision', () => {
		test('ray missing circle', () => {
			const ray = new Ray({ x: 0, y: 0 }, { x: 1, y: 0 }, 10);
			const circle = new Circle(5, 10, 2);

			expect(ray.checkCollision(circle)).toBe(false);
		});

		test('ray hitting circle center', () => {
			const ray = new Ray({ x: 0, y: 5 }, { x: 1, y: 0 }, 20);
			const circle = new Circle(10, 5, 3);

			expect(ray.checkCollision(circle)).toBe(true);
		});

		test('ray tangent to circle', () => {
			const ray = new Ray({ x: 0, y: 0 }, { x: 1, y: 0 }, 20);
			const circle = new Circle(10, 5, 5);

			expect(ray.checkCollision(circle)).toBe(true);
		});

		test('ray origin inside circle', () => {
			const ray = new Ray({ x: 10, y: 5 }, { x: 1, y: 0 }, 10);
			const circle = new Circle(10, 5, 5);

			expect(ray.checkCollision(circle)).toBe(true);
		});

		test('ray too short to reach circle', () => {
			const ray = new Ray({ x: 0, y: 5 }, { x: 1, y: 0 }, 5);
			const circle = new Circle(10, 5, 2);

			expect(ray.checkCollision(circle)).toBe(false);
		});

		test('ray pointing away from circle', () => {
			const ray = new Ray({ x: 0, y: 5 }, { x: -1, y: 0 }, 10);
			const circle = new Circle(10, 5, 3);

			expect(ray.checkCollision(circle)).toBe(false);
		});

		test('ray passing through circle', () => {
			const ray = new Ray({ x: 0, y: 5 }, { x: 1, y: 0 }, 20);
			const circle = new Circle(10, 5, 5);

			expect(ray.checkCollision(circle)).toBe(true);
		});

		test('vertical ray hitting circle', () => {
			const ray = new Ray({ x: 10, y: 0 }, { x: 0, y: 1 }, 20);
			const circle = new Circle(10, 10, 3);

			expect(ray.checkCollision(circle)).toBe(true);
		});

		test('diagonal ray hitting circle', () => {
			const ray = new Ray({ x: 0, y: 0 }, { x: 1, y: 1 }, 20);
			const circle = new Circle(10, 10, 3);

			expect(ray.checkCollision(circle)).toBe(true);
		});

		test('ray intersecting circle', () => {
			const ray = new Ray({ x: 0, y: 8 }, { x: 1, y: 0 }, 20);
			const circle = new Circle(10, 10, 5);

			expect(ray.checkCollision(circle)).toBe(true);
		});
	});
});
