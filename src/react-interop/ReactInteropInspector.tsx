import ZodField from '../components/zod-field/ZodField';
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
