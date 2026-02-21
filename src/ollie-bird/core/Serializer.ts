import z from 'zod';
import { Err, type Result } from './monad/Result';

export interface Serializable {
	serialize(): unknown;
}
export const typedDtoSchema = z.object({
	$type: z.string(),
	data: z.unknown().optional(),
});

export type TypedDto = z.input<typeof typedDtoSchema>;

export default class Serializer<
	Type extends abstract new (...args: any[]) => unknown,
	Context,
> {
	#typeToKeyMap = new Map<Type, string>();

	#keyToTypeMap = new Map<
		string,
		Deserializer<InstanceType<Type>, Context>
	>();

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

	keyFor(type: Type): string {
		const key = this.#typeToKeyMap.get(type);
		if (!key) {
			throw new Error(
				`Type ${type.name} is not registered in the serializer.`,
			);
		}
		return key;
	}

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

export interface Deserializer<Output, Context> {
	deserialize(obj: unknown, context: Context): Result<Output, string>;
}

export interface PartialDeserializer<Output, Context> {
	deserializePartial(
		obj: unknown,
		context: Context,
	): Result<Output, { result?: Output; errors: string[] }>;
}
