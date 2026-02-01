import { Subject, type Observable } from 'rxjs';
import z from 'zod';
import { ReactInterop } from '../../../react-interop/ReactInterop';
import GameObject from '../GameObject';
import Module from '../Module';

const size2dSchema = z.object({
	width: z.coerce.number().min(0),
	height: z.coerce.number().min(0),
});

export type Size2dView = z.infer<typeof size2dSchema>;

export default class Size2d extends Module implements ReactInterop<Size2dView> {
	accessor width: number;
	accessor height: number;

	readonly [ReactInterop.schema] = size2dSchema;

	#change$ = new Subject<void>();

	constructor(owner: GameObject, width: number = 0, height: number = 0) {
		super(owner);
		this.width = width;
		this.height = height;
	}

	[ReactInterop.get](): Size2dView {
		return {
			width: this.width,
			height: this.height,
		};
	}
	[ReactInterop.set](value: Size2dView): void {
		this.width = value.width;
		this.height = value.height;
		this.#change$.next();
	}
	get [ReactInterop.asObservable](): Observable<void> {
		return this.#change$.asObservable();
	}
}
