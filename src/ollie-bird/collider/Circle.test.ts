import { describe, expect, test } from 'vitest';
import Circle from './Circle';

describe('Circle', () => {
	test('non-overlapping', () => {
		const circleA = new Circle(0, 0, 5);
		const circleB = new Circle(20, 0, 5);

		expect(circleA.checkCollision(circleB)).toBe(false);
	});

	test('overlapping', () => {
		const circleA = new Circle(0, 0, 10);
		const circleB = new Circle(15, 0, 10);

		expect(circleA.checkCollision(circleB)).toBe(true);
	});

	test('tangential', () => {
		const circleA = new Circle(0, 0, 10);
		const circleB = new Circle(20, 0, 10);

		expect(circleA.checkCollision(circleB)).toBe(true);
	});

	test('one inside another', () => {
		const circleA = new Circle(0, 0, 15);
		const circleB = new Circle(5, 0, 5);

		expect(circleA.checkCollision(circleB)).toBe(true);
	});
});
