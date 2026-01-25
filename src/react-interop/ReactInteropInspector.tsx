import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import z from 'zod';
import Input from '../components/Input';
import Select from '../components/Select';
import { ReactInterop, useReactInterop } from './ReactInterop';

export function ReactInteropInspector<View>({
	model,
}: {
	model: ReactInterop<View>;
}) {
	const [data, schema] = useReactInterop(model);

	return (
		<ZodField
			schema={schema}
			value={data}
			onChange={(v) => {
				model[ReactInterop.set](v);
			}}
		/>
	);
}

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

type ZodFieldSharedProps<Schema extends z.ZodType> = {
	schema: Schema;
	value: z.input<Schema>;

	onChange?: onChange<Schema>;
	optional?: boolean;
};

export const ZodField = function ZodField<
	Schema extends ZodFieldSupportedTypes,
>({ schema, value, onChange, optional }: ZodFieldSharedProps<Schema>) {
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
				type="string"
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
				type="boolean"
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

export function ZodObjectField<const Schema extends z.ZodObject>({
	schema,
	value,
	onChange,
	optional,
}: {
	onChange: (value: Partial<z.output<Schema>>) => void;
} & ZodFieldSharedProps<Schema>) {
	const fields = Object.entries(
		schema.shape as Record<PropertyKey, z.ZodType>,
	);

	return (
		<div style={{ display: 'flex', flexDirection: 'column', gap: '1em' }}>
			{fields.map(([key, zodType]) => (
				<ZodField
					key={key}
					schema={zodType}
					value={(value as any)[key]}
					onChange={
						onChange
							? (v) => {
									onChange(
										Object.setPrototypeOf(
											{
												[key]: v,
											},
											value,
										) as Partial<z.output<Schema>>,
									);
								}
							: undefined
					}
					optional={optional}
				/>
			))}
		</div>
	);
}

export function ZodEnumField<Schema extends z.ZodEnum>({
	schema,
	value,
	onChange,
	optional: _todo,
}: ZodFieldSharedProps<Schema>) {
	const id = useId();
	const meta = schema.meta();

	const [enteredValue, setEnteredValue] = useState(value);
	const [warning, setWarning] = useState<string>();

	useEffect(() => {
		setEnteredValue(value);
	}, [value]);

	const onChange_ = useCallback(
		(newValue: z.input<Schema>) => {
			if (!onChange) return;

			setEnteredValue(newValue);
			const result = schema.safeParse(newValue);

			if (result.success) {
				onChange(result.data);
				setWarning(undefined);
			} else {
				setWarning(z.prettifyError(result.error));
			}
		},
		[schema, onChange],
	);

	const onBlur = useCallback(() => {
		setEnteredValue(value);
	}, [value]);

	const labelMap = new Map(
		Object.entries(schema.enum).map(([k, v]) => [v, k] as const),
	);
	const options = schema.options;

	return (
		<div>
			{meta?.title && <label htmlFor={id}>{meta.title}</label>}
			<Select
				value={enteredValue}
				id={id}
				onChange={(e) => {
					if (options.includes(e.target.value as any))
						onChange_?.(e.target.value as z.input<Schema>);
				}}
				onBlur={onBlur}
			>
				{options.map((option: string | number) => (
					<option key={option} value={option}>
						{labelMap.get(option)}
					</option>
				))}
			</Select>
			{warning && <label>{warning}</label>}
		</div>
	);
}

type ZodBasicFieldSupportedTypes = z.ZodString | z.ZodNumber | z.ZodBoolean;
export function ZodBasicField<Type extends number | string | boolean>({
	type,
	schema,
	value,
	onChange,
	optional: _todo,
}: {
	// prettier-ignore
	type: Type extends number ? 'number'
		: Type extends string ? 'string'
		: Type extends boolean ? 'boolean'
	: never;
} & ZodFieldSharedProps<ZodBasicFieldSupportedTypes>) {
	const id = useId();
	const meta = schema.meta();

	const [enteredValue, setEnteredValue] = useState<string | number | boolean>(
		value,
	);
	const [warning, setWarning] = useState<string>();

	useEffect(() => {
		setEnteredValue(value);
	}, [value]);

	const onChange_ = useCallback(
		(newValue: string | number | boolean) => {
			if (!onChange) return;

			setEnteredValue(newValue);
			const result = schema.safeParse(newValue);

			if (result.success) {
				onChange(result.data);
				setWarning(undefined);
			} else {
				setWarning(z.prettifyError(result.error));
			}
		},
		[schema, onChange],
	);

	const onBlur = useCallback(() => {
		setEnteredValue(value);
	}, [value]);

	const step = useMemo(() => {
		if (schema instanceof z.ZodNumber) {
			const checks = schema._def.checks ?? [];
			const stepCheck = checks.find(
				(c) => c._zod.def.check === 'multiple_of',
			);
			if (stepCheck) {
				return (stepCheck as any)._zod.def.value as number;
			}
		}
	}, [schema]);

	return (
		<div>
			{meta?.title && <label htmlFor={id}>{meta.title}</label>}
			<Input
				type={type}
				value={
					type !== 'boolean'
						? (enteredValue as string | number)
						: undefined
				}
				id={id}
				checked={
					type === 'boolean' ? (enteredValue as boolean) : undefined
				}
				onChange={
					onChange
						? (e) =>
								onChange_(
									type === 'boolean'
										? e.target.checked
										: e.target.value,
								)
						: undefined
				}
				onBlur={onBlur}
				step={step}
			/>
			{warning && <label>{warning}</label>}
		</div>
	);
}
