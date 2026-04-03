import { Observable } from 'rxjs';

const Skip = Symbol('Skip');

/**
 * A combination of filter and map for RxJS Observables. The provided mapper function
 * can return a value to emit, or the special `filterMap.Skip` symbol to skip emitting
 * for that value.
 *
 * ```ts
 * import { of } from 'rxjs';
 * import filterMap from './filterMap';
 *
 * of(1, 2, 3, 4).pipe(
 *   filterMap(x => x % 2 === 0 ? x * 2 : filterMap.Skip)
 * ).subscribe(console.log); // Logs: 4, 8
 * ```
 */
function filterMap<T, R>(
	mapper: (value: T) => R | typeof Skip,
): (source$: Observable<T>) => Observable<R> {
	return (source$) =>
		new Observable<R>((subscriber) =>
			source$.subscribe({
				next(value) {
					try {
						const result = mapper(value);
						if (result !== Skip) {
							subscriber.next(result);
						}
					} catch (err) {
						subscriber.error(err);
					}
				},
				error(err) {
					subscriber.error(err);
				},
				complete() {
					subscriber.complete();
				},
			}),
		);
}

filterMap.Skip = Skip;

export default filterMap;
