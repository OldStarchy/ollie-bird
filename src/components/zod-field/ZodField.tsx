import z from 'zod';
import { ZodBasicField } from './ZodBasicField';
import { ZodEnumField } from './ZodEnumField';
import { ZodObjectField } from './ZodObjectField';

type ZodFieldSupportedTypes =
	| z.ZodString
	| z.ZodNumber
	| z.ZodBoolean
	| z.ZodOptional
	| z.ZodNullable
	| z.ZodDefault
	| z.ZodReadonly
	| z.ZodObject<Record<string, z.ZodType>>
	| z.ZodEnum<Record<string, z.util.EnumValue>>
	| z.ZodType<any>;

type onChange<Schema extends z.ZodType> = (value: z.output<Schema>) => void;

export type ZodFieldSharedProps<Schema extends z.ZodType> = {
	schema: Schema;
	value: z.input<Schema>;

	onChange?: onChange<Schema>;
	optional?: boolean;
};

const ZodField = function ZodField<Schema extends ZodFieldSupportedTypes>({
	schema,
	value,
	onChange,
	optional,
}: ZodFieldSharedProps<Schema>) {
	if (schema instanceof z.ZodObject) {
		return (
			<ZodObjectField
				schema={schema}
				value={value as z.input<typeof schema>}
				onChange={
					onChange as (value: Partial<z.output<Schema>>) => void
				}
				optional={optional}
			/>
		);
	}

	if (schema instanceof z.ZodNumber) {
		return (
			<ZodBasicField
				type="number"
				schema={schema}
				value={value as z.input<typeof schema>}
				onChange={onChange as onChange<typeof schema>}
				optional={optional}
			/>
		);
	}
	if (schema instanceof z.ZodString) {
		return (
			<ZodBasicField
				type="text"
				schema={schema}
				value={value as z.input<typeof schema>}
				onChange={onChange as onChange<typeof schema>}
				optional={optional}
			/>
		);
	}
	if (schema instanceof z.ZodBoolean) {
		return (
			<ZodBasicField
				type="checkbox"
				schema={schema}
				value={value as z.input<typeof schema>}
				onChange={onChange as onChange<typeof schema>}
				optional={optional}
			/>
		);
	}
	if (
		schema instanceof z.ZodOptional ||
		schema instanceof z.ZodNullable ||
		schema instanceof z.ZodDefault
	) {
		const meta = schema.meta();
		const inner = schema.unwrap() as ZodFieldSupportedTypes;
		const innerWithMeta = meta ? inner.meta({ ...meta }) : inner;

		return (
			<ZodField
				schema={innerWithMeta}
				value={value}
				onChange={onChange as onChange<typeof inner>}
				optional={true}
			/>
		);
	}
	if (schema instanceof z.ZodReadonly) {
		const meta = schema.meta();
		const inner = schema.unwrap() as ZodFieldSupportedTypes;
		const innerWithMeta = meta ? inner.meta({ ...meta }) : inner;

		return (
			<ZodField
				schema={innerWithMeta}
				value={value}
				optional={optional}
			/>
		);
	}
	if (schema instanceof z.ZodEnum) {
		return (
			<ZodEnumField
				schema={schema}
				value={value as z.input<typeof schema>}
				onChange={onChange as onChange<typeof schema>}
				optional={optional}
			/>
		);
	}

	return <div>Unsupported schema type: {schema.type}</div>;
};
export default ZodField;
