import { Subject, type Observable } from 'rxjs';
import z from 'zod';
import { ReactInterop } from '../../../react-interop/ReactInterop';
import GameObject from '../GameObject';
import Module from '../Module';
import type { Serializable } from '../Serializer';
import { Err, Ok, Result } from '../monad/Result';

const size2dSchema = z.object({
	width: z.coerce.number().min(0),
	height: z.coerce.number().min(0),
});

export type Size2dView = z.infer<typeof size2dSchema>;

const size2dDtoSchema = z.tuple([z.number().min(0), z.number().min(0)]);
type Size2dDto = z.infer<typeof size2dDtoSchema>;

export default class Size2d
	extends Module
	implements ReactInterop<Size2dView>, Serializable
{
	static readonly displayName = 'Size2d';

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

	override serialize(): Size2dDto {
		return [this.width, this.height];
	}

	static deserialize(
		obj: unknown,
		context: { gameObject: GameObject },
	): Result<Size2d, string> {
		const parsed = size2dDtoSchema.safeParse(obj);

		if (!parsed.success) {
			return Err(`Invalid Size2d data: ${parsed.error.message}`);
		}

		const [width, height] = parsed.data;

		return Ok(context.gameObject.addModule(Size2d, width, height));
	}

	static {
		Module.serializer.registerSerializationType('Size2d', this);
	}
}
