import { describe, expect, test } from 'vitest';
import type GameObject from '../../GameObject';
import RayCollider2d from './RayCollider2d';

describe('RayCollider2d', () => {
	test('serialize', () => {
		const collider = new RayCollider2d({} as GameObject);
		collider.origin = { x: 1, y: 2 };
		collider.direction = { x: 0.5, y: 0.5 };
		collider.distance = 20;

		const dto = collider.serialize();

		expect(dto).toMatchObject({
			origin: [1, 2],
			direction: [0.5, 0.5],
			distance: 20,
		});
	});

	test('deserialize', () => {
		const obj = {
			origin: [1, 2],
			direction: [0.5, 0.5],
			distance: 20,
		};
		const go = {
			addModule: (ModuleClass: any, ...args: any[]) =>
				new ModuleClass(go, ...args),
		} as GameObject;

		const context = {
			gameObject: go,
		};

		const result = RayCollider2d.deserialize(obj, context);
		const collider = result.unwrap();

		expect(collider.origin.x).toBe(1);
		expect(collider.origin.y).toBe(2);
		expect(collider.direction.x).toBe(0.5);
		expect(collider.direction.y).toBe(0.5);
		expect(collider.distance).toBe(20);
	});
});
