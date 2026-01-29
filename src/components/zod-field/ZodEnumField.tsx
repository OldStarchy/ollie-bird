import { useCallback, useEffect, useId, useState } from 'react';
import z from 'zod';
import Select from '../Select';
import type { ZodFieldSharedProps } from './ZodField';

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
