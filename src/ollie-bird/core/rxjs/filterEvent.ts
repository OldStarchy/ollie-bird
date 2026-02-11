import { Observable } from 'rxjs';
import filterMap from './filterMap';

function filterEvent<
	T extends { type: PropertyKey; data?: any },
	E extends T['type'],
>(
	eventName: E,
): (source$: Observable<T>) => Observable<(T & { type: E })['data']> {
	return filterMap((e) => (e.type === eventName ? e.data : filterMap.Skip));
}

export default filterEvent;
