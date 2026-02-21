import { Subject } from 'rxjs';
import { Bindings } from '../OllieBirdGame';
import { TAG_LEVEL_OBJECT, TAG_LEVEL_STRUCTURE, TAG_PLAYER } from '../const';
import type { EventMap } from '../core/EventMap';
import GameObject from '../core/GameObject';
import Module from '../core/Module';
import { Err, Ok, Result } from '../core/monad/Result';
import CheckpointManager from './CheckpointManager';
import GameTimer from './GameTimer';
import BirdBehavior from './bird/BirdBehavior';

export type LevelGameplayManagerEvents = EventMap<{
	levelStart: void;
	levelEnd: void;
	levelComplete: void;
}>;

export default class LevelGameplayManager extends Module {
	static override readonly displayName = 'LevelGameplayManager';

	readonly #event$ = new Subject<LevelGameplayManagerEvents>();
	readonly event$ = this.#event$.asObservable();

	#pauseKey = this.game.input.keyboard.getButton('KeyP');
	#restartKey = this.game.input.getButton(Bindings.Restart);

	#birdDied = false;

	constructor(owner: GameObject) {
		super(owner);

		this.addTransientModule(CheckpointManager);
		this.addTransientModule(GameTimer);
	}

	override update(): void {
		if (this.#pauseKey.isPressed) {
			const bird = this.game.findObjectsByTag(TAG_PLAYER);

			bird.forEach((b) => b.getModule(BirdBehavior)?.togglePause());
		}

		if (this.#restartKey.isPressed) {
			this.restart();
		}
		super.update();
	}
	override afterUpdate(): void {
		if (this.#birdDied) {
			this.#birdDied = false;
			if (
				this.game.findObjectsByTag(TAG_PLAYER).take(1).toArray()
					.length === 0
			) {
				this.#event$.next({ type: 'levelComplete' });
			}
		}
		super.afterUpdate();
	}

	restart() {
		this.game.destroySome((obj) => obj.tags.has(TAG_LEVEL_OBJECT));
		this.#event$.next({ type: 'levelStart' });
	}

	handleBirdReachedGoal(_bird: GameObject) {
		this.#event$.next({ type: 'levelComplete' });
	}

	handleBirdDied(_bird: GameObject) {
		this.#birdDied = true;
	}

	getLevelData(): string {
		const objects = this.game
			.findObjectsByTag(TAG_LEVEL_STRUCTURE)
			.map((obj) => obj.serialize());

		return JSON.stringify(
			{
				objects,
				width: this.game.width,
				height: this.game.height,
				background: this.game.backgroundColor,
			},
			null,
			2,
		);
	}

	removeAll() {
		this.game
			.findObjectsByTag(TAG_LEVEL_STRUCTURE)
			.forEach((obj) => obj.destroy());
		this.game
			.findObjectsByTag(TAG_LEVEL_OBJECT)
			.forEach((obj) => obj.destroy());
	}

	loadLevelData(
		data: string,
	): Result<void, { message: string; cause: string[] }[]> {
		this.removeAll();

		const loadErrors: { message: string; cause: string[] }[] = [];
		try {
			const parsed = JSON.parse(data);

			if (typeof parsed.width === 'number') {
				this.game.width = parsed.width;
			} else {
				this.game.width = 1920;
			}
			if (typeof parsed.height === 'number') {
				this.game.height = parsed.height;
			} else {
				this.game.height = 1080;
			}

			if (typeof parsed.background === 'string') {
				this.game.backgroundColor = parsed.background;
			} else {
				this.game.backgroundColor = 'skyblue';
			}
			// Handle new format with $type field
			if (Array.isArray(parsed.objects)) {
				for (const obj of parsed.objects) {
					GameObject.deserializePartial(obj, {
						game: this.game,
					})
						.inspect((obj) => obj.tags.add(TAG_LEVEL_STRUCTURE))
						.logErr('Failed to deserialize object:')
						.inspectErr(({ errors }) => {
							loadErrors.push({
								message: 'Failed to deserialize Object',
								cause: errors,
							});
						});
				}
				return loadErrors.length === 0 ? Ok() : Err(loadErrors);
			}
		} catch (error) {
			console.error('Error loading level data:', error);
			loadErrors.push({
				message: 'Invalid level data format.',
				cause: [],
			});
		}

		return loadErrors.length === 0 ? Ok() : Err(loadErrors);
	}

	static {
		Module.serializer.registerSerializationType(
			'LevelGameplayManager',
			this,
		);
	}
}
