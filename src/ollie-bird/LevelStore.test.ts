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
		// Clear any existing registrations - we can't unregister,
		// so we just re-register fresh for each test
	});

	test('should register a type', () => {
		LevelStore.register('MockSerializable', MockSerializable);
		expect(LevelStore.has('MockSerializable')).toBe(true);
	});

	test('should get a registered type', () => {
		LevelStore.register('MockSerializable', MockSerializable);
		const retrieved = LevelStore.get('MockSerializable');
		expect(retrieved).toBe(MockSerializable);
	});

	test('should return undefined for unregistered type', () => {
		const retrieved = LevelStore.get('NonExistentType');
		expect(retrieved).toBeUndefined();
	});

	test('should list all registered types', () => {
		LevelStore.register('Type1', MockSerializable);
		LevelStore.register('Type2', MockSerializable);
		const types = LevelStore.getRegisteredTypes();
		expect(types).toContain('Type1');
		expect(types).toContain('Type2');
	});

	test('should serialize and deserialize an object', () => {
		LevelStore.register('MockSerializable', MockSerializable);

		// Create and serialize
		const original = new MockSerializable(mockGame);
		original.value = 42;
		const serialized = original.serialize();

		expect(serialized).toEqual({
			$type: 'MockSerializable',
			value: 42,
		});

		// Deserialize
		const Class = LevelStore.get('MockSerializable');
		expect(Class).toBeDefined();
		const deserialized = Class!.spawnDeserialize(mockGame, serialized);

		expect(deserialized).not.toBeNull();
		expect(deserialized).toBeInstanceOf(MockSerializable);
		expect((deserialized as MockSerializable).value).toBe(42);
	});

	test('should handle invalid deserialization data', () => {
		LevelStore.register('MockSerializable', MockSerializable);

		const invalidData = {
			$type: 'MockSerializable',
			value: 'not a number',
		};
		const Class = LevelStore.get('MockSerializable');
		const result = Class!.spawnDeserialize(mockGame, invalidData);

		expect(result).toBeNull();
	});

	test('should warn when overwriting a registration', () => {
		const consoleSpy = vi
			.spyOn(console, 'warn')
			.mockImplementation(() => {});

		LevelStore.register('MockSerializable', MockSerializable);
		LevelStore.register('MockSerializable', MockSerializable);

		expect(consoleSpy).toHaveBeenCalledWith(
			expect.stringContaining('already registered'),
		);

		consoleSpy.mockRestore();
	});
});
