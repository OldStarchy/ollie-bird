import { describe, expect, test } from 'vitest';
import CircleCollider from './CircleCollider';

describe('CircleCollider', () => {
	test('non-overlapping', () => {
		const circleA = new CircleCollider(0, 0, 5);
		const circleB = new CircleCollider(20, 0, 5);

		expect(circleA.checkCollision(circleB)).toBe(false);
	});

	test('overlapping', () => {
		const circleA = new CircleCollider(0, 0, 10);
		const circleB = new CircleCollider(15, 0, 10);

		expect(circleA.checkCollision(circleB)).toBe(true);
	});

	test('tangential', () => {
		const circleA = new CircleCollider(0, 0, 10);
		const circleB = new CircleCollider(20, 0, 10);

		expect(circleA.checkCollision(circleB)).toBe(true);
	});

	test('one inside another', () => {
		const circleA = new CircleCollider(0, 0, 15);
		const circleB = new CircleCollider(5, 0, 5);

		expect(circleA.checkCollision(circleB)).toBe(true);
	});
});
