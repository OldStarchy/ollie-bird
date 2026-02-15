import { describe, expect, test } from 'vitest';
import type GameObject from '../GameObject';
import Size2d from './Size2d';

describe('Size2d', () => {
	test('serialize', () => {
		const transform = new Size2d({} as GameObject);

		const dto = transform.serialize();

		expect(dto).toEqual([0, 0]);
	});

	test('deserialize', () => {
		const obj = [0, 0];
		const go = {
			addModule: (ModuleClass: any, ...args: any[]) =>
				new ModuleClass(go, ...args),
		} as GameObject;

		const context = {
			gameObject: go,
		};

		const result = Size2d.deserialize(obj, context);
		const module = result.unwrap();

		expect(module.width).toBe(0);
		expect(module.height).toBe(0);
	});
});
