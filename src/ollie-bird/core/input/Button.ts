export abstract class Button {
	abstract get isDown(): boolean;
	abstract get wasDown(): boolean;

	get isPressed(): boolean {
		return this.isDown && !this.wasDown;
	}
	get isReleased(): boolean {
		return !this.isDown && this.wasDown;
	}

	merge(...others: Button[]): Button {
		return new MergedButton([this, ...others]);
	}
}

export class MergedButton extends Button {
	private buttons: Button[];

	constructor(buttons: Button[]) {
		super();
		this.buttons = buttons.flatMap((button) =>
			button instanceof MergedButton ? button.buttons : [button],
		);
	}

	override merge(other: Button): Button {
		return new MergedButton([...this.buttons, other]);
	}

	get isDown(): boolean {
		return this.buttons.some((button) => button.isDown);
	}

	get wasDown(): boolean {
		return this.buttons.some((button) => button.wasDown);
	}
}
