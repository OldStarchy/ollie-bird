import { Subject } from 'rxjs';
import z from 'zod';
import contextCheckpoint from '../../contextCheckpoint';
import htmlColors, { type HtmlColor } from '../../htmlColors';
import onChange from '../../react-interop/onChange';
import { ReactInterop } from '../../react-interop/ReactInterop';
import seconds from '../../unit/time/seconds';
import { CELL_SIZE, TAG_LEVEL_OBJECT } from '../const';
import EventSource from '../EventSource';
import type GameObject from './GameObject';
import type IGame from './IGame';
import Keyboard from './input/Keyboard';
import Mouse from './input/Mouse';
import Rect2 from './math/Rect2';
import { round } from './math/round';
import type { Vec2Like } from './math/Vec2';

const bgColors = ['Custom', ...htmlColors];

const baseGameSettingsSchema = z.object({
	width: z.coerce
		.number()
		.min(CELL_SIZE)
		.multipleOf(CELL_SIZE)
		.meta({ title: 'Width' }),
	height: z.coerce
		.number()
		.min(CELL_SIZE)
		.multipleOf(CELL_SIZE)
		.meta({ title: 'Height' }),
	backgroundColor: z.string().meta({ title: 'Custom Color' }),
	color: z.enum(bgColors).meta({ title: 'Background Color' }),
});

type BaseGameSettings = z.infer<typeof baseGameSettingsSchema>;

class BaseGame implements IGame, ReactInterop<BaseGameSettings> {
	private abortController = new AbortController();
	#gameObjects$ = new Subject<void>();
	readonly gameObjects$ = this.#gameObjects$.asObservable();
	private readonly objects: GameObject[] = [];
	private readonly canvases: Set<GameCanvas> = new Set();

	constructor() {}

	readonly event = new EventSource<GameEventMap>();
	readonly keyboard = new Keyboard();
	readonly mouse = new Mouse();

	updatesPerSecond: number = 60;
	physics = {
		gravity: 0.2,
	};

	renderGizmos: boolean = true;

	#currentSecondsPerFrame: seconds = seconds(1 / this.updatesPerSecond);
	get secondsPerFrame(): seconds {
		return this.#currentSecondsPerFrame;
	}

	#change = new Subject<void>();
	notify(): void {
		this.#change.next();
	}

	[ReactInterop.set](data: BaseGameSettings): void {
		if (Object.hasOwn(data, 'width')) this.width = data.width;
		if (Object.hasOwn(data, 'height')) this.height = data.height;
		if (Object.hasOwn(data, 'color')) this.color = data.color;
		if (Object.hasOwn(data, 'backgroundColor'))
			this.backgroundColor = data.backgroundColor as HtmlColor;

		this.notify();
	}

	[ReactInterop.get](): BaseGameSettings {
		return {
			width: this.width,
			height: this.height,
			backgroundColor: this.backgroundColor,
			color: this.color,
		};
	}

	get [ReactInterop.asObservable]() {
		return this.#change.asObservable();
	}

	get [ReactInterop.schema]() {
		return baseGameSettingsSchema;
	}

	@onChange((self) => self.notify())
	accessor width = round(1920, CELL_SIZE);

	@onChange((self) => self.notify())
	accessor height = round(1080, CELL_SIZE);

	@onChange((self) => self.notify())
	accessor backgroundColor: HtmlColor = 'SkyBlue';

	set color(value: (typeof bgColors)[number]) {
		if (value === 'Custom') {
			this.backgroundColor = '#857';
			return;
		}
		this.backgroundColor = value as HtmlColor;
	}

	get color(): (typeof bgColors)[number] {
		if (!bgColors.includes(this.backgroundColor as any)) {
			return 'Custom';
		}
		return this.backgroundColor as (typeof bgColors)[number];
	}

	addCanvas(canvas: HTMLCanvasElement): GameCanvas {
		const gameCanvas = new GameCanvas(this, canvas);

		this.canvases.add(gameCanvas);

		this.abortController.signal.addEventListener('abort', () => {
			gameCanvas[Symbol.dispose]();
		});

		return gameCanvas;
	}

	start() {
		this.tick();

		this.preStart();

		this.restart();
	}

	protected preStart(): void {}

	restart() {
		this.destroySome((obj) => obj.tags.has(TAG_LEVEL_OBJECT));
		this.event.emit('gameStart', undefined);
	}

	stop() {
		this.abortController.abort();
	}

