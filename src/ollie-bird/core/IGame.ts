import type { Observable } from 'rxjs';
import type { EventMap } from './EventMap';
import type GameObject from './GameObject';
import type { GameObjectDto } from './GameObject';
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

	spawn(): GameObject;
	spawnPrefab(prefab: GameObjectDto): GameObject;
	destroy(obj: GameObject): void;
	destroySome(cb: (obj: GameObject) => boolean): void;

	findObjectsByTag(tag: string): IteratorObject<GameObject>;
	findObjectsByType<T extends (new (game: IGame) => GameObject)[]>(
		...types: T
	): IteratorObject<InstanceType<T[number]>>;
	getObjects(): IteratorObject<GameObject>;
}
