import { useCallback, useEffect, useId, useState } from 'react';
import z from 'zod';
import Input from './Input';
import Select from './Select';

export default function ZodField({
	schema,
	value,
	onChange: doChange,
}: {
	schema: z.ZodType;
	value: any;
	onChange: (v: any) => void;
}) {
	const [enteredValue, setEnteredValue] = useState(value);
	const [warning, setWarning] = useState<string>();
	const id = useId();

	useEffect(() => {
		setEnteredValue(value);
	}, [value]);

	const onChange = useCallback(
		(newValue: unknown) => {
			setEnteredValue(newValue);
			const result = schema.safeParse(newValue);

			if (result.success) {
				doChange(result.data);
				setWarning(undefined);
			} else {
				setWarning(z.prettifyError(result.error));
			}
		},
		[schema, doChange],
	);

	const onBlur = useCallback(() => {
		setEnteredValue(value);
	}, [value]);

	return (
		<div>
			<label htmlFor={id}>{schema.description}</label>
			{(() => {
				if (schema instanceof z.ZodString) {
					return (
						<Input
							id={id}
							type="text"
							value={enteredValue}
							onChange={(e) => onChange(e.target.value)}
							onBlur={onBlur}
						/>
					);
				}

				if (schema instanceof z.ZodNumber) {
					return (
						<Input
							id={id}
							type="number"
							value={enteredValue}
							onChange={(e) => onChange(Number(e.target.value))}
							onBlur={onBlur}
						/>
					);
				}

				if (schema instanceof z.ZodEnum) {
					return (
						<Select
							id={id}
							value={enteredValue}
							onChange={(e) => {
								onChange(e.target.value);
								onBlur();
							}}
						>
							{schema.options.map((option: string | number) => (
								<option key={option} value={option}>
									{option}
								</option>
							))}
						</Select>
					);
				}

				if (schema instanceof z.ZodBoolean) {
					return (
						<Input
							id={id}
							type="checkbox"
							checked={value}
							onChange={(e) => onChange(e.target.checked)}
							onBlur={onBlur}
						/>
					);
				}

				return (
					<pre>
						Unsupported schema type: {schema.constructor.name}
					</pre>
				);
			})()}
			{warning && <label>{warning}</label>}
		</div>
	);
}
