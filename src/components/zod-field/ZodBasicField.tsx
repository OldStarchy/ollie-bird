import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import z from 'zod';
import Input from '../Input';
import type { ZodFieldSharedProps } from './ZodField';

export type ZodBasicFieldSupportedTypes =
	| z.ZodString
	| z.ZodNumber
	| z.ZodBoolean;
export function ZodBasicField<Type extends number | string | boolean>({
	type,
	schema,
	value,
	onChange,
	optional: _todo,
}: {
	// prettier-ignore
	type: Type extends number ? 'number' : Type extends string ? 'string' : Type extends boolean ? 'boolean' : never;
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
