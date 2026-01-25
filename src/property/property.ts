import type { Subject } from 'rxjs';
import z from 'zod';
import PropertiesSchema from './PropertiesSchema';
import observable, { SymbolObservable } from './observable';

function configureSchema(
	context: { metadata: DecoratorMetadata },
	configure: (schema: z.ZodObject) => z.ZodObject,
) {
	const schema = context.metadata[PropertiesSchema] ?? z.object({});

	if (!(schema instanceof z.ZodObject)) {
		throw new Error('Invalid schema metadata');
	}

	context.metadata[PropertiesSchema] = configure(schema);
}

export function property<
	This extends {
		[SymbolObservable]?: { [K in keyof This]?: Subject<This[K]> };
	},
	Value,
>(fieldSchema: z.ZodType<Value>) {
	function decorator(
		targetParam: ClassAccessorDecoratorTarget<This, Value>,
		context: ClassAccessorDecoratorContext<This, Value>,
	): void | ClassAccessorDecoratorResult<This, Value>;
	function decorator(
		targetParam: ClassSetterDecoratorTarget<This, Value>,
		context: ClassSetterDecoratorContext<This, Value>,
	): void | ClassSetterDecoratorResult<This, Value>;
	function decorator(
		targetParam: ClassGetterDecoratorTarget<This, Value>,
		context: ClassGetterDecoratorContext<This, Value>,
	): void | ClassGetterDecoratorResult<This, Value>;
	function decorator(
		targetParam:
			| ClassAccessorDecoratorTarget<This, Value>
			| ClassSetterDecoratorTarget<This, Value>
			| ClassGetterDecoratorTarget<This, Value>,
		context:
			| ClassAccessorDecoratorContext<This, Value>
			| ClassSetterDecoratorContext<This, Value>
			| ClassGetterDecoratorContext<This, Value>,
	):
		| void
		| ClassAccessorDecoratorResult<This, Value>
		| ClassSetterDecoratorResult<This, Value>
		| ClassGetterDecoratorResult<This, Value>;

	function decorator(
		targetParam:
			| ClassAccessorDecoratorTarget<This, Value>
			| ClassSetterDecoratorTarget<This, Value>
			| ClassGetterDecoratorTarget<This, Value>,
		context:
			| ClassAccessorDecoratorContext<This, Value>
			| ClassSetterDecoratorContext<This, Value>
			| ClassGetterDecoratorContext<This, Value>,
	) {
		configureSchema(context, (schema) => {
			if (fieldSchema.meta()?.title === undefined) {
				fieldSchema = fieldSchema.meta({
					...fieldSchema.meta(),
					title: context.name.toString(),
				});
			}

			return schema.extend({
				[context.name]: fieldSchema,
			});
		});

		switch (context.kind) {
			case 'accessor':
			case 'setter':
				return observable<This, Value>()(targetParam, context);

			case 'getter': {
				return;
			}
		}
	}

	return decorator;
}
