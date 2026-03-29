import { engine } from 'animejs';
import { firstValueFrom, skip, Subject } from 'rxjs';
import z from 'zod';
import contextCheckpoint from '../../contextCheckpoint';
import htmlColors, { type HtmlColor } from '../../htmlColors';
import onChange from '../../react-interop/onChange';
import { ReactInterop } from '../../react-interop/ReactInterop';
import seconds from '../../unit/time/seconds';
import { CELL_SIZE } from '../const';
import GameObject, { type GameObjectDto } from './GameObject';
import type IGame from './IGame';
import Input from './input/Input';
import Rect2 from './math/Rect2';
import { round } from './math/round';
import type { Vec2Like } from './math/Vec2';
import type Module from './Module';

// Eager-load all the modules so that they're registered in the serializer and available for spawning prefabs
import.meta.glob('./modules/**/*.ts', { eager: true });

// animejs animations are controlled by the engine.update() call in step()
engine.useDefaultMainLoop = false;

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

/**
 * BaseGame implements the core game loop, rendering, and object management.
 *
 * The most basic setup for a game is to create a BaseGame (or derivative),
 * add a canvas for rendering, and spawn some objects with some modules.
 *
 * ```ts
 * const game = new BaseGame();
 * const canvas = document.getElementById('game') as HTMLCanvasElement;
 * game.addCanvas(canvas);
 *
 * const player = game.spawn();
 *
 * player.addModule(class extends Module {
 *   protected override update() {
 *     if (this.input.keyboard.getButton('ArrowRight').isPressed)
 *       this.transform.position.x += 5;
 *
 *     if (this.input.keyboard.getButton('ArrowLeft').isPressed)
 * 	     this.transform.position.x -= 5;
 *   }
 *
 *   protected override render(context: CanvasRenderingContext2D) {
 *     context.fillStyle = 'red';
 *     context.fillRect(this.transform.position.x, this.transform.position.y, 50, 50);
 *   }
 * });
 *
 * game.start();
 * ```
 */
class BaseGame implements IGame, ReactInterop<BaseGameSettings> {
	readonly #abortController = new AbortController();
	readonly #gameObjects$ = new Subject<void>();
	readonly gameObjects$ = this.#gameObjects$.asObservable();
	readonly #objects: GameObject[] = [];
	#objectsToDestroy: GameObject[] = [];
	#objectsToCreate: GameObject[] = [];
	private readonly canvases: Set<GameCanvas> = new Set();

	/**
	 * Access to the various input methods for the game, such as keyboard, mouse, and gamepad.
	 */
	readonly input = new Input();

