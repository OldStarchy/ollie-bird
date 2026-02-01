import { beforeEach, describe, expect, test, vi } from 'vitest';
import GameObject from './core/GameObject';
import type IGame from './core/IGame';
import LevelStore from './LevelStore';

describe('LevelStore', () => {
	// Create a mock game object for testing
	const mockGame = {
		keyboard: {},
		mouse: {},
		physics: { g: 9.8 },
		canvas: document.createElement('canvas'),
		event: {
			on: vi.fn(),
			emit: vi.fn(),
		},
		spawn: vi.fn(),
		destroy: vi.fn(),
		findObjectsByTag: vi.fn(),
		findObjectsByType: vi.fn(),
		getObjects: vi.fn(),
		restart: vi.fn(),
		updatesPerSecond: 60,
		secondsPerFrame: 1 / 60,
	} as unknown as IGame;

	// Create a mock serializable class for testing
	class MockSerializable extends GameObject {
		value: number = 0;

		serialize() {
			return {
				$type: 'MockSerializable',
				value: this.value,
			};
		}

		static spawnDeserialize(game: IGame, data: unknown) {
			if (
				typeof data === 'object' &&
				data !== null &&
				'value' in data &&
				typeof data.value === 'number'
			) {
				const obj = new MockSerializable(game);
				obj.value = data.value;
				return obj;
			}
			return null;
		}
	}

	beforeEach(() => {
		LevelStore.instance = new LevelStore();
	});

	test('should register a type', () => {
		LevelStore.instance.register('MockSerializable', MockSerializable);
		expect(LevelStore.instance.has('MockSerializable')).toBe(true);
	});

	test('should get a registered type', () => {
		LevelStore.instance.register('MockSerializable', MockSerializable);
		const retrieved = LevelStore.instance.get('MockSerializable');
		expect(retrieved).toBe(MockSerializable);
	});

	test('should return undefined for unregistered type', () => {
		const retrieved = LevelStore.instance.get('NonExistentType');
		expect(retrieved).toBeUndefined();
	});

	test('should list all registered types', () => {
		LevelStore.instance.register('Type1', MockSerializable);
		LevelStore.instance.register('Type2', MockSerializable);
		const types = LevelStore.instance.getRegisteredTypes();
		expect(types).toContain('Type1');
		expect(types).toContain('Type2');
	});

	test('should serialize and deserialize an object', () => {
		LevelStore.instance.register('MockSerializable', MockSerializable);

		// Create and serialize
		const original = new MockSerializable(mockGame);
		original.value = 42;
		const serialized = original.serialize();

		expect(serialized).toEqual({
			$type: 'MockSerializable',
			value: 42,
		});

		// Deserialize
		const Class = LevelStore.instance.get('MockSerializable');
		expect(Class).toBeDefined();
		const deserialized = Class!.spawnDeserialize(mockGame, serialized);

		expect(deserialized).not.toBeNull();
		expect(deserialized).toBeInstanceOf(MockSerializable);
		expect((deserialized as MockSerializable).value).toBe(42);
	});

	test('should handle invalid deserialization data', () => {
		LevelStore.instance.register('MockSerializable', MockSerializable);

		const invalidData = {
			$type: 'MockSerializable',
			value: 'not a number',
		};
		const Class = LevelStore.instance.get('MockSerializable');
		const result = Class!.spawnDeserialize(mockGame, invalidData);

		expect(result).toBeNull();
	});

	test('should throw when registering a duplicate type', () => {
		LevelStore.instance.register('MockSerializable', MockSerializable);

		expect(() => {
			LevelStore.instance.register('MockSerializable', MockSerializable);
		}).toThrow();
	});
});
