import { Subject } from 'rxjs';
import { CELL_SIZE, TAG_LEVEL_OBJECT, TAG_LEVEL_STRUCTURE } from '../const';
import type { EventMap } from '../core/EventMap';
import GameObject from '../core/GameObject';
import type IGame from '../core/IGame';
import Mouse from '../core/input/mouse/Mouse';
import { Option } from '../core/monad/Option';
import { Err, Ok, Result } from '../core/monad/Result';
import CheckpointManager from '../modules/CheckpointManager';
import CreateCheckpointTool from '../modules/editor-tools/CreateCheckpointTool';
import CreateWallTool from '../modules/editor-tools/CreateWallTool';
import DeleteThingsTool from '../modules/editor-tools/DeleteThingsTool';
import SetGoalTool from '../modules/editor-tools/SetGoalTool';
import GameTimer from '../modules/GameTimer';
import ObjectSelector from '../modules/ObjectSelector';
import PlayerSpawner from '../modules/PlayerSpawner';
import { Bindings } from '../OllieBirdGame';
import { createBombPrefab } from '../prefabs/createBombPrefab';
import createCheckpointPrefab from '../prefabs/createCheckpointPrefab';
import createGoalPrefab from '../prefabs/createGoalPrefab';
import { createPlayerSpawnerPrefab } from '../prefabs/createPlayerSpawnerPrefab';
import { createWalkerSpawnerPrefab } from '../prefabs/createWalkerSpawnerPrefab';
import createWallPrefab from '../prefabs/createWallPrefab';
import Bird from './Bird';

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

	#mode: EditorMode = EditorMode.SetSpawnPoint;
	get mode() {
		return this.#mode;
	}
	set mode(value: EditorMode) {
		this.#mode = value;
		this.updateActiveTool();
	}

	gridSize: number = CELL_SIZE;

	readonly #levelLoaderEvent$ = new Subject<LevelLoaderEvents>();
	readonly levelEvent$ = this.#levelLoaderEvent$.asObservable();

	private createWallTool: CreateWallTool;
	private createCheckpointTool: CreateCheckpointTool;
	private setGoalTool: SetGoalTool;
	private deleteThingsTool: DeleteThingsTool;

	#changeToolKey = this.game.input.keyboard.getButton('Tab');
	#pauseKey = this.game.input.keyboard.getButton('KeyP');
	#ctrlKey = this.game.input.keyboard.getButton('ControlLeft');

	#restartKey = this.game.input.getButton(Bindings.Restart);

	#primaryMbutton = this.game.input.mouse.getButton(Mouse.BUTTON_LEFT);

	constructor(game: IGame) {
		super(game);

		this.addModule(CheckpointManager);
		this.addModule(GameTimer);
		this.addModule(ObjectSelector);
		this.createWallTool = this.addModule(CreateWallTool);
		this.createWallTool.transient = true;
		this.createCheckpointTool = this.addModule(CreateCheckpointTool);
		this.createCheckpointTool.transient = true;
		this.setGoalTool = this.addModule(SetGoalTool);
		this.setGoalTool.transient = true;
		this.deleteThingsTool = this.addModule(DeleteThingsTool);
		this.deleteThingsTool.transient = true;
	}

	protected override initialize(): void {
		super.initialize();
		this.layer = 200;

		this.updateActiveTool();
	}

	private updateActiveTool() {
		this.setGoalTool.active = this.#mode === EditorMode.SetGoal;
		this.createWallTool.active = this.#mode === EditorMode.AddObstacle;
		this.createCheckpointTool.active = this.#mode === EditorMode.AddGate;
		this.deleteThingsTool.active = this.#mode === EditorMode.DeleteThings;
	}

	alignToGrid(obj: { x: number; y: number }): { x: number; y: number } {
		return {
			x: Math.round(obj.x / this.gridSize) * this.gridSize,
			y: Math.round(obj.y / this.gridSize) * this.gridSize,
		};
	}

	protected override update(): void {
		if (this.#changeToolKey.isPressed) {
			this.mode = (this.mode + 1) % (EditorMode.LAST + 1);

			switch (this.mode) {
				case EditorMode.AddObstacle:
				case EditorMode.AddGate:
				case EditorMode.SetGoal:
				case EditorMode.DeleteThings:
					// handled by CreateWallTool
					return;
			}
		}

		if (this.#pauseKey.isPressed) {
			const bird = this.game.findObjectsByType(Bird)[0];

			if (bird) {
				bird.togglePause();
			}
		}

		if (this.#restartKey.isPressed) {
			this.restart();
		}

		const mPos = this.alignToGrid({
			x: this.game.input.mouse.x,
			y: this.game.input.mouse.y,
		});

		switch (this.mode) {
			case EditorMode.SetSpawnPoint:
				if (this.#primaryMbutton.isPressed) {
					const player = this.#ctrlKey.isDown ? 1 : 0;

					this.game
						.findObjectsByTag('player-spawner')
						.flatMap((obj) => [
							...Option.of(obj.getModule(PlayerSpawner)),
						])
						.filter((sp) => sp.playerIndex === player)
						.forEach((sp) => sp?.owner.destroy());

					GameObject.deserializePartial(
						createPlayerSpawnerPrefab(mPos, player),
						{ game: this.game },
					).logErr('Failed to create player spawner');
				}
				break;
			case EditorMode.CreateBomb:
				if (this.#primaryMbutton.isPressed) {
					GameObject.deserializePartial(createBombPrefab(mPos), {
						game: this.game,
					}).logErr('Failed to create bomb');
				}
				break;
			case EditorMode.AddBaddie:
				if (this.#primaryMbutton.isPressed) {
					GameObject.deserializePartial(
						createWalkerSpawnerPrefab(mPos, 'left'),
						{ game: this.game },
					).logErr('Failed to create walker spawner');
				}
				break;
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
								message: 'Failed to deserialized Object',
								cause: errors,
							});
						});
				}
				return loadErrors.length === 0 ? Ok() : Err(loadErrors);
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
						GameObject.deserializePartial(createWallPrefab(obs), {
							game: this.game,
						})
							.logErr('Failed to create wall')
							.inspectErr(({ errors }) => {
								loadErrors.push({
									message: 'Failed to deserialized Object',
									cause: errors,
								});
							});
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
						GameObject.deserializePartial(createGoalPrefab(goal), {
							game: this.game,
						})
							.logErr('Failed to create goal')
							.inspectErr(({ errors }) => {
								loadErrors.push({
									message: 'Failed to deserialized Object',
									cause: errors,
								});
							});
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
						GameObject.deserializePartial(
							createCheckpointPrefab(gate),
							{ game: this.game },
						)
							.logErr('Failed to create checkpoint')
							.inspectErr(({ errors }) => {
								loadErrors.push({
									message: 'Failed to deserialized Object',
									cause: errors,
								});
							});
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
					)
						.logErr('Failed to create player spawner')
						.inspectErr(({ errors }) => {
							loadErrors.push({
								message: 'Failed to deserialized Object',
								cause: errors,
							});
						});
				}
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
