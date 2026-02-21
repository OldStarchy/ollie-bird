import Module from '../../core/Module';

export default abstract class LevelEditorTool extends Module {
	static readonly displayName: string = 'LevelEditorTool';

	#active: boolean = false;
	get active() {
		return this.#active;
	}
	set active(value: boolean) {
		this.#active = value;
		this.handleActiveChanged();
	}

	protected abstract handleActiveChanged(): void;
}
