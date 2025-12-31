import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import z from 'zod';
import getPropertiesSchema from '../property/getPropertiesSchema';
import type { NotifyPropertyChanged } from '../property/NotifyPropertyChanged';
import Input from './Input';
import Select from './Select';

export default function PropertiesPanel<T extends NotifyPropertyChanged>({
	model,
}: {
	model: T;
}) {
	const schema = useMemo(
		() =>
			getPropertiesSchema(
				model.constructor as abstract new (...args: any[]) => T,
			),
		[model],
	);
	const [, rerender] = useState({});

	useEffect(() =>
		model.propertyChanged.on('change', () => {
			rerender({});
		}),
	);

	if (schema === null) {
		return <div>No schema for object</div>;
	}

	return (
		<div style={{ display: 'flex', flexDirection: 'column', gap: '1em' }}>
			{Object.entries(schema.shape).map(([key, zodType]) => (
				<ZodField
					key={key}
					schema={zodType}
					value={(model as any)[key]}
					onChange={(v) => {
						(model as any)[key] = v;
					}}
				/>
			))}
		</div>
	);
}

function ZodField({
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
				switch (schema.type) {
					case 'string':
						return (
							<Input
								id={id}
								type="text"
								value={enteredValue}
								onChange={(e) => onChange(e.target.value)}
								onBlur={onBlur}
							/>
						);
					case 'number':
						return (
							<Input
								id={id}
								type="number"
								value={enteredValue}
								onChange={(e) =>
									onChange(Number(e.target.value))
								}
								onBlur={onBlur}
							/>
						);
					case 'enum': {
						const options = Object.entries(
							(schema as z.ZodEnum<any>).def.entries,
						);
						return (
							<Select
								id={id}
								value={enteredValue}
								onChange={(e) => {
									onChange(e.target.value);
									onBlur();
								}}
							>
								{options.map(([k, _v]: [string, unknown]) => (
									<option key={k} value={k}>
										{k}
									</option>
								))}
							</Select>
						);
					}
					case 'boolean':
						return (
							<Input
								id={id}
								type="checkbox"
								checked={value}
								onChange={(e) => onChange(e.target.checked)}
								onBlur={onBlur}
							/>
						);
					default:
						return <pre>Unsupported type: {schema.type}</pre>;
				}
			})()}
			{warning ?? <label>{warning}</label>}
		</div>
	);
}
