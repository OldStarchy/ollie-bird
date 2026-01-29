import { useEffect, useState } from 'react';
import { Observable } from 'rxjs';
import type z from 'zod';

const set = Symbol('ReactInterop.set');
const get = Symbol('ReactInterop.get');
const asObservable = Symbol('ReactInterop.asObservable');
const schema = Symbol('ReactInterop.schema');

/**
 * Provider and consumer of plain data objects primarily used for react forms.
 */
export interface ReactInterop<View> {
	/**
	 * Modifies this object to match the provided data. This is called by the
	 * ReactInteropInspector when the user modifies form values.
	 */
	[set](data: View): void;

	/**
	 * Creates a plain data object representing the current state. This is used
	 * to seed the values used in react forms in the ReactInteropInspector.
	 */
	[get](): View;

	/**
	 * An observable that emits whenever the data changes. This is used to
	 * trigger react form updates.
	 */
	readonly [asObservable]: Observable<void>;

	/**
	 * A zod schema describing the shape of the data. This is used to generate
	 * the ReactInteropInspector form and to validate user input.
	 */
	readonly [schema]: z.ZodType<View>;
}

export const ReactInterop = {
	set,
	get,
	asObservable,
	schema,
} as const;

export function useReactInterop<View>(
	obj: ReactInterop<View>,
): [View, z.ZodSchema<View>] {
	const [state, setState] = useState<View>(obj[get]());

	useEffect(() => {
		const subscription = obj[asObservable].subscribe(() =>
			setState(obj[get]()),
		);

		return () => {
			subscription.unsubscribe();
		};
	}, [obj]);

	return [state, obj[schema]];
}
