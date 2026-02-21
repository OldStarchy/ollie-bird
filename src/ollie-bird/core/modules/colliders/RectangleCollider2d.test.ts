import { describe, expect, test } from 'vitest';
import type GameObject from '../../GameObject';
import RectangleCollider2d from './RectangleCollider2d';

describe('RectangleCollider2d', () => {
	test('serialize', () => {
		const collider = new RectangleCollider2d({} as GameObject);
		collider.setRect({
			x: 10,
			y: 20,
			width: 30,
			height: 40,
		});

		const dto = collider.serialize();

		expect(dto).toMatchObject({
			rect: [10, 20, 30, 40],
		});
	});

	test('deserialize', () => {
		const obj = { rect: [10, 20, 30, 40] };
		const go = {
			addModule: (ModuleClass: any, ...args: any[]) =>
				new ModuleClass(go, ...args),
		} as GameObject;

		const context = {
			gameObject: go,
		};

		const result = RectangleCollider2d.deserialize(obj, context);
		const collider = result.unwrap();

		expect(collider.x).toBe(10);
		expect(collider.y).toBe(20);
		expect(collider.width).toBe(30);
		expect(collider.height).toBe(40);
	});
});
