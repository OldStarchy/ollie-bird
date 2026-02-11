import { Observable } from 'rxjs';

const Skip = Symbol('Skip');

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
