import { TAG_LEVEL_OBJECT } from './const';
import EventSource from './EventSource';
import LevelEditor from './game-object/LevelEditor';
import type GameObject from './GameObject';
import type ICollection from './ICollection';
import type IGame from './IGame';
import Keyboard from './Keyboard';
import Mouse from './Mouse';

class OllieBirdGame implements IGame {
	private abortController: AbortController;

	private context: CanvasRenderingContext2D;
	public readonly keyboard: Keyboard;
	public readonly mouse: Mouse;
	public physics = {
		g: 0.2,
	};

	public objects: InstanceType<typeof OllieBirdGame.GameObjectCollection>;

	readonly event: EventSource<GameEventMap>;

	constructor(public canvas: HTMLCanvasElement) {
		this.abortController = new AbortController();

		const context = canvas.getContext('2d');
		if (!context) {
			throw new Error('Could not get canvas context');
		}
		this.context = context;

		this.objects = new OllieBirdGame.GameObjectCollection();

		canvas.tabIndex = -1;
		canvas.focus();

		this.keyboard = new Keyboard(canvas, this.abortController.signal);
		this.mouse = new Mouse(canvas, this.abortController.signal);
		this.event = new EventSource<GameEventMap>();
	}

	start() {
		this.canvas.width = this.canvas.clientWidth;
		this.canvas.height = this.canvas.clientHeight;

		const int = setInterval(() => this.step(), 1000 / 60);
		this.abortController.signal.addEventListener('abort', () => {
			clearInterval(int);
		});

		this.objects.add(new LevelEditor(this));

		this.restart();
	}

	restart() {
		this.context.fillStyle = 'skyblue';
		this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

		this.objects.removeBy((obj) => obj.tags.has(TAG_LEVEL_OBJECT));
		this.event.emit('gameStart', undefined);
	}

	stop() {
		this.abortController.abort();
	}

	step() {
		this.objects.forEach((go) => go.step());

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
		this.context.fillStyle = '#ABA7A6';
		this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

		const layers = new Map<number, GameObject[]>();

		this.objects.forEach((go) => {
			if (!layers.has(go.layer)) {
				layers.set(go.layer, []);
			}
			layers.get(go.layer)!.push(go);
		});

		const sortedLayers = Array.from(layers.keys()).sort((a, b) => a - b);

		for (const layer of sortedLayers) {
			for (const go of layers.get(layer)!) {
				go.render(this.context);
			}
		}
	}

	private static GameObjectCollection = class
		implements ICollection<GameObject>
	{
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
				if (Symbol.dispose in item) {
					(item as any)[Symbol.dispose]();
				}
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
				if (predicate(this.items[i])) {
					if (Symbol.dispose in this.items[i]) {
						(this.items[i] as any)[Symbol.dispose]();
					}
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
	};
}

export default OllieBirdGame;
