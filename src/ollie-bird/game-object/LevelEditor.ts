import ButtonState from '../ButtonState';
import RectangleCollider from '../collider/RectangleCollider';
import { CELL_SIZE, TAG_LEVEL_OBJECT, TAG_LEVEL_STRUCTURE } from '../const';
import GameObject from '../GameObject';
import type IGame from '../IGame';
import LevelStore, { type ISerializable } from '../LevelStore';
import Rect2 from '../math/Rect2';
import Collider2d from '../modules/Collider2d';
import SequentialGateManager from '../modules/SequentialGateManager';
import Mouse from '../Mouse';
import BaddieSpawner from './BaddieSpawner';
import Bird from './Bird';
import Bomb from './Bomb';
import Goal from './Goal';
import Obstacle from './Obstacle';
import type RectangleTrigger from './RectangleTrigger';
import SequentialGate from './SequentialGate';
import SpawnPoint from './SpawnPoint';

enum EditorMode {
	AddObstacle,
	DeleteThings,
	SetSpawnPoint,
	CreateBomb,
	AddGate,
	SetGoal,
	AddBaddie,
	LAST = AddBaddie,
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

export default class LevelEditor extends GameObject {
	layer = 200;
	mode: EditorMode = EditorMode.AddObstacle;

	gridSize: number = CELL_SIZE;

	dragStart: { x: number; y: number } | null = null;

	protected override initialize(): void {
		super.initialize();

		// Register all serializable types
		LevelStore.register('Obstacle', Obstacle);
		LevelStore.register('Goal', Goal);
		LevelStore.register('SequentialGate', SequentialGate);
		LevelStore.register('SpawnPoint', SpawnPoint);
		LevelStore.register('BaddieSpawner', BaddieSpawner);

		this.onGameEvent('getLevelData', (callback) =>
			callback(this.getLevelData()),
		);
		this.onGameEvent('loadLevel', (data) => this.loadLevelData(data));

		this.addModule(SequentialGateManager);
	}

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
		if (this.game.keyboard.getKey('Tab') === ButtonState.Pressed) {
			this.mode = (this.mode + 1) % (EditorMode.LAST + 1);
		}

		if (this.game.keyboard.getKey('Escape') === ButtonState.Pressed) {
			this.dragStart = null;
		}

		if (this.game.keyboard.getKey('KeyP') === ButtonState.Pressed) {
			const bird = this.game.findObjectsByType(Bird)[0];

			if (bird) {
				bird.togglePause();
			}
		}

		if (this.game.keyboard.getKey('KeyR') === ButtonState.Pressed) {
			this.game.restart();
			this.dragStart = null;
		}

		const mPos = this.alignToGrid({
			x: this.game.mouse.x,
			y: this.game.mouse.y,
		});

		switch (this.mode) {
			case EditorMode.AddObstacle:
			case EditorMode.DeleteThings:
			case EditorMode.SetGoal:
			case EditorMode.AddGate:
				if (this.dragStart === null) {
					if (
						this.game.mouse.getButton(Mouse.BUTTON_LEFT) ===
						ButtonState.Pressed
					) {
						this.dragStart = { ...mPos };
					}
				} else {
					if (!this.game.mouse.getButtonDown(Mouse.BUTTON_LEFT)) {
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

						rect.noramlize();

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
				if (
					this.game.mouse.getButton(Mouse.BUTTON_LEFT) ===
					ButtonState.Pressed
				) {
					this.game
						.findObjectsByType(SpawnPoint)
						.forEach((obj) => obj.destroy());
					this.game
						.spawn(SpawnPoint)
						.transform.position.set(mPos.x, mPos.y);
				}
				break;
			case EditorMode.CreateBomb:
				if (
					this.game.mouse.getButton(Mouse.BUTTON_LEFT) ===
					ButtonState.Pressed
				) {
					this.game
						.spawn(Bomb)
						.transform.position.set(mPos.x, mPos.y);
				}
				break;
			case EditorMode.AddBaddie:
				if (
					this.game.mouse.getButton(Mouse.BUTTON_LEFT) ===
					ButtonState.Pressed
				) {
					this.game
						.spawn(BaddieSpawner)
						.transform.position.set(mPos.x, mPos.y);
				}
				break;
		}

		if (!this.game.mouse.getButtonDown(Mouse.BUTTON_LEFT)) {
			this.dragStart = null;
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
				x: this.game.mouse.x,
				y: this.game.mouse.y,
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
		for (let x = 0; x < this.game.canvas.width; x += gridSize) {
			context.beginPath();
			context.moveTo(x, 0);
			context.lineTo(x, this.game.canvas.height);
			context.stroke();
		}
		for (let y = 0; y < this.game.canvas.height; y += gridSize) {
			context.beginPath();
			context.moveTo(0, y);
			context.lineTo(this.game.canvas.width, y);
			context.stroke();
		}
	}

	getLevelData(): string {
		const objects = this.game
			.findObjectsByTag(TAG_LEVEL_STRUCTURE)
			.map((obj) => {
				if ('serialize' in obj && typeof obj.serialize === 'function') {
					return (obj as ISerializable).serialize();
				}
				console.warn('Object does not implement serialize:', obj);
				return null;
			})
			.filter((obj) => obj !== null);

		return JSON.stringify({ objects }, null, 2);
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

			// Handle new format with $type field
			if (Array.isArray(parsed.objects)) {
				for (const obj of parsed.objects) {
					if (
						typeof obj === 'object' &&
						obj !== null &&
						'$type' in obj
					) {
						const Class = LevelStore.get(obj.$type as string);
						if (Class && 'spawnDeserialize' in Class) {
							const spawned = Class.spawnDeserialize(this.game, obj);
							if (!spawned) {
								console.warn(
									'Failed to deserialize level object',
									obj,
								);
							}
						} else {
							console.warn(
								`Unknown or unregistered type: ${obj.$type}`,
							);
						}
					}
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
					this.game
						.spawn(SpawnPoint)
						.transform.position.set(parsed.spawn.x, parsed.spawn.y);
				}
			}
		} catch (error) {
			console.error('Error loading level data:', error);
		}
	}
}
