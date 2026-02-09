import type { Subject } from 'rxjs';
import type GameObject from './GameObject';
import type Input from './input/Input';

declare global {
	interface GameEventMap {}
}

export default interface IGame {
	readonly input: Input;
	readonly physics: {
		gravity: number;
	};
	readonly event$: Subject<
		{
			[K in keyof GameEventMap]: GameEventMap[K] extends void
				? { type: K }
				: { type: K; data: GameEventMap[K] };
		}[keyof GameEventMap]
	>;

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

	restart(): void;
}
