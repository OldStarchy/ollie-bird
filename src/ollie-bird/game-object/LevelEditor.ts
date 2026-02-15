import { Subject } from 'rxjs';
import { CELL_SIZE, TAG_LEVEL_OBJECT, TAG_LEVEL_STRUCTURE } from '../const';
import RectangleCollider from '../core/collider/RectangleCollider';
import type { EventMap } from '../core/EventMap';
import GameObject from '../core/GameObject';
import type IGame from '../core/IGame';
import Mouse from '../core/input/mouse/Mouse';
import Rect2 from '../core/math/Rect2';
import Collider2d from '../core/modules/Collider2d';
import GameTimer from '../modules/GameTimer';
import ObjectSelector from '../modules/ObjectSelector';
import PlayerSpawner from '../modules/PlayerSpawner';
import SequentialGateManager from '../modules/SequentialGateManager';
import { Bindings } from '../OllieBirdGame';
import { createPlayerSpawnerPrefab } from '../prefabs/createPlayerSpawnerPrefab';
import BaddieSpawner from './BaddieSpawner';
import Bird from './Bird';
import Bomb from './Bomb';
import Goal from './Goal';
import Obstacle from './Obstacle';
import type RectangleTrigger from './RectangleTrigger';
import SequentialGate from './SequentialGate';

enum EditorMode {
	SetSpawnPoint,
	SetGoal,
	AddObstacle,
	CreateBomb,
	AddGate,
	AddBaddie,
	DeleteThings,
	LAST = DeleteThings,
}

const editorModeLabels = {
	[EditorMode.AddObstacle]: 'add obstacle',
	[EditorMode.DeleteThings]: 'delete things',
	[EditorMode.SetSpawnPoint]: 'set spawn point',
	[EditorMode.CreateBomb]: 'create bomb',
	[EditorMode.AddGate]: 'add gate',
	[EditorMode.SetGoal]: 'set goal',
	[EditorMode.AddBaddie]: 'add baddie',
} as const;

export type LevelLoaderEvents = EventMap<{
	levelStart: void;
	levelComplete: void;
}>;

export default class LevelEditor extends GameObject {
	static readonly defaultName: string = 'Level Editor';

	mode: EditorMode = EditorMode.SetSpawnPoint;

	gridSize: number = CELL_SIZE;

	dragStart: { x: number; y: number } | null = null;

	readonly #levelLoaderEvent$ = new Subject<LevelLoaderEvents>();
	readonly levelEvent$ = this.#levelLoaderEvent$.asObservable();

	protected override initialize(): void {
		super.initialize();
		this.layer = 200;

		this.addModule(SequentialGateManager);
		this.addModule(GameTimer);
		this.addModule(ObjectSelector);
	}

	#changeToolKey = this.game.input.keyboard.getButton('Tab');
	#cancelKey = this.game.input.keyboard.getButton('Escape');
	#pauseKey = this.game.input.keyboard.getButton('KeyP');
	#ctrlKey = this.game.input.keyboard.getButton('ControlLeft');

	#restartKey = this.game.input.getButton(Bindings.Restart);

	#primaryMbutton = this.game.input.mouse.getButton(Mouse.BUTTON_LEFT);

	alignToGrid(obj: { x: number; y: number }): { x: number; y: number } {
		return {
			x: Math.round(obj.x / this.gridSize) * this.gridSize,
			y: Math.round(obj.y / this.gridSize) * this.gridSize,
		};
	}

	private spawnCollider<T extends RectangleTrigger>(
		type: new (game: IGame) => T,
		x: number,
		y: number,
		width: number,
		height: number,
	): T {
		const trigger = this.game.spawn(type);
		trigger.transform.position.set(x, y);
		trigger.setSize(width, height);

		return trigger;
	}

	protected override update(): void {
		if (this.#changeToolKey.isPressed) {
			this.mode = (this.mode + 1) % (EditorMode.LAST + 1);
		}

		if (this.#cancelKey.isPressed) {
			this.dragStart = null;
		}

		if (this.#pauseKey.isPressed) {
			const bird = this.game.findObjectsByType(Bird)[0];

			if (bird) {
				bird.togglePause();
			}
		}

		if (this.#restartKey.isPressed) {
			this.restart();
			this.dragStart = null;
		}

		const mPos = this.alignToGrid({
			x: this.game.input.mouse.x,
			y: this.game.input.mouse.y,
		});

		switch (this.mode) {
			case EditorMode.AddObstacle:
			case EditorMode.DeleteThings:
			case EditorMode.SetGoal:
			case EditorMode.AddGate:
				if (this.dragStart === null) {
					if (this.#primaryMbutton.isPressed) {
						this.dragStart = { ...mPos };
					}
				} else {
					if (!this.#primaryMbutton.isDown) {
						const rect = Rect2.fromAABB(
							this.dragStart.x,
							this.dragStart.y,
							mPos.x,
							mPos.y,
						);

						this.dragStart = null;

						if (rect.width === 0 || rect.height === 0) {
							return;
						}

						rect.normalize();

						switch (this.mode) {
							case EditorMode.AddObstacle:
								this.spawnCollider(
									Obstacle,
									rect.x,
									rect.y,
									rect.width,
									rect.height,
								);
								break;
							case EditorMode.DeleteThings: {
								// Check collision with obstacles in the selection area
								for (const obj of this.game
									.findObjectsByType(Obstacle, SequentialGate)
									.filter(
										Collider2d.collidingWith(
											new RectangleCollider(
												rect.x,
												rect.y,
												rect.width,
												rect.height,
											),
										),
									)) {
									obj.destroy();
								}
								break;
							}

							case EditorMode.AddGate:
								this.spawnCollider(
									SequentialGate,
									rect.x,
									rect.y,
									rect.width,
									rect.height,
								);
								break;

							case EditorMode.SetGoal:
								this.game
									.findObjectsByType(Goal)
									.forEach((obj) => obj.destroy());

								this.spawnCollider(
									Goal,
									rect.x,
									rect.y,
									rect.width,
									rect.height,
								);
								break;
						}
					}
				}
				break;
			case EditorMode.SetSpawnPoint:
				if (this.#primaryMbutton.isPressed) {
					const player = this.#ctrlKey.isDown ? 1 : 0;

					this.game
						.findObjectsByTag('player-spawner')
						.map((obj) => obj.getModule(PlayerSpawner))
						.filter((sp) => sp?.playerIndex === player)
						.forEach((sp) => sp?.owner.destroy());

					GameObject.deserializePartial(
						createPlayerSpawnerPrefab(mPos, player),
						{ game: this.game },
					).logErr('Failed to create player spawner');
				}
				break;
			case EditorMode.CreateBomb:
				if (this.#primaryMbutton.isPressed) {
					this.game.spawn(Bomb).transform.position.copy(mPos);
				}
				break;
			case EditorMode.AddBaddie:
				if (this.#primaryMbutton.isPressed) {
					this.game
						.spawn(BaddieSpawner)
						.transform.position.copy(mPos);
				}
				break;
		}

		if (!this.#primaryMbutton.isDown) {
			this.dragStart = null;
		}
	}

