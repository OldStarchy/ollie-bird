import { describe, expect, test } from 'vitest';
import Serializer from './Serializer';
import { Ok, Result } from './monad/Result';

type TestClassDto = void;
class TestClass {
	constructor() {}
	serialize(): TestClassDto {
		return;
	}
	static deserialize(
		_obj: unknown,
		_context: void,
	): Result<TestClass, string> {
		return Ok(new TestClass());
	}
}

class TestClass2 {
	constructor(public text: string) {}
	serialize() {
		return { text: this.text };
	}
	static deserialize(
		_obj: unknown,
		_context: void,
	): Result<TestClass2, string> {
		throw new Error('Not implemented');
	}
}

describe('Serializer', () => {
	test('constructor', () => {
		// Just test that it can be constructed without throwing
		new Serializer();
	});

	test('serializes type', () => {
		const serializer = new Serializer<typeof TestClass, void>();
		serializer.registerSerializationType('TestClass', TestClass);

		const instance = new TestClass();
		const dto = serializer.serialize(instance);

		expect(dto).toEqual({
			$type: 'TestClass',
			data: undefined,
		});
	});

	test("doesn't deserialize unregistered type", () => {
		const serializer = new Serializer<typeof TestClass, void>();
		serializer.registerSerializationType('TestClass', TestClass);

		const instance = new TestClass2('asdf');
		expect(() => {
			serializer.serialize(instance);
		}).toThrow();
	});

	test('deserializes type', () => {
		const serializer = new Serializer<
			typeof TestClass | typeof TestClass2,
			void
		>();
		serializer.registerSerializationType('TestClass', TestClass);
		serializer.registerSerializationType('TestClass2', TestClass2);

		const dto = {
			$type: 'TestClass',
			data: undefined,
		};

		const result = serializer.deserialize(dto);

		const obj = result.unwrap();
		expect(obj).toBeInstanceOf(TestClass);
	});

	test('deserialization fails with invalid data', () => {
		const serializer = new Serializer<typeof TestClass, void>();
		serializer.registerSerializationType('TestClass', TestClass);

		const dto = {
			$type: 'invalidClass',
			data: { invalid: 'data' },
		};

		const result = serializer.deserialize(dto);

		expect(result.isErr()).toBe(true);
	});

	test('deserialization fails with typed dto structure', () => {
		const serializer = new Serializer<typeof TestClass, void>();
		serializer.registerSerializationType('TestClass', TestClass);

		const dto = {
			invalid: 'structure',
		};

		const result = serializer.deserialize(dto);

		expect(result.isErr()).toBe(true);
	});

	test('registering duplicate key throws', () => {
		const serializer = new Serializer<
			typeof TestClass | typeof TestClass2,
			void
		>();

		serializer.registerSerializationType('TestClass', TestClass);

		expect(() => {
			serializer.registerSerializationType('TestClass', TestClass2);
		}).toThrow();
	});
});
