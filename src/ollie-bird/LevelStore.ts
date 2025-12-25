import type GameObject from './GameObject';
import type IGame from './IGame';

export interface ISerializable {
	serialize(): Record<string, unknown>;
}

export interface IDeserializableClass {
	spawnDeserialize(game: IGame, data: unknown): GameObject | null;
}

export type SerializableClass = (new (game: IGame) => GameObject) &
	IDeserializableClass;

class LevelStore {
	private registry = new Map<string, SerializableClass>();

	register(typeName: string, cls: SerializableClass): void {
		if (this.registry.has(typeName)) {
			console.warn(
				`LevelStore: Type "${typeName}" is already registered. Overwriting.`,
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

export default new LevelStore();
