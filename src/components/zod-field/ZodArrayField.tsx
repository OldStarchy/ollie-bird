import z from 'zod';
import type { ZodFieldSharedProps } from './ZodField';
import ZodField from './ZodField';

export function ZodArrayField<Schema extends z.ZodArray>({
	schema,
	value,
	onChange,
	optional,
}: {
	onChange: (value: Partial<z.output<Schema>>) => void;
} & ZodFieldSharedProps<Schema>) {
	const title = schema.meta()?.title;
	const itemSchema = schema.unwrap() as z.ZodType;

	return (
		<div>
			{title && <label>{title}</label>}
			<div
				style={{ display: 'flex', flexDirection: 'column', gap: '1em' }}
			>
				{(value as unknown[]).map((itemValue, index) => (
					<div key={index} style={{ display: 'flex', gap: '0.5em' }}>
						<ZodField
							schema={itemSchema}
							value={itemValue}
							onChange={(v) => {
								const r = value.slice();
								r[index] = v;
								onChange?.(r as Partial<z.output<Schema>>);
							}}
							optional={optional}
						/>
						<button
							type="button"
							onClick={() => {
								const r = value.slice();
								r.splice(index, 1);
								onChange?.(r as Partial<z.output<Schema>>);
							}}
						>
							Remove
						</button>
					</div>
				))}
				<button
					type="button"
					onClick={() => {
						const defaultValueResult =
							itemSchema.safeParse(undefined);
						if (defaultValueResult.success) {
							const r = value.slice();
							r.push(defaultValueResult.data);
							onChange?.(r as Partial<z.output<Schema>>);
						} else {
							console.warn(
								'Failed to add item to array: no default value and schema does not allow undefined',
							);
						}
					}}
				>
					Add Item
				</button>
			</div>
		</div>
	);
}
