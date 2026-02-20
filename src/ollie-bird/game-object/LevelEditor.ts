import { CELL_SIZE } from '../const';
import GameObject from '../core/GameObject';
import type IGame from '../core/IGame';
import Mouse from '../core/input/mouse/Mouse';
import { Option } from '../core/monad/Option';
import CreateCheckpointTool from '../modules/editor-tools/CreateCheckpointTool';
import CreateWallTool from '../modules/editor-tools/CreateWallTool';
import DeleteThingsTool from '../modules/editor-tools/DeleteThingsTool';
import SetGoalTool from '../modules/editor-tools/SetGoalTool';
import ObjectSelector from '../modules/ObjectSelector';
import PlayerSpawner from '../modules/PlayerSpawner';
import { createBombPrefab } from '../prefabs/createBombPrefab';
import { createPlayerSpawnerPrefab } from '../prefabs/createPlayerSpawnerPrefab';
import { createWalkerSpawnerPrefab } from '../prefabs/createWalkerSpawnerPrefab';

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

	private createWallTool: CreateWallTool;
	private createCheckpointTool: CreateCheckpointTool;
	private setGoalTool: SetGoalTool;
	private deleteThingsTool: DeleteThingsTool;

	#changeToolKey = this.game.input.keyboard.getButton('Tab');
	#ctrlKey = this.game.input.keyboard.getButton('ControlLeft');

	#primaryMbutton = this.game.input.mouse.getButton(Mouse.BUTTON_LEFT);

	constructor(game: IGame) {
		super(game);

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

	override initialize(): void {
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

	override update(): void {
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

		super.update();
	}

	override render(context: CanvasRenderingContext2D): void {
		context.fillStyle = 'black';
		context.beginPath();
		context.fillText(
			`Level Editor Mode: ${editorModeLabels[this.mode]}`,
			10,
			20,
		);

		this.renderGrid(context);

		super.render(context);
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
}
