import { Subject } from 'rxjs';
import z from 'zod';
import onChange from '../../react-interop/onChange';
import { ReactInterop } from '../../react-interop/ReactInterop';
import { vec2Schema } from '../math/Vec2';
import Transform2d from '../modules/Transform2d';
import type IGame from './IGame';
import Module, { ModuleCollection, type IModular } from './IModular';

export const gameObjectViewSchema = z.object({
	name: z.string().meta({ title: 'Name' }),
	position: vec2Schema.meta({ title: 'Position' }),
});

export type GameObjectView = z.infer<typeof gameObjectViewSchema>;

export default class GameObject
	implements IModular, Disposable, ReactInterop<GameObjectView>
{
	private destructors: (() => void)[] = [];
	private modules: ModuleCollection;

	layer: number = 0;
	tags: Set<string | symbol> = new Set();

	readonly transform: Transform2d;
	readonly id: string = Math.random().toString(16).slice(2);

	#change$ = new Subject<void>();
	readonly change$ = this.#change$.asObservable();

	private notify(): void {
		this.#change$.next();
	}

	@onChange((self) => self.notify())
	accessor name: string = 'Game Object';

	constructor(readonly game: IGame) {
		this.modules = new ModuleCollection(this);
		this.destructors.push(() => this.modules[Symbol.dispose]());

		this.transform = this.addModule(Transform2d);
	}

	getModules<T extends Module>(
		type: abstract new (owner: GameObject) => T,
	): IteratorObject<T> {
		return this.modules.getModules(type);
	}
	getModule<T extends Module>(
		type: abstract new (owner: GameObject) => T,
	): T | null {
		return this.modules.getModule(type);
	}
	addModule<
		Constructor extends new (owner: GameObject, ...args: any[]) => Module,
	>(
		type: Constructor,
		...args: Tail<ConstructorParameters<Constructor>>
	): InstanceType<Constructor> {
		return this.modules.addModule(type, ...args);
	}
	removeModule(module: Module): void {
		return this.modules.removeModule(module);
	}

	// @ts-expect-error
	private doInitialize() {
		this.initialize();
		this.modules['initialize']();
	}
	protected initialize(): void {}

	// @ts-expect-error
	private doBeforeUpdate(): void {
		this.beforeUpdate();
		this.modules['beforeUpdate']();
	}
	protected beforeUpdate(): void {}

	// @ts-expect-error
	private doUpdate(): void {
		this.update();
		this.modules['update']();
	}
	protected update(): void {}

	// @ts-expect-error
	private doAfterUpdate(): void {
		this.afterUpdate();
		this.modules['afterUpdate']();
	}
	protected afterUpdate(): void {}

	// @ts-expect-error
	private doBeforeRender(context: CanvasRenderingContext2D): void {
		this.beforeRender(context);
		this.modules['beforeRender'](context);
	}
	protected beforeRender(_context: CanvasRenderingContext2D): void {}

	// @ts-expect-error
	private doRender(context: CanvasRenderingContext2D): void {
		this.render(context);
		this.modules['render'](context);
	}
	protected render(_context: CanvasRenderingContext2D): void {}

	// @ts-expect-error
	private doAfterRender(context: CanvasRenderingContext2D): void {
		this.afterRender(context);
		this.modules['afterRender'](context);
	}
	protected afterRender(_context: CanvasRenderingContext2D): void {}

	// @ts-expect-error
	private doBeforeRenderGizmos(context: CanvasRenderingContext2D): void {
		this.beforeRenderGizmos(context);
		this.modules['beforeRenderGizmos'](context);
	}
	protected beforeRenderGizmos(_context: CanvasRenderingContext2D): void {}

	// @ts-expect-error
	private doRenderGizmos(context: CanvasRenderingContext2D): void {
		this.renderGizmos(context);
		this.modules['renderGizmos'](context);
	}
	protected renderGizmos(_context: CanvasRenderingContext2D): void {}

	// @ts-expect-error
	private doAfterRenderGizmos(context: CanvasRenderingContext2D): void {
		this.afterRenderGizmos(context);
		this.modules['afterRenderGizmos'](context);
	}
	protected afterRenderGizmos(_context: CanvasRenderingContext2D): void {}

	onGameEvent<T extends keyof GameEventMap>(
		event: T,
		listener: (args: GameEventMap[T]) => void,
	) {
		const unsub = this.game.event.on(event, listener);
		this.destructors.push(unsub);
	}

	#destory$ = new Subject<void>();
	public destroy$ = this.#destory$.asObservable();
	[Symbol.dispose]() {
		this.#destory$.next();
		for (const unsub of this.destructors) {
			unsub();
		}
	}

	destroy() {
		this.game.destroy(this);
	}

	[ReactInterop.get](): GameObjectView {
		return {
			name: this.name,
			position: this.transform.position[ReactInterop.get](),
		};
	}

	[ReactInterop.set](view: GameObjectView): void {
		if (Object.hasOwn(view, 'name')) this.name = view.name;
		if (Object.hasOwn(view, 'position'))
			this.transform.position[ReactInterop.set](view.position);

		this.notify();
	}

	readonly [ReactInterop.schema] = gameObjectViewSchema;
	readonly [ReactInterop.asObservable] = this.change$;
}
