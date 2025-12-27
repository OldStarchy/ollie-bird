import { TAG_LEVEL_OBJECT } from './const';
import EventSource from './EventSource';
import type GameObject from './GameObject';
import type IGame from './IGame';
import Keyboard from './Keyboard';
import Mouse from './Mouse';

abstract class BaseGame implements IGame {
	private abortController: AbortController;

	private context: CanvasRenderingContext2D;
	private readonly objects: GameObject[];
	private shouldRefreshSize: boolean = true;

	public readonly keyboard: Keyboard;
	public readonly mouse: Mouse;
	public physics = {
		gravity: 0.2,
	};
	public renderGizmos: boolean = true;

	readonly event: EventSource<GameEventMap>;

	public updatesPerSecond: number = 60;

	#currentSecondsPerFrame: number = 1 / this.updatesPerSecond;
	public get secondsPerFrame(): number {
		return this.#currentSecondsPerFrame;
	}

	constructor(public canvas: HTMLCanvasElement) {
		this.abortController = new AbortController();

		const context = canvas.getContext('2d');
		if (!context) {
			throw new Error('Could not get canvas context');
		}
		this.context = context;

		this.objects = [];
		this.keyboard = new Keyboard(canvas, this.abortController.signal);
		this.mouse = new Mouse(canvas, this.abortController.signal);
		this.event = new EventSource<GameEventMap>();

		this.initCanvas();
	}

	private initCanvas() {
		this.canvas.tabIndex = -1;
		this.canvas.focus();

		globalThis.addEventListener(
			'resize',
			() => {
				this.shouldRefreshSize = true;
			},
			this.abortController,
		);
	}

	private refreshCanvasViewport(): void {
		this.canvas.style.width = '100vw';
		this.canvas.style.height = '100vh';
		this.canvas.width = this.canvas.clientWidth;
		this.canvas.height = this.canvas.clientHeight;
		this.canvas.style.width = `${this.canvas.clientWidth}px`;
		this.canvas.style.height = `${this.canvas.clientHeight}px`;

		this.shouldRefreshSize = false;
	}

	start() {
		this.canvas.width = this.canvas.clientWidth;
		this.canvas.height = this.canvas.clientHeight;

		this.tick();

		this.preStart();

		this.restart();
	}

	protected preStart(): void {}

	public backgroundColor: string = 'skyblue';

	restart() {
		this.context.fillStyle = this.backgroundColor;
		this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

		this.destroySome((obj) => obj.tags.has(TAG_LEVEL_OBJECT));
		this.event.emit('gameStart', undefined);
	}

	stop() {
		this.abortController.abort();
	}

	tick() {
		if (this.abortController.signal.aborted) return;

		this.step();

		this.#currentSecondsPerFrame = 1 / this.updatesPerSecond;
		setTimeout(() => this.tick(), 1000 / this.updatesPerSecond);
	}
	step() {
		this.objects.forEach((go) => go['doBeforeUpdate']());
		this.objects.forEach((go) => go['doUpdate']());
		this.objects.forEach((go) => go['doAfterUpdate']());

		this.keyboard.step();
		this.mouse.step();
		this.queueRender();
	}

	private renderQueued: boolean = false;
	queueRender() {
		if (this.renderQueued) return;
		this.renderQueued = true;
		requestAnimationFrame(() => this.render());
	}

	render() {
		if (this.shouldRefreshSize) {
			this.refreshCanvasViewport();
		}

		this.renderQueued = false;
		this.context.fillStyle = this.backgroundColor;
		this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

		const layers = new Map<number, GameObject[]>();

		this.objects.forEach((go) => {
			if (!layers.has(go.layer)) {
				layers.set(go.layer, []);
			}
			layers.get(go.layer)!.push(go);
		});

		const sortedObjects = Array.from(layers.keys())
			.sort((a, b) => a - b)
			.flatMap((layer) => layers.get(layer) ?? []);

		sortedObjects.forEach((go) => go['doBeforeRender'](this.context));
		sortedObjects.forEach((go) => go['doRender'](this.context));
		sortedObjects.forEach((go) => go['doAfterRender'](this.context));

		if (this.renderGizmos) {
			sortedObjects.forEach((go) =>
				go['doBeforeRenderGizmos'](this.context),
			);
			sortedObjects.forEach((go) => go['doRenderGizmos'](this.context));
			sortedObjects.forEach((go) =>
				go['doAfterRenderGizmos'](this.context),
			);
		}
	}

	spawn<Constructor extends new (game: IGame, ...args: any[]) => GameObject>(
		type: Constructor,
		...args: Tail<ConstructorParameters<Constructor>>
	): InstanceType<Constructor> {
		const obj = new type(this, ...args) as InstanceType<Constructor>;
		this.objects.push(obj);
		obj['doInitialize']();
		return obj;
	}

	destroySome(cb: (obj: GameObject) => boolean): void {
		for (let i = this.objects.length - 1; i >= 0; i--) {
			const obj = this.objects[i]!;
			if (cb(obj)) {
				this.objects.splice(i, 1);
				obj[Symbol.dispose]();
			}
		}
	}
	destroy(obj: GameObject): void {
		const index = this.objects.indexOf(obj);
		if (index !== -1) {
			this.objects.splice(index, 1);
		}
		obj[Symbol.dispose]();
	}

	findObjectsByTag(tag: string): Array<GameObject> {
		return this.objects.filter((obj) => obj.tags.has(tag));
	}

	findObjectsByType<T extends (new (game: IGame) => GameObject)[]>(
		...types: T
	): Array<InstanceType<T[number]>> {
		return this.objects.filter<InstanceType<T[number]>>(
			(obj): obj is InstanceType<T[number]> =>
				types.some((type) => obj instanceof type),
		);
	}

	getObjects(): Array<GameObject> {
		return Array.from(this.objects);
	}
}

export default BaseGame;