	tick() {
		if (this.abortController.signal.aborted) return;

		this.step();

		this.#currentSecondsPerFrame = seconds(1 / this.updatesPerSecond);
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
		this.renderQueued = false;

		this.renderAll((context) => {
			context.fillStyle = this.backgroundColor;
			context.fillRect(0, 0, this.width, this.height);

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

			sortedObjects.forEach((go) => go['doBeforeRender'](context));
			sortedObjects.forEach((go) => go['doRender'](context));
			sortedObjects.forEach((go) => go['doAfterRender'](context));

			if (this.renderGizmos) {
				sortedObjects.forEach((go) =>
					go['doBeforeRenderGizmos'](context),
				);
				sortedObjects.forEach((go) => go['doRenderGizmos'](context));
				sortedObjects.forEach((go) =>
					go['doAfterRenderGizmos'](context),
				);
			}

			context.strokeStyle = 'red';
			context.strokeRect(0, 0, this.width, this.height);
		});
	}

	spawn<Constructor extends new (game: IGame, ...args: any[]) => GameObject>(
		type: Constructor,
		...args: Tail<ConstructorParameters<Constructor>>
	): InstanceType<Constructor> {
		const obj = new type(this, ...args) as InstanceType<Constructor>;
		this.objects.push(obj);
		obj['doInitialize']();
		this.#gameObjects$.next();
		return obj;
	}

	destroySome(cb: (obj: GameObject) => boolean): void {
		let some = false;
		for (let i = this.objects.length - 1; i >= 0; i--) {
			const obj = this.objects[i]!;
			if (cb(obj)) {
				some = true;
				this.objects.splice(i, 1);
				obj[Symbol.dispose]();
			}
		}

		if (some) {
			this.#gameObjects$.next();
		}
	}
	destroy(obj: GameObject): void {
		const index = this.objects.indexOf(obj);
		if (index === -1) return;
		this.objects.splice(index, 1);
		obj[Symbol.dispose]();
		this.#gameObjects$.next();
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

	private renderAll(
		worldSpaceRender: (context: CanvasRenderingContext2D) => void,
	) {
		this.canvases.forEach((gameCanvas) => {
			gameCanvas.doRender(worldSpaceRender);
		});
	}
}

export default BaseGame;

export class GameCanvas implements Disposable {
	shouldRefreshSize: { width: number; height: number } | null = null;

	context: CanvasRenderingContext2D;

	readonly disposableStack: DisposableStack;

	constructor(
		public game: BaseGame,
		public canvas: HTMLCanvasElement,
	) {
		using ds = new DisposableStack();

		const context = canvas.getContext('2d');
		if (!context) {
			throw new Error('Could not get canvas context');
		}

		this.context = context;
		this.requestResize();

		ds.use(game.keyboard.attachTo(canvas));
		ds.use(game.mouse.attachTo(canvas, this.projectMouseCoordinates));

		this.disposableStack = ds.move();
	}

	[Symbol.dispose](): void {
		this.disposableStack.dispose();
		this.game['canvases'].delete(this);
	}

	lastTransform = new DOMMatrix();
	private projectMouseCoordinates = (e: MouseEvent): Vec2Like => {
		const rect = this.canvas.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;

		const inverted = this.lastTransform.inverse();
		const transformedPoint = inverted.transformPoint(new DOMPoint(x, y));

		return transformedPoint;
	};

	doRender(
		renderCallback: (context: CanvasRenderingContext2D) => void,
	): void {
		if (this.shouldRefreshSize) {
			this.canvas.width = this.shouldRefreshSize.width;
			this.canvas.height = this.shouldRefreshSize.height;
			this.shouldRefreshSize = null;
		}

		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

		using _ = contextCheckpoint(this.context);

		const box = new Rect2(0, 0, this.game.width, this.game.height);
		const ratio = box.aspectRatio();
		if (
			ratio !== undefined &&
			ratio !== 0 &&
			this.canvas.width !== 0 &&
			this.canvas.height !== 0
		) {
			const canvasRatio = this.canvas.width / this.canvas.height;

			let scale: number;
			if (canvasRatio > ratio) {
				scale = this.canvas.height / box.height;
			} else {
				scale = this.canvas.width / box.width;
			}

			const renderWidth = box.width * scale;
			const renderHeight = box.height * scale;

			const offsetX = (this.canvas.width - renderWidth) / 2;
			const offsetY = (this.canvas.height - renderHeight) / 2;

			this.context.translate(offsetX, offsetY);
			this.context.scale(scale, scale);
		}

		this.lastTransform = this.context.getTransform();
		renderCallback(this.context);
	}

	requestResize() {
		this.shouldRefreshSize = {
			width: this.canvas.clientWidth,
			height: this.canvas.clientHeight,
		};
	}
}
