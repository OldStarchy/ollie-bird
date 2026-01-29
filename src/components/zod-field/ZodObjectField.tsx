import z from 'zod';
import ZodField, { type ZodFieldSharedProps } from './ZodField';

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

	const title = schema.meta()?.title;

	return (
		<div>
			{title && <label>{title}</label>}
			<div
				style={{ display: 'flex', flexDirection: 'column', gap: '1em' }}
			>
				{fields.map(([key, zodType]) => (
					<ZodField
						key={key}
						schema={zodType.meta({ title: key, ...zodType.meta() })}
						value={(value as any)[key]}
						onChange={(v) => {
							onChange?.(
								Object.setPrototypeOf(
									{
										[key]: v,
									},
									value,
								) as Partial<z.output<Schema>>,
							);
						}}
						optional={optional}
					/>
				))}
			</div>
		</div>
	);
}
