import ButtonState from '../ButtonState';
import RectangleCollider from '../collider/RectangleCollider';
import { GRID_SIZE, TAG_LEVEL_OBJECT, TAG_LEVEL_STRUCTURE } from '../const';
import GameObject from '../GameObject';
import type IGame from '../IGame';
import Collider2d from '../modules/Collider2d';
import Mouse from '../Mouse';
import BaddieSpawner from './BaddieSpawner';
import Bird from './Bird';
import Goal from './Goal';
import Obstacle from './Obstacle';
import type RectangleTrigger from './RectangleTrigger';
import SpawnPoint from './SpawnPoint';

enum EditorMode {
	AddObstacle,
	DeleteObstacle,
	SetSpawnPoint,
	SetGoal,
	AddBaddie,
	LAST = AddBaddie,
}

const editorModeLabels = {
	[EditorMode.AddObstacle]: 'add obstacle',
	[EditorMode.DeleteObstacle]: 'delete obstacle',
	[EditorMode.SetSpawnPoint]: 'set spawn point',
	[EditorMode.SetGoal]: 'set goal',
	[EditorMode.AddBaddie]: 'add baddie',
} as const;

export default class LevelEditor extends GameObject {
	layer = 200;
	mode: EditorMode = EditorMode.AddObstacle;

	gridSize: number = GRID_SIZE;

	dragStart: { x: number; y: number } | null = null;
	constructor(game: IGame) {
		super(game);
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
		trigger.width = width;
		trigger.height = height;

		return trigger;
	}

	protected override update(): void {
		this.handleSaveKeys();
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
			case EditorMode.DeleteObstacle:
			case EditorMode.SetGoal:
				if (this.dragStart === null) {
					if (
						this.game.mouse.getButton(Mouse.BUTTON_LEFT) ===
						ButtonState.Pressed
					) {
						this.dragStart = { ...mPos };
					}
				} else {
					if (!this.game.mouse.getButtonDown(Mouse.BUTTON_LEFT)) {
						const x1 = Math.min(this.dragStart.x, mPos.x);
						const y1 = Math.min(this.dragStart.y, mPos.y);
						const x2 = Math.max(this.dragStart.x, mPos.x);
						const y2 = Math.max(this.dragStart.y, mPos.y);
						this.dragStart = null;

						const rect = {
							x: x1,
							y: y1,
							width: x2 - x1,
							height: y2 - y1,
						};
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
							case EditorMode.DeleteObstacle: {
								const collider = new RectangleCollider(
									rect.x,
									rect.y,
									rect.width,
									rect.height,
								);

								this.game
									.findObjectsByType(Obstacle)
									.filter((obj) => {
										const col = obj.getModule(Collider2d);
										if (!col) return false;
										return collider.checkCollision(
											{ x: 0, y: 0 },
											col.collider,
											obj.transform.position,
										);
									})
									.forEach((obj) => obj.destroy());
								break;
							}

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
		const obstacles = [];
		for (const obj of this.game.findObjectsByType(Obstacle)) {
			obstacles.push({
				type: 'obstacle_rectangle',
				...obj.transform.position,
				width: obj.width,
				height: obj.height,
			});
		}

		const spawn = this.game.findObjectsByType(SpawnPoint)[0];

		const goals = [];
		for (const obj of this.game.findObjectsByType(Goal)) {
			goals.push({
				type: 'goal_rectangle',
				...obj.transform.position,
				width: obj.width,
				height: obj.height,
			});
		}

		return JSON.stringify(
			{
				obstacles,
				goals,
				spawn: spawn?.transform.position ?? null,
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
			if (Array.isArray(parsed.obstacles)) {
				// Remove existing obstacles
				this.game
					.findObjectsByType(Obstacle)
					.forEach((obj) => obj.destroy());

				// Add new obstacles
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
				// Remove existing goals
				this.game
					.findObjectsByType(Goal)
					.forEach((obj) => obj.destroy());

				// Add new goals
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
			if (parsed.spawn) {
				this.game
					.findObjectsByType(SpawnPoint)
					.forEach((obj) => obj.destroy());
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

	handleSaveKeys(): void {
		//shift+number to save level data
		for (let i = 0; i <= 9; i++) {
			if (
				this.game.keyboard.getKey(`Digit${i + 1}`) ===
					ButtonState.Pressed &&
				(this.game.keyboard.isKeyDown('ShiftLeft') ||
					this.game.keyboard.isKeyDown('ShiftRight'))
			) {
				const data = this.getLevelData();
				localStorage.setItem(`level_${i}`, data);
				console.log(`Level data saved to slot ${i}`);
				return;
			}
		}

		//number to load level data
		for (let i = 0; i <= 9; i++) {
			if (
				this.game.keyboard.getKey(`Digit${i + 1}`) ===
				ButtonState.Pressed
			) {
				const data = localStorage.getItem(`level_${i}`);
				if (data) {
					this.loadLevelData(data);
					console.log(`Level data loaded from slot ${i}`);
				} else {
					this.loadLevelData(
						JSON.stringify({
							obstacles: [],
							goals: [],
							spawn: null,
						}),
					);
					console.log(`No level data found in slot ${i}`);
				}
				return;
			}
		}

		if (this.game.keyboard.getKey('Backquote') === ButtonState.Pressed) {
			this.removeAll();
			console.log('Level data cleared');
		}
	}
}
