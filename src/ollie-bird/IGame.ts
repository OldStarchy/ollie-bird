import type EventSource from './EventSource';
import type GameObject from './GameObject';
import type ICollection from './ICollection';
import type Keyboard from './Keyboard';
import type Mouse from './Mouse';

declare global {
	interface GameEventMap { }
}

export default interface IGame {
	readonly keyboard: Keyboard;
	readonly mouse: Mouse;
	readonly physics: {
		g: number;
	};
	readonly objects: ICollection<GameObject>;
	readonly canvas: HTMLCanvasElement;
	readonly event: EventSource<GameEventMap>;


	restart(): void;
}
