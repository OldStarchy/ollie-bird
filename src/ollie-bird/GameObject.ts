import type IGame from './IGame';

export default abstract class GameObject {
	public static readonly LAYER_DEFAULT = 0;
	public static readonly LAYER_BACKGROUND = -100;
	public static readonly LAYER_ENEMYS = 10;
	public static readonly LAYER_PLAYER = 20;
	public static readonly LAYER_FOREGROUND = 100;

	layer: number = 0;

	private destructors: (() => void)[] = [];

	tags: Set<string> = new Set();

	constructor(protected game: IGame) {}

	step(): void {}
	render(context: CanvasRenderingContext2D): void {}

	onGameEvent<T extends keyof GameEventMap>(
		event: T,
		listener: (args: GameEventMap[T]) => void,
	) {
		const unsub = this.game.event.on(event, listener);
		this.destructors.push(unsub);
	}

	[Symbol.dispose]() {
		for (const unsub of this.destructors) {
			unsub();
		}
	}

	destroy() {
		this.game.objects.remove(this);
		this[Symbol.dispose]();
	}
}
