import { CELL_SIZE } from '../const';
import GameObject from '../core/GameObject';
import Module from '../core/Module';
import CreateBombTool from './editor-tools/CreateBombTool';
import CreateCheckpointTool from './editor-tools/CreateCheckpointTool';
import CreateWalkerSpawnerTool from './editor-tools/CreateWalkerSpawnerTool';
import CreateWallTool from './editor-tools/CreateWallTool';
import DeleteThingsTool from './editor-tools/DeleteThingsTool';
import SetGoalTool from './editor-tools/SetGoalTool';
import SetSpawnPointTool from './editor-tools/SetSpawnPointTool';
import ObjectSelector from './ObjectSelector';

enum EditorMode {
	SetSpawnPoint,
	SetGoal,
	BuildWalls,
	CreateBomb,
	AddCheckpoint,
	AddBaddie,
	DeleteThings,
	LAST = DeleteThings,
}

const editorModeLabels = {
	[EditorMode.BuildWalls]: 'Build Walls',
	[EditorMode.DeleteThings]: 'Delete Things',
	[EditorMode.SetSpawnPoint]: 'Set Spawn Point',
	[EditorMode.CreateBomb]: 'Create Bomb',
	[EditorMode.AddCheckpoint]: 'Add Checkpoint',
	[EditorMode.SetGoal]: 'Set Goal',
	[EditorMode.AddBaddie]: 'Add Baddie',
} as const;

export default class LevelEditor extends Module {
	static readonly displayName: string = 'Level Editor';

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
	private deleteThingsTool: DeleteThingsTool;
	private setSpawnPointTool: SetSpawnPointTool;
	private createBombTool: CreateBombTool;
	private createCheckpointTool: CreateCheckpointTool;
	private setGoalTool: SetGoalTool;
	private createWalkerSpawnerTool: CreateWalkerSpawnerTool;

	#changeToolKey = this.game.input.keyboard.getButton('Tab');

	constructor(owner: GameObject) {
		super(owner);

		this.addTransientModule(ObjectSelector);

		this.createWallTool = this.addTransientModule(CreateWallTool);
		this.createCheckpointTool =
			this.addTransientModule(CreateCheckpointTool);
		this.setSpawnPointTool = this.addTransientModule(SetSpawnPointTool);
		this.createBombTool = this.addTransientModule(CreateBombTool);
		this.setGoalTool = this.addTransientModule(SetGoalTool);
		this.deleteThingsTool = this.addTransientModule(DeleteThingsTool);
		this.createWalkerSpawnerTool = this.addTransientModule(
			CreateWalkerSpawnerTool,
		);

		this.updateActiveTool();
	}

	private updateActiveTool() {
		this.setGoalTool.active = this.#mode === EditorMode.SetGoal;
		this.createWallTool.active = this.#mode === EditorMode.BuildWalls;
		this.setSpawnPointTool.active = this.#mode === EditorMode.SetSpawnPoint;
		this.createBombTool.active = this.#mode === EditorMode.CreateBomb;
		this.createCheckpointTool.active =
			this.#mode === EditorMode.AddCheckpoint;
		this.deleteThingsTool.active = this.#mode === EditorMode.DeleteThings;
		this.createWalkerSpawnerTool.active =
			this.#mode === EditorMode.AddBaddie;
	}

	override update(): void {
		if (this.#changeToolKey.isPressed) {
			this.mode = (this.mode + 1) % (EditorMode.LAST + 1);
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

	static {
		Module.serializer.registerSerializationType('LevelEditor', this);
	}
}
