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
		g: number;
	};
	readonly canvas: HTMLCanvasElement;
	readonly event: EventSource<GameEventMap>;

	spawn<T extends GameObject>(type: new (game: IGame) => T): T;
	destroy<T extends GameObject>(obj: T): void;
	findObjectsByTag(tag: string): Array<GameObject>;
	findObjectsByType<T extends GameObject>(
		type: new (game: IGame) => T,
	): Array<T>;
	getObjects(): Array<GameObject>;

	restart(): void;

	updatesPerSecond: number;
	readonly secondsPerFrame: number;
}