	constructor() {
		this.#abortController.signal.addEventListener('abort', () => {
			this.input[Symbol.dispose]();
			this.#objects.forEach((obj) => obj[Symbol.dispose]());
		});
	}

	/**
	 * The target number of times {@link step} is called per second.
	 *
	 * {@link step} calls both {@link Module.update} and {@link Module.render}.
	 *
	 * Note that the time between calls to {@link step} is handled by
	 * {@link setTimeout}.
	 */
	updatesPerSecond: number = 60;

	/**
	 * A simple shared data object for physics settings. Modules may choose to
	 * use or modify this object as necessary.
	 */
	physics = {
		gravity: 0.2,
	};

	/**
	 * Whether to call {@link Module.renderGizmos} each step.
	 */
	renderGizmos: boolean = true;

	#currentSecondsPerFrame: seconds = seconds(1 / this.updatesPerSecond);
	/**
	 * The time since the last call to {@link step}.
	 *
	 * Changes to {@link updatesPerSecond} will be reflected in this value on
	 * the next tick.
	 */
	get secondsPerFrame(): seconds {
		return this.#currentSecondsPerFrame;
	}

	#change = new Subject<void>();
	private notify(): void {
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

	/**
	 * The width of the game world.
	 */
	@onChange((self) => self.notify())
	accessor width = round(1920, CELL_SIZE);

	/**
	 * The height of the game world.
	 */
	@onChange((self) => self.notify())
	accessor height = round(1080, CELL_SIZE);

	/**
	 * The background color of the game world.
	 *
	 * Either a named html color ({@link HtmlColor}) or a custom hex code.
	 */
	@onChange((self) => self.notify())
	accessor backgroundColor: HtmlColor = 'SkyBlue';

	/**
	 * A convenience property for {@link backgroundColor} used by the GUI to
	 * show a drop-down list of colors.
	 */
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

	/**
	 * Begins rendering this game to the given canvas.
	 *
	 * The render function is called for each canvas on each tick.
	 */
	addCanvas(canvas: HTMLCanvasElement): GameCanvas {
		const gameCanvas = new GameCanvas(this, canvas);

		this.canvases.add(gameCanvas);

		this.#abortController.signal.addEventListener('abort', () => {
			gameCanvas[Symbol.dispose]();
		});

		return gameCanvas;
	}

	/**
	 * Starts the game loop, which repeatedly calls {@link step} at a rate
	 * determined by {@link updatesPerSecond}.
	 *
	 * The game loop can be stopped by calling {@link stop}.
	 */
	start() {
		this.preStart();

		this.tick();
	}

	protected preStart(): void {}

	/**
	 * Stops the game loop, and disposes of this BaseGame instance.
	 */
	stop() {
		this.#abortController.abort();
	}

	private tick() {
		if (this.#abortController.signal.aborted) return;

		const cspf = seconds(1 / this.updatesPerSecond);
		setTimeout(() => {
			this.#currentSecondsPerFrame = cspf;
			this.tick();
		}, 1000 / this.updatesPerSecond);

		this.step();
	}

	#tick$ = new Subject<void>();
	tick$ = this.#tick$.asObservable();
	/**
	 * Advances the game by one frame.
	 *
	 * First, {@link tick$} is triggered. Then for each object
	 * * {@link Module.beforeUpdate}
	 * * {@link Module.update}
	 * * {@link Module.afterUpdate}
	 * are called in sequence.
	 *
	 * Then, any objects queued for destruction are destroyed, and any objects queued for creation are created and
	 * initialized.
	 *
	 * After this {@link input.step} is called to update all game input states
	 * (e.g. calculating pressed vs. held buttons).
	 *
	 * Finally rendering is queued for the next animation frame.
	 *
	 * Rendering iterates over all objects (in {@link GameObject.layer | layer}\
	 * order) multiple times, once for each of the following methods for every
	 * {@link GameCanvas} (see {@link addCanvas}):
	 * * {@link Module.beforeRender}
	 * * {@link Module.render}
	 * * {@link Module.afterRender}
	 * * if {@link renderGizmos} is true, also calls
	 *   * {@link Module.beforeRenderGizmos}
	 *   * {@link Module.renderGizmos}
	 *   * {@link Module.afterRenderGizmos}
	 */
	step() {
		this.#tick$.next();

		engine.update();
		this.#objects.forEach((go) => go.beforeUpdate());
		this.#objects.forEach((go) => go.update());
		this.#objects.forEach((go) => go.afterUpdate());

		this.input.step();
		this.queueRender();

		this.destroyQueuedObjects();
		this.createQueuedObjects();
	}

	/**
	 * Returns a promise that resolves after the given number of frames have
	 * passed, as defined by {@link tick$}.
	 */
	waitFrames(frames: number): Promise<void> {
		return firstValueFrom(this.tick$.pipe(skip(frames)));
	}

	private renderQueued: boolean = false;
	private queueRender() {
		if (this.renderQueued) return;
		this.renderQueued = true;
		requestAnimationFrame(() => this.render());
	}

	private render() {
		this.renderQueued = false;

		this.renderAll((context) => {
			context.fillStyle = this.backgroundColor;
			context.fillRect(0, 0, this.width, this.height);

			const layers = new Map<number, GameObject[]>();

			this.#objects.forEach((go) => {
				if (!layers.has(go.layer)) {
					layers.set(go.layer, []);
				}
				layers.get(go.layer)!.push(go);
			});

			const sortedObjects = Array.from(layers.keys())
				.sort((a, b) => a - b)
				.flatMap((layer) => layers.get(layer) ?? []);

			sortedObjects.forEach((go) => go.beforeRender(context));
			sortedObjects.forEach((go) => go.render(context));
			sortedObjects.forEach((go) => go.afterRender(context));

			if (this.renderGizmos) {
				sortedObjects.forEach((go) => go.beforeRenderGizmos(context));
				sortedObjects.forEach((go) => go.renderGizmos(context));
				sortedObjects.forEach((go) => go.afterRenderGizmos(context));
			}

			context.strokeStyle = 'red';
			context.strokeRect(0, 0, this.width, this.height);
		});
	}

	/**
	 * Creates a new {@link GameObject} and queues it for initialization at the
	 * end of the current update cycle.
	 *
	 * The new GameObject is returned immediately, but will not appear in
	 * {@link getObjects} until the next tick.
	 */
	spawn(): GameObject {
		const obj = new GameObject(this);
		this.#objectsToCreate.push(obj);

		return obj;
	}

	/**
	 * Similar to {@link spawn}, but creates a new {@link GameObject} from the
	 * given prefab data.
	 *
	 * Prefabs are serialized GameObjects per {@link GameObject.serialize} and
	 * {@link Module.serialize}.
	 *
	 * ## Note
	 * Code around this functionality is likely to change as work on Resources
	 * and Assets progresses.
	 */
	spawnPrefab(prefab: GameObjectDto): GameObject {
		return GameObject.deserializePartial(prefab, { game: this })
			.inspectErr((err) => {
				console.error('Failed to spawn prefab', err.errors);
			})
			.unwrap();
	}

	/**
	 * Queues the given {@link GameObject} for destruction at the end of the
	 * current update cycle (after {@link Module.afterUpdate | afterUpdate} but
	 * before {@link Module.beforeRender | beforeRender}).
	 */
	destroy(obj: GameObject): void {
		if (!this.#objects.includes(obj)) return;
		const index = this.#objects.indexOf(obj);
		if (index === -1) return;
		this.#objectsToDestroy.push(obj);
	}

	private createQueuedObjects() {
		if (this.#objectsToCreate.length === 0) return;

		const newObjects = this.#objectsToCreate;
		this.#objectsToCreate = [];

		this.#objects.push(...newObjects);
		newObjects.forEach((obj) => obj.initialize());

		this.#gameObjects$.next();
	}
	private destroyQueuedObjects() {
		const some = this.#objectsToDestroy.length > 0;
		this.#objectsToDestroy.forEach((obj) => {
			const index = this.#objects.indexOf(obj);
			if (index !== -1) {
				this.#objects.splice(index, 1);
				obj[Symbol.dispose]();
			}
		});

		this.#objectsToDestroy = [];
		if (some) this.#gameObjects$.next();
	}

	/**
	 * Returns an iterator of all {@link GameObject}s with the given tag.
	 *
	 * ## Note
	 * Iterators are lazy, so be sure to collect the results before
	 * the next tick (i.e. with {@link IteratorObject.toArray | .toArray()}).
	 */
	findObjectsByTag(tag: string): IteratorObject<GameObject> {
		return this.#objects
			[Symbol.iterator]()
			.filter((obj) => obj.tags.has(tag));
	}

	/**
	 * Returns an iterator of all Modules of the given type in all GameObjects.
	 *
	 * The {@link type} parameter should be the class of the Module, not an
	 * instance or name.
	 *
	 * ```ts
	 * const colliders: CircleCollider2d[] = game.findModulesByType(CircleCollider2d).toArray();
	 * ```
	 *
	 * ## Note
	 * Iterators are lazy, so be sure to collect the results before
	 * the next tick (i.e. with {@link IteratorObject.toArray | .toArray()}).
	 */
	findModulesByType<T extends Module>(
		type: abstract new (owner: GameObject) => T,
	): IteratorObject<T> {
		return this.#objects
			[Symbol.iterator]()
			.flatMap((obj) => obj.getModulesByType(type));
	}

	/**
	 * Returns the first Module of the given type in any GameObject, or null if
	 * none is found.
	 *
	 * The {@link type} parameter should be the class of the Module, not an
	 * instance or name.
	 *
	 * ## Note
	 * Iterators are lazy, so be sure to collect the results before
	 * the next tick (i.e. with {@link IteratorObject.toArray | .toArray()}).
	 */
	findModuleByType<T extends Module>(
		type: abstract new (owner: GameObject) => T,
	): T | null {
		const first = this.findModulesByType(type).next();
		if (first.done) {
			return null;
		}
		return first.value;
	}

	/**
	 * Returns an iterator of all {@link GameObject}s in this game.
	 *
	 * ## Note
	 * Iterators are lazy, so be sure to collect the results before
	 * the next tick (i.e. with {@link IteratorObject.toArray | .toArray()}).
	 */
	getObjects(): IteratorObject<GameObject> {
		return this.#objects[Symbol.iterator]();
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

/**
 * An interactive render target for a {@link BaseGame}.
 *
 * Creating a GameCanvas with {@link BaseGame.addCanvas} will set up event
 * listeners to handle keyboard input, and mouse/touch input events on the given
 * canvas element.
 *
 * Mouse and touch input coordinates are transformed into world space.
 *
 * ## Note
 * Code around this is likely to change once Camera and viewport functionality
 * is implemented.
 */
export class GameCanvas implements Disposable {
	shouldRefreshSize: { width: number; height: number } | null = null;

	context: CanvasRenderingContext2D;

	readonly disposableStack: DisposableStack;

	/**
	 * Do not use this directly, instead use {@link BaseGame.addCanvas} to
	 * create a GameCanvas.
	 *
	 * @internal
	 */
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

		ds.use(game.input.keyboard.attachTo(canvas));
		ds.use(game.input.mouse.attachTo(canvas, this.projectMouseCoordinates));

		this.disposableStack = ds.move();
	}

	/**
	 * Detaches this GameCanvas from its BaseGame, removing it from the game's
	 * render loop and disposing of all event listeners.
	 *
	 * The canvas element itself is not removed or modified in any way.
	 */
	[Symbol.dispose](): void {
		this.disposableStack.dispose();
		this.game['canvases'].delete(this);
	}

	/**
	 * This contains the transform used in the most recent call to
	 * {@link doRender}. It is used to transform input coordinates from screen
	 * space to world space.
	 */
	lastTransform = new DOMMatrix();
	private projectMouseCoordinates = (e: MouseEvent): Vec2Like => {
		const rect = this.canvas.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;

		const inverted = this.lastTransform.inverse();
		const transformedPoint = inverted.transformPoint(new DOMPoint(x, y));

		return transformedPoint;
	};

	/**
	 * Sets up scaling and translation to fit the game world within the canvas,
	 * then calls {@link renderCallback} with the canvas context.
	 *
	 * This is used by {@link BaseGame} to render the game objects to this
	 * canvas each tick.
	 *
	 * @internal
	 */
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

	/**
	 * Requests that the canvas rendering context be resized to match the real
	 * size of the canvas element.
	 *
	 * This should be called whenever the canvas element is resized (e.g. on
	 * window resize) to ensure the rendering context matches the size of the
	 * canvas and avoid scaling issues.
	 *
	 * @see [GameCanvas.tsx](../../components/GameCanvas.tsx)
	 */
	requestResize() {
		this.shouldRefreshSize = {
			width: this.canvas.clientWidth,
			height: this.canvas.clientHeight,
		};
	}
}
