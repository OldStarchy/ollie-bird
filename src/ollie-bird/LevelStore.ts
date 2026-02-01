import type GameObject from './core/GameObject';
import type IGame from './core/IGame';

export interface ISerializable {
	serialize(): Record<string, unknown>;
}

export interface IDeserializableClass {
	spawnDeserialize(game: IGame, data: unknown): GameObject | null;
}

export type SerializableClass = (new (game: IGame) => GameObject) &
	IDeserializableClass;

export default class LevelStore {
	static instance: LevelStore = new LevelStore();

	private registry = new Map<string, SerializableClass>();

	register(typeName: string, cls: SerializableClass): void {
		if (this.registry.has(typeName)) {
			throw new Error(
				`LevelStore: Type "${typeName}" is already registered.`,
			);
		}
		this.registry.set(typeName, cls);
	}

	get(typeName: string): SerializableClass | undefined {
		return this.registry.get(typeName);
	}

	has(typeName: string): boolean {
		return this.registry.has(typeName);
	}

	getRegisteredTypes(): string[] {
		return Array.from(this.registry.keys());
	}
}
