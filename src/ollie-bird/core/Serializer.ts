import z from 'zod';
import { Err, type Result } from './monad/Result';

export interface Serializable {
	/**
	 * Convert this object into a plain JavaScript objec that can be further
	 * serialized to JSON.
	 *
	 * The resulting object must be deserializable by the corresponding
	 * {@link Deserializer<Output, Context>} instance.
	 */
	serialize(): unknown;
}

export const typedDtoSchema = z.object({
	$type: z.string(),
	data: z.unknown().optional(),
});

export type TypedDto = z.input<typeof typedDtoSchema>;
/**
 * Acts as a registry for serializing objects while keeping type information.
 *
 * For example, for `Module[]` (where Module itself is abstract) is serialized
 * as `{ $type: string, data: unknown }`. In order to serialize this, a type key
 * must be registered for each concrete module type. When deserializing, the
 * type key is used to determine which deserializer to use for the data.
 *
 * The {@link Type} parameter is the base class for types that this serializer
 * can serialize.
 *
 * The {@link Context} parameter is the type of the context object that is
 * passed to deserializers when deserializing data. This can be used to provide
 * additional information that is needed for deserialization, such as references
 * to other objects or configuration options.
 */
export default class Serializer<
	Type extends abstract new (...args: any[]) => Serializable,
	Context,
> implements Deserializer<InstanceType<Type>, Context> {
	#typeToKeyMap = new Map<Type, string>();

	#keyToTypeMap = new Map<
		string,
		Deserializer<InstanceType<Type>, Context>
	>();

	/**
	 * {@link key} must be a unique string amongst all types registered in this
	 * serializer. When serializing an object of {@link type}, the resulting DTO
	 * will be tagged with this key.
	 *
	 * When deserializing, this key is used to look up the corresponding
	 * deserializer for the data. This means that that all types that can be
	 * deserialized must be proactively registered before deserializing any
	 * data.
	 *
	 * ## Proactive Registration
	 *
	 * An easy mistake to make is to not pre-emptivley import a module that
	 * is registered in the serializer.
	 *
	 * Eg. if you have a file `ModuleA.ts`
	 *
	 * ```ts
	 * import sharedSerializer from './sharedSerializer.ts';
	 * import {type Serializable} from './Serializer';
	 *
	 * export default class ModuleA implements Serializable {
	 *   constructor(public foo: string) {}
	 *
	 *   serialize() {
	 *     return { foo: this.foo };
	 *   }
	 *
	 *   static deserialize(obj: unknown) {
	 *     // Validation of obj is omitted for brevity.
	 *
	 *     return new ModuleA(obj.foo);
	 *   }
	 *
	 *   static {
	 *     sharedSerializer.registerSerializationType('ModuleA', this);
	 *   }
	 * }
	 * ```
	 *
	 * This module registers itself in the serializer when it is imported.
	 *
	 * You must have `import './ModuleA'` (or `import ModuleA from './ModuleA'`)
	 * execute somewhere in your code before you can deserialize this type.
	 *
	 * ```ts
	 * import sharedSerializer from './sharedSerializer.ts';
	 *
	 * // This triggers ModuleA to register itself in the serializer.
	 * import './ModuleA';
	 *
	 * const module = sharedSerializer.deserialize({
	 * 	$type: 'ModuleA',
	 * 	data: { foo: 'bar' }
	 * }, context);
	 * ```
	 */
	registerSerializationType(
		key: string,
		type: Type & Deserializer<InstanceType<Type>, Context>,
	) {
		if (this.#keyToTypeMap.has(key)) {
			throw new Error(
				`Serialization key "${key}" is already registered.`,
			);
		}
		this.#typeToKeyMap.set(type, key);
		this.#keyToTypeMap.set(key, type);
	}

	/**
	 * Finds the serialization key for a given type. This can be used when
	 * manually creating DTOs that will be deserialized by this serializer.
	 */
	keyFor(type: Type): string {
		const key = this.#typeToKeyMap.get(type);
		if (!key) {
			throw new Error(
				`Type ${type.name} is not registered in the serializer.`,
			);
		}
		return key;
	}

	/**
	 * Serializes the given {@link serializable} object and attach its
	 * serialization key. The resulting object is a {@link TypedDto} that can be
	 * passed to {@link deserialize} to get create an instance matching the
	 * original object.
	 *
	 * The {@link serializable} must be an instance of a class that is
	 * registered in this serializer, otherwise an error is thrown.
	 */
	serialize(serializable: Serializable): TypedDto {
		const type = serializable.constructor as Type;
		const key = this.#typeToKeyMap.get(type);

		if (!key) {
			throw new Error(
				`Type ${type.name} is not registered in the serializer.`,
			);
		}

		return {
			$type: key,
			data: serializable.serialize(),
		};
	}

	/**
	 * Attempts to parse the object as a {@link TypedDto} and find the
	 * corresponding deserializer to deserialize the data.
	 *
	 * If there are any errors during deserialization, an {@link Result.Err} is
	 * returned with a string describing the error.
	 *
	 * @param obj The object to deserialize.
	 * @param context The context to pass to the deserializer. This can be used
	 * to provide additional information that is needed for deserialization,
	 * such as references to other objects or configuration options.
	 */
	deserialize(
		obj: unknown,
		context: Context,
	): Result<InstanceType<Type>, string> {
		const parsed = typedDtoSchema.safeParse(obj);

		if (!parsed.success) {
			return Err(`Invalid data: ${parsed.error.message}`);
		}

		const { $type, data } = parsed.data;

		const deserializer = this.#keyToTypeMap.get($type);
		if (!deserializer) {
			return Err(`Unknown type: ${$type}.`);
		}

		return deserializer.deserialize(data, context);
	}
}

/**
 * An object that can deserialize a plain JavaScript object into an instance of
 * a specific type.
 *
 * The {@link Output} type parameter is the type of the object that this
 * deserializer will output if deserialization is successful.
 *
 * The {@link Context} type parameter is the type of the context object that is
 * passed to the deserializer when deserializing data.
 */
export interface Deserializer<Output, Context> {
	/**
	 * Deserialize the given {@link obj} into an instance of {@link Output}.
	 *
	 * If the deserialization is successful, an {@link Result.Ok} is returned
	 * the deserialized object, otherwise an {@link Result.Err} is returned with
	 * a string describing the error.
	 */
	deserialize(obj: unknown, context: Context): Result<Output, string>;
}

/**
 * A deserializer that can partially deserialize an object, meaning that it can
 * return a partially deserialized object along with any errors that occurred
 * during deserialization.
 *
 * This can be useful in situations where you want to deserialize as much of the
 * object as possible, even if there are some errors, and then handle the errors
 * separately.
 */
export interface PartialDeserializer<Output, Context> {
	deserializePartial(
		obj: unknown,
		context: Context,
	): Result<Output, { result?: Output; errors: string[] }>;
}
