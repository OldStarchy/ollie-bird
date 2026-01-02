import { useEffect, useMemo, useState } from 'react';
import getPropertiesSchema from '../property/getPropertiesSchema';
import type { NotifyPropertyChanged } from '../property/NotifyPropertyChanged';
import ZodField from './ZodField';

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
