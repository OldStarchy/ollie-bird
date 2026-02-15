import { beforeEach, describe, expect, test, vi } from 'vitest';
import GameObject from './GameObject';
import type IGame from './IGame';
import Transform2d from './modules/Transform2d';

describe('GameObject', () => {
	let game: IGame;

	beforeEach(() => {
		game = {} as IGame;
	});

	test("constructor doesn't throw", () => {
		new GameObject(game);
	});

	describe('serialization', () => {
		test('serialize', () => {
			const obj = new GameObject(game);
			const dto = obj.serialize();

			expect(dto).toMatchObject({
				version: 1,
				name: 'Game Object',
				layer: 0,
				transform: [0, 0],
				tags: [],
				modules: expect.any(Array),
			});
		});
	});

	describe('deserialization', () => {
		test('deserialize', () => {
			const dto = {
				version: 1,
				name: 'Test Object',
				layer: 2,
				tags: ['test', 'gameobject'],
				transform: [10, 20],
				modules: [],
			};

			const mockGame = {
				spawn: vi.fn(),
			};
			const game = mockGame as unknown as IGame;
			mockGame.spawn.mockImplementation(() => new GameObject(game));

			const obj = GameObject.deserializePartial(dto, {
				game,
			}).unwrap();

			expect(obj.name).toBe('Test Object');
			expect(obj.layer).toBe(2);
			expect(Array.from(obj.tags)).toEqual(['test', 'gameobject']);

			const transform = obj.getModule(Transform2d);
			expect(transform).not.toBeNull();
			if (transform) {
				expect(transform.position.xy).toEqual([10, 20]);
			}
		});

		test('deserialize invalid', () => {
			const dto = {
				version: 1,
				name: 'Test Object',
				layer: 2,
				tags: ['test', 'gameobject'],
				transform: [10, 20],
				modules: [{ $type: 'UnknownModule', data: {} }],
			};

			const mockGame = {
				spawn: vi.fn(),
			};
			const game = mockGame as unknown as IGame;
			mockGame.spawn.mockImplementation(() => new GameObject(game));

			expect(() => {
				GameObject.deserializePartial(dto, {
					game,
				}).unwrap();
			}).toThrowError();
		});
	});
});
