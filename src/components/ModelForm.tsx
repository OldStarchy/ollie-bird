import { styled } from '@stitches/react';
import { useState } from 'react';
import z from 'zod';

const Input = styled('input', {
	padding: '8px',
	borderRadius: '4px',
	border: '1px solid #ccc',
	width: '100%',
	boxSizing: 'border-box',
	marginTop: '4px',
	marginBottom: '12px',
});

const Checkbox = styled('input', {
	marginLeft: '8px',
	borderRadius: '4px',
	backgroundColor: '#fff',
	border: '1px solid #ccc',
	width: '16px',
	height: '16px',
	cursor: 'pointer',
	'&:checked': {
		backgroundColor: '#0070f3',
		borderColor: '#0070f3',
	},
});

export default function ModelForm<Schema extends z.ZodType>({
	schema,
	value,
	onChange,
}: {
	schema: Schema;
	value: z.infer<Schema>;
	onChange: (value: z.infer<Schema>) => void;
}) {
	if (!(schema instanceof z.ZodObject)) {
		return <div>Unsupported schema type</div>;
	}

	const shape = (schema as z.ZodObject<any>).shape;

	return (
		<form>
			{Object.keys(shape).map((key) => {
				const fieldSchema = shape[key];
				if (fieldSchema instanceof z.ZodString) {
					return (
						<div key={key}>
							<label>{key}</label>
							<Input
								type="text"
								value={value[key] as string}
								onChange={(e) =>
									onChange({
										...value,
										[key]: e.target.value,
									})
								}
							/>
						</div>
					);
				} else if (fieldSchema instanceof z.ZodNumber) {
					return (
						<div key={key}>
							<label>{key}</label>
							<Input
								type="number"
								value={value[key] as number}
								onChange={(e) =>
									onChange({
										...value,
										[key]: Number(e.target.value),
									})
								}
							/>
						</div>
					);
				} else if (fieldSchema instanceof z.ZodBoolean) {
					return (
						<div key={key}>
							<label>{key}</label>
							<Checkbox
								type="checkbox"
								checked={value[key] as boolean}
								onChange={(e) =>
									onChange({
										...value,
										[key]: e.target.checked,
									})
								}
							/>
						</div>
					);
				} else {
					return (
						<div key={key}>
							<label>{key}</label>
							<span>Unsupported field type</span>
						</div>
					);
				}
			})}
		</form>
	);
}

const configurable = Symbol('configurable');

function Configurable<Type>(fieldSchema: z.ZodType<Type>) {
	return function <Class>(
		clazz: { new (...args: any[]): Class } | undefined,
		context: ClassFieldDecoratorContext<Class, Type>,
	) {
		console.log({
			clazz,
			context,
		});
		const schema = (context.metadata[configurable] ??
			z.object({})) as z.ZodObject;

		context.metadata[configurable] = schema.extend({
			[context.name]: fieldSchema,
		});

		// clazz[Symbol.metadata] = context.metadata;

		return function (this: Class, initialValue: Type) {
			return initialValue;
		};
	};
}

function getConfigurableSchema<Class>(clazz: {
	new (...args: any[]): Class;
}): z.ZodType {
	const metadata = (clazz as any)[Symbol.metadata] as Record<
		symbol,
		z.ZodTypeAny
	>;
	return metadata?.[configurable] ?? z.never();
}
class Foo {
	@Configurable(z.string())
	public name: string = 'Default Name';

	@Configurable(z.number().min(0))
	public age: number = 0;

	@Configurable(z.boolean())
	public isStudent: boolean = false;
}

const testSchema = getConfigurableSchema(Foo);

export function TestModelForm() {
	const [data, setData] = useState<any>({
		name: 'Alice',
		age: 30,
		isStudent: false,
	});

	return (
		<ModelForm
			value={data}
			onChange={(newValue) => {
				setData(newValue);
			}}
			schema={testSchema}
		/>
	);
}
