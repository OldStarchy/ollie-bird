import z from 'zod';
import type { NotifyPropertyChanged } from './NotifyPropertyChanged';
import PropertiesSchema from './PropertiesSchema';

function configureSchema(
	context: { metadata: DecoratorMetadata },
	cb: (schema: z.ZodObject) => z.ZodObject,
) {
	const schema = context.metadata[PropertiesSchema] ?? z.object({});

	if (!(schema instanceof z.ZodObject)) {
		throw new Error('Invalid schema metadata');
	}

	context.metadata[PropertiesSchema] = cb(schema);
}

export function property<This extends NotifyPropertyChanged, Value>(
	fieldSchema: z.ZodType<Value>,
): ClassAccessorDecorator<This, Value> &
	ClassSetterDecorator<This, Value> &
	ClassGetterDecorator<This, Value> {
	return ((
		targetParam:
			| ClassAccessorDecoratorTarget<This, Value>
			| ((this: This, value: Value) => void),
		context:
			| ClassAccessorDecoratorContext<This, Value>
			| ClassSetterDecoratorContext<This, Value>
			| ClassGetterDecoratorContext<This, Value>,
	) => {
		configureSchema(context, (schema) => {
			if (schema.description === undefined) {
				schema = schema.describe(context.name.toString());
			}

			return schema.extend({
				[context.name]: fieldSchema,
			});
		});

		switch (context.kind) {
			case 'accessor': {
				const target = targetParam as ClassAccessorDecoratorTarget<
					This,
					Value
				>;

				return {
					set(this: This, newValue: Value) {
						target.set.call(this, newValue);

						this.propertyChanged.emit('change', {
							name: context.name.toString(),
							newValue,
						});
					},
				};
			}

			case 'setter': {
				const target = targetParam as (
					this: This,
					value: Value,
				) => void;

				return function (this: This, newValue: Value) {
					target.call(this, newValue);

					this.propertyChanged.emit('change', {
						name: context.name.toString(),
						newValue,
					});
				};
			}

			case 'getter': {
				return;
			}
		}
	}) as ClassAccessorDecorator<This, Value> &
		ClassSetterDecorator<This, Value> &
		ClassGetterDecorator<This, Value>;
}
