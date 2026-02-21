import { describe, expect, test } from 'vitest';
import type GameObject from '../GameObject';
import Transform2d from './Transform2d';

describe('Transform2d', () => {
	test('serialize', () => {
		const transform = new Transform2d({} as GameObject);

		const dto = transform.serialize();

		expect(dto).toEqual([0, 0]);
	});

	test('deserialize', () => {
		const obj = [0, 0];
		const go: any = {};
		go.transform = new Transform2d(go as GameObject);

		const context = {
			gameObject: go as GameObject,
		};

		const result = Transform2d.deserialize(obj, context);

		expect(result.isOk()).toBe(true);
		expect(context.gameObject.transform.position.xy).toEqual([0, 0]);
	});
});
