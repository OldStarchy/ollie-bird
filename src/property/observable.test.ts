import { describe, expect, test, vi } from 'vitest';
import observable, {
	SymbolObservable,
	type ObservableProperties,
} from './observable';

describe('@observable', () => {
	test('applies observable behavior to a property', () => {
		class Example {
			declare [SymbolObservable]: ObservableProperties<Example, 'value'>;

			@observable()
			public set value(v: number) {
				this._value = v;
			}

			public get value() {
				return this._value;
			}

			private _value: number = 0;
		}

		const example = new Example();
		const fn = vi.fn();

		example[SymbolObservable].value.subscribe(fn);

		example.value = 42; // Console: Value changed to: 42

		expect(fn).toHaveBeenCalledExactlyOnceWith(42);
	});

	test('applies observable behavior to accessor', () => {
		class Example {
			declare [SymbolObservable]: ObservableProperties<Example, 'value'>;

			@observable()
			accessor value = 0;
		}

		const example = new Example();
		const fn = vi.fn();

		example[SymbolObservable].value.subscribe(fn);

		example.value = 100;

		expect(fn).toHaveBeenCalledExactlyOnceWith(100);
	});

	test('throws if applied multiple times to the same property', () => {
		expect(() => {
			class Example {
				declare [SymbolObservable]: ObservableProperties<
					Example,
					'value'
				>;

				@observable()
				@observable()
				public set value(v: number) {
					this._value = v;
				}

				public get value() {
					return this._value;
				}

				private _value: number = 0;
			}

			return new Example();
		}).toThrowError(
			'@observable decorator applied multiple times to the same property: value',
		);
	});

	test('applies observable behavior to multiple properties', () => {
		class Example {
			declare [SymbolObservable]: ObservableProperties<
				Example,
				'value' | 'name'
			>;

			@observable()
			accessor value = 0;

			@observable()
			accessor name = 'initial';
		}

		const example = new Example();
		const fnValue = vi.fn();
		const fnName = vi.fn();

		example[SymbolObservable].value.subscribe(fnValue);
		example[SymbolObservable].name.subscribe(fnName);

		example.value = 10;
		example.name = 'changed';

		expect(fnValue).toHaveBeenCalledExactlyOnceWith(10);
		expect(fnName).toHaveBeenCalledExactlyOnceWith('changed');
	});
});
