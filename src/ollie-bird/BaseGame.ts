import z from 'zod';
import ContextSave from '../ContextSave';
import { property } from '../property/property';
import { CELL_SIZE, TAG_LEVEL_OBJECT } from './const';
import EventSource from './EventSource';
import type GameObject from './GameObject';
import type IGame from './IGame';
import Keyboard from './Keyboard';
import Rect2 from './math/Rect2';
import Mouse from './Mouse';
import type { Vec2Like } from './Vec2';

const bgColors = [
	'skyblue',
	'black',
	'white',
	'lightgray',
	'gray',
	'darkgray',
] as const;

abstract class BaseGame implements IGame {
	private abortController: AbortController;

	private readonly objects: GameObject[];

	public readonly keyboard: Keyboard;
	public readonly mouse: Mouse;
	public physics = {
		gravity: 0.2,
		width: 1920,
		height: 1080,
	};
	public renderGizmos: boolean = true;

	readonly event: EventSource<GameEventMap>;

	public updatesPerSecond: number = 60;

	#currentSecondsPerFrame: number = 1 / this.updatesPerSecond;
	public get secondsPerFrame(): number {
		return this.#currentSecondsPerFrame;
	}

	@property(z.number().min(CELL_SIZE).describe('Width'))
	set width(value: number) {
		this.physics.width = value;
	}
	get width(): number {
		return this.physics.width;
	}

	@property(z.number().min(CELL_SIZE).describe('Height'))
	set height(value: number) {
		this.physics.height = value;
	}
	get height(): number {
		return this.physics.height;
	}

	constructor() {
		this.abortController = new AbortController();

		this.objects = [];
		this.keyboard = new Keyboard();
		this.mouse = new Mouse();
		this.event = new EventSource<GameEventMap>();
	}

	private canvases: Set<GameCanvas> = new Set();

	readonly propertyChanged = new EventSource<{
		change: { name: PropertyKey; newValue: any };
	}>();

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

	@property(z.enum(bgColors).describe('Background Color'))
	accessor backgroundColor: (typeof bgColors)[number] = 'skyblue';

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
		this.renderQueued = false;

		this.renderAll((context) => {
			context.fillStyle = this.backgroundColor;
			context.fillRect(0, 0, this.physics.width, this.physics.height);

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
			context.strokeRect(0, 0, this.physics.width, this.physics.height);
		});
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

	readonly abort: AbortController;

	constructor(
		public game: BaseGame,
		public canvas: HTMLCanvasElement,
	) {
		this.abort = new AbortController();

		const context = canvas.getContext('2d');
		if (!context) {
			throw new Error('Could not get canvas context');
		}

		this.context = context;
		this.requestResize();

		game.keyboard.attachTo(canvas, this.abort.signal);
		game.mouse.attachTo(canvas, this.abort.signal, (e) =>
			this.projectMouseCoordinates(e),
		);
	}

	[Symbol.dispose](): void {
		this.abort.abort();
		this.game['canvases'].delete(this);
	}

	lastTransform: DOMMatrix = new DOMMatrix();
	private projectMouseCoordinates(e: MouseEvent): Vec2Like {
		const rect = this.canvas.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;

		const inverted = this.lastTransform.inverse();
		const transformedPoint = inverted.transformPoint(new DOMPoint(x, y));

		return transformedPoint;
	}

	doRender(
		renderCallback: (context: CanvasRenderingContext2D) => void,
	): void {
		if (this.shouldRefreshSize) {
			this.canvas.width = this.shouldRefreshSize.width;
			this.canvas.height = this.shouldRefreshSize.height;
			this.shouldRefreshSize = null;
		}

		using _ = new ContextSave(this.context);

		const box = new Rect2(
			0,
			0,
			this.game.physics.width,
			this.game.physics.height,
		);
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

			this.lastTransform = this.context.getTransform();
		}
		renderCallback(this.context);
	}

	requestResize() {
		this.shouldRefreshSize = {
			width: this.canvas.clientWidth,
			height: this.canvas.clientHeight,
		};
	}
}
