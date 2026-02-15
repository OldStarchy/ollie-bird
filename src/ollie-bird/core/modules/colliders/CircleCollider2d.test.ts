import { describe, expect, test } from 'vitest';
import type GameObject from '../../GameObject';
import CircleCollider2d from './CircleCollider2d';

describe('CircleCollider2d', () => {
	test('serialize', () => {
		const collider = new CircleCollider2d({} as GameObject);
		collider.center = { x: 5, y: 10 };
		collider.radius = 15;

		const dto = collider.serialize();

		expect(dto).toMatchObject({
			center: [5, 10],
			radius: 15,
		});
	});

	test('deserialize', () => {
		const obj = {
			center: [5, 10],
			radius: 15,
		};
		const go = {
			addModule: (ModuleClass: any, ...args: any[]) =>
				new ModuleClass(go, ...args),
		} as GameObject;

		const context = {
			gameObject: go,
		};

		const result = CircleCollider2d.deserialize(obj, context);
		const collider = result.unwrap();

		expect(collider.center.x).toBe(5);
		expect(collider.center.y).toBe(10);
		expect(collider.radius).toBe(15);
	});
});
