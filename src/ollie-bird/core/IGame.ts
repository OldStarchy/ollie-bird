import type { Observable } from 'rxjs';
import type { EventMap } from './EventMap';
import type GameObject from './GameObject';
import type { GameObjectDto } from './GameObject';
import type Input from './input/Input';
import type Module from './Module';

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

	getObjects(): IteratorObject<GameObject>;
	findObjectsByTag(tag: string): IteratorObject<GameObject>;

	findModulesByType<T extends Module>(
		type: abstract new (owner: GameObject) => T,
	): IteratorObject<T>;
	findModuleByType<T extends Module>(
		type: abstract new (owner: GameObject) => T,
	): T | null;

	waitFrames(frames: number): Promise<void>;
}
