import { TAG_LEVEL_OBJECT } from './const';
import EventSource from './EventSource';
import type GameObject from './GameObject';
import type ICollection from './ICollection';
import type IGame from './IGame';
import Keyboard from './Keyboard';
import Mouse from './Mouse';

abstract class BaseGame implements IGame {
	private abortController: AbortController;

	private context: CanvasRenderingContext2D;
	private readonly objects: InstanceType<
		typeof BaseGame.GameObjectCollection
	>;

	public readonly keyboard: Keyboard;
	public readonly mouse: Mouse;
	public physics = {
		g: 0.2,
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

		this.objects = new BaseGame.GameObjectCollection();

		canvas.tabIndex = -1;
		canvas.focus();

		this.keyboard = new Keyboard(canvas, this.abortController.signal);
		this.mouse = new Mouse(canvas, this.abortController.signal);
		this.event = new EventSource<GameEventMap>();
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

		this.objects.removeBy((obj) => obj.tags.has(TAG_LEVEL_OBJECT));
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

	private static GameObjectCollection = class implements ICollection<GameObject> {
		private items: GameObject[] = [];

		count(): number {
			return this.items.length;
		}
		add(item: GameObject): void {
			if (!this.items.includes(item)) this.items.push(item);
		}
		remove(item: GameObject): boolean {
			const index = this.items.indexOf(item);
			if (index >= 0) {
				this.items.splice(index, 1);
				return true;
			}
			return false;
		}
		contains(item: GameObject): boolean {
			return this.items.includes(item);
		}

		removeBy(predicate: (item: GameObject) => boolean): number {
			let removed = 0;
			for (let i = this.items.length - 1; i >= 0; i--) {
				const item = this.items[i]!;
				if (predicate(item)) {
					item[Symbol.dispose]();
					this.items.splice(i, 1);
					removed++;
				}
			}
			return removed;
		}

		[Symbol.iterator](): Iterator<GameObject, void, void> {
			return this.items[Symbol.iterator]();
		}

		forEach(callback: (item: GameObject) => void): void {
			const snapshot = [...this.items];
			for (const item of snapshot) {
				callback(item);
			}
		}

		find(predicate: (item: GameObject) => boolean): GameObject | undefined {
			return this.items.find(predicate);
		}

		filter(predicate: (item: GameObject) => boolean): Array<GameObject>;
		filter<U extends GameObject>(
			predicate: (item: GameObject) => item is U,
		): Array<U>;
		filter(predicate: (item: GameObject) => boolean): Array<GameObject> {
			return this.items.filter(predicate);
		}
	};

	spawn<T extends GameObject>(type: new (game: IGame) => T): T {
		const obj = new type(this);
		this.objects.add(obj);
		obj['doInitialize']();
		return obj;
	}

	destroy<T extends GameObject>(obj: T): void {
		this.objects.remove(obj);
		obj[Symbol.dispose]();
	}

	findObjectsByTag(tag: string): Array<GameObject> {
		return this.objects.filter((obj) => obj.tags.has(tag)) ?? [];
	}

	findObjectsByType<T extends GameObject>(
		type: new (game: IGame) => T,
	): Array<T> {
		return (
			this.objects.filter<T>((obj): obj is T => obj instanceof type) ?? []
		);
	}

	getObjects(): Array<GameObject> {
		return Array.from(this.objects);
	}
}

export default BaseGame;
