import type EventSource from './EventSource';
import type GameObject from './GameObject';
import type Keyboard from './Keyboard';
import type Mouse from './Mouse';

declare global {
	interface GameEventMap {}
}

export default interface IGame {
	readonly keyboard: Keyboard;
	readonly mouse: Mouse;
	readonly physics: {
		gravity: number;
	};
	readonly canvas: HTMLCanvasElement;
	readonly event: EventSource<GameEventMap>;

	spawn<Class extends new(game: IGame, ...args: any[]) => GameObject>(type: Class, ...args: Tail<ConstructorParameters<Class>>): InstanceType<Class>;
	destroy(obj: GameObject): void;
	destroySome(cb: (obj: GameObject) => boolean): void;

	findObjectsByTag(tag: string): Array<GameObject>;
	findObjectsByType<T extends (new (game: IGame) => GameObject)[]>(
		...types: T
	): Array<InstanceType<T[number]>>;
	getObjects(): Array<GameObject>;

	restart(): void;

	updatesPerSecond: number;
	readonly secondsPerFrame: number;
}
