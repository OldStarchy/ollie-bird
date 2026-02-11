import type { Observable } from 'rxjs';
import type { EventMap } from './EventMap';
import type GameObject from './GameObject';
import type Input from './input/Input';

declare global {
	interface GameEventMap {}
}

export type GameEvent = EventMap<GameEventMap>;

export default interface IGame {
	readonly input: Input;
	readonly physics: {
		gravity: number;
	};
	readonly event$: Observable<GameEvent>;

	width: number;
	height: number;
	backgroundColor: string;

	updatesPerSecond: number;
	readonly secondsPerFrame: seconds;

	spawn<Class extends new (game: IGame, ...args: any[]) => GameObject>(
		type: Class,
		...args: Tail<ConstructorParameters<Class>>
	): InstanceType<Class>;
	destroy(obj: GameObject): void;
	destroySome(cb: (obj: GameObject) => boolean): void;

	findObjectsByTag(tag: string): Array<GameObject>;
	findObjectsByType<T extends (new (game: IGame) => GameObject)[]>(
		...types: T
	): Array<InstanceType<T[number]>>;
	getObjects(): Array<GameObject>;
}
