import { Subject } from 'rxjs';

export const SymbolObservable = Symbol('observable');

export type ObservableProperties<
	This,
	Keys extends keyof This = keyof This,
> = keyof This extends Keys
	? {
			[K in Exclude<Keys, typeof SymbolObservable>]?: Subject<This[K]>;
		}
	: {
			[K in Keys]: Subject<This[K]>;
		};
/**
 * Attaches an observable Subject to the decorated accessor or property setter.
 *
 * The Subject is available at `this[SymbolObservable][propertyName]`.
 *
 * eg.:
 *
 * ```ts
 * class Example {
 *   @observable()
 *   public set value(v: number) {
 *     this._value = v;
 *   }
 *
 *   public get value() {
 *     return this._value;
 *   }
 *
 *   private _value: number = 0;
 * }
 *
 * const example = new Example();
 *
 * example[SymbolObservable].value.subscribe((newValue) => {
 *   console.log('Value changed to:', newValue);
 * });
 *
 * example.value = 42; // Console: Value changed to: 42
 * ```
 */
export default function observable<
	This extends {
		[SymbolObservable]?: { [K in keyof This]?: Subject<This[K]> };
	},
	Value,
>() {
	function decorator(
		target: ClassAccessorDecoratorTarget<This, Value>,
		context: ClassAccessorDecoratorContext<This, Value>,
	): void | ClassAccessorDecoratorResult<This, Value>;
	function decorator(
		target: ClassSetterDecoratorTarget<This, Value>,
		context: ClassSetterDecoratorContext<This, Value>,
	): void | ClassSetterDecoratorResult<This, Value>;
	function decorator(
		target:
			| ClassAccessorDecoratorTarget<This, Value>
			| ClassSetterDecoratorTarget<This, Value>,
		context:
			| ClassAccessorDecoratorContext<This, Value>
			| ClassSetterDecoratorContext<This, Value>,
	):
		| void
		| ClassAccessorDecoratorResult<This, Value>
		| ClassSetterDecoratorResult<This, Value>;

	function decorator(
		targetParam:
			| ClassAccessorDecoratorTarget<This, Value>
			| ClassSetterDecoratorTarget<This, Value>,
		context:
			| ClassAccessorDecoratorContext<This, Value>
			| ClassSetterDecoratorContext<This, Value>,
	):
		| void
		| ClassAccessorDecoratorResult<This, Value>
		| ClassSetterDecoratorResult<This, Value> {
		const flags = (context.metadata[SymbolObservable] ??= {}) as Record<
			PropertyKey,
			true | undefined
		>;

		if (flags[context.name]) {
			throw new Error(
				`@observable decorator applied multiple times to the same property: ${String(
					context.name,
				)}`,
			);
		}

		flags[context.name] = true;
		context.addInitializer(function (this: This) {
			const subject = new Subject<Value>();

			const observables = (this[SymbolObservable] ??= {}) as Record<
				PropertyKey,
				Subject<Value>
			>;

			observables[context.name] = subject;
		});

		switch (context.kind) {
			case 'setter': {
				const target = targetParam as ClassSetterDecoratorTarget<
					This,
					Value
				>;

				return <ClassSetterDecoratorResult<This, Value>>(
					function (this, value) {
						target.call(this, value);

						this[SymbolObservable]?.[
							context.name as keyof This
						]?.next(value as This[keyof This]);
					}
				);
			}

			case 'accessor': {
				const target = targetParam as ClassAccessorDecoratorTarget<
					This,
					Value
				>;

				return {
					set(this: This, value: Value) {
						target.set.call(this, value);

						this[SymbolObservable]?.[
							context.name as keyof This
						]?.next(value as This[keyof This]);
					},
				};
			}
		}
	}
	return decorator;
}