	protected override afterUpdate(): void {
		if (this.#birdDied) {
			this.#birdDied = false;
			if (this.game.findObjectsByType(Bird).length === 0) {
				this.#levelLoaderEvent$.next({ type: 'levelComplete' });
			}
		}
	}

	protected override render(context: CanvasRenderingContext2D): void {
		context.fillStyle = 'black';
		context.beginPath();
		context.fillText(
			`Level Editor Mode: ${editorModeLabels[this.mode]}`,
			10,
			20,
		);
		if (this.dragStart !== null) {
			context.strokeStyle =
				this.mode === EditorMode.AddObstacle ? 'green' : 'red';
			context.beginPath();
			const m = this.alignToGrid({
				x: this.game.input.mouse.x,
				y: this.game.input.mouse.y,
			});
			context.strokeRect(
				this.dragStart.x,
				this.dragStart.y,
				m.x - this.dragStart.x,
				m.y - this.dragStart.y,
			);
			context.stroke();
		}

		this.renderGrid(context);
	}
	renderGrid(context: CanvasRenderingContext2D): void {
		const gridSize = this.gridSize;
		context.strokeStyle = '#e0e0e0';
		context.lineWidth = 1;
		for (let x = 0; x < this.game.width; x += gridSize) {
			context.beginPath();
			context.moveTo(x, 0);
			context.lineTo(x, this.game.height);
			context.stroke();
		}
		for (let y = 0; y < this.game.height; y += gridSize) {
			context.beginPath();
			context.moveTo(0, y);
			context.lineTo(this.game.width, y);
			context.stroke();
		}
	}

	getLevelData(): string {
		const objects = this.game
			.findObjectsByTag(TAG_LEVEL_STRUCTURE)
			.map((obj) => obj.serialize())
			.filter((obj) => obj !== null);

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

	loadLevelData(data: string): void {
		this.removeAll();

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
					}).inspectErr((err) =>
						console.error(
							'Failed to deserialize object:',
							err.error,
						),
					);
				}
				return;
			}

			// Legacy format support - handle old save format
			if (Array.isArray(parsed.obstacles)) {
				for (const obs of parsed.obstacles) {
					if (
						obs.type === 'obstacle_rectangle' &&
						typeof obs.x === 'number' &&
						typeof obs.y === 'number' &&
						typeof obs.width === 'number' &&
						typeof obs.height === 'number'
					) {
						this.spawnCollider(
							Obstacle,
							obs.x,
							obs.y,
							obs.width,
							obs.height,
						);
					}
				}
			}
			if (Array.isArray(parsed.goals)) {
				for (const goal of parsed.goals) {
					if (
						goal.type === 'goal_rectangle' &&
						typeof goal.x === 'number' &&
						typeof goal.y === 'number' &&
						typeof goal.width === 'number' &&
						typeof goal.height === 'number'
					) {
						this.spawnCollider(
							Goal,
							goal.x,
							goal.y,
							goal.width,
							goal.height,
						);
					}
				}
			}

			if (parsed.gates && Array.isArray(parsed.gates)) {
				for (const gate of parsed.gates) {
					if (
						gate.type === 'gate_rectangle' &&
						typeof gate.x === 'number' &&
						typeof gate.y === 'number' &&
						typeof gate.width === 'number' &&
						typeof gate.height === 'number'
					) {
						this.spawnCollider(
							SequentialGate,
							gate.x,
							gate.y,
							gate.width,
							gate.height,
						);
					}
				}
			}

			if (parsed.spawn) {
				if (
					typeof parsed.spawn.x === 'number' &&
					typeof parsed.spawn.y === 'number'
				) {
					GameObject.deserializePartial(
						createPlayerSpawnerPrefab(parsed.spawn, 0),
						{ game: this.game },
					).logErr('Failed to create player spawner');
				}
			}
		} catch (error) {
			console.error('Error loading level data:', error);
		}
	}

	restart() {
		this.game.destroySome((obj) => obj.tags.has(TAG_LEVEL_OBJECT));
		this.#levelLoaderEvent$.next({ type: 'levelStart' });
	}

	handleBirdReachedGoal(_bird: Bird) {
		this.#levelLoaderEvent$.next({ type: 'levelComplete' });
	}

	#birdDied = false;
	handleBirdDied(_bird: Bird) {
		this.#birdDied = true;
	}
}
