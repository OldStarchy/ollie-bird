import type Input from './Input';

/**
 * A single button input.
 */
export abstract class Button implements Input {
	abstract get name(): string;

	/**
	 * Is the button currently down now?
	 */
	abstract get isDown(): boolean;
	/**
	 * Was the button down in the previous frame?
	 */
	abstract get wasDown(): boolean;

	/**
	 * Was the button pressed since the last frame?
	 */
	get isPressed(): boolean {
		return this.isDown && !this.wasDown;
	}
	/**
	 * Was the button released since the last frame?
	 */
	get isReleased(): boolean {
		return !this.isDown && this.wasDown;
	}

	/**
	 * Merges this button with one or more other buttons, returning a new button
	 * that is considered down if any of the merged buttons are down.
	 *
	 * This is useful for defining multiple inputs for the same action, eg.
	 * "move left" could be triggered by either the "A" key or the "ArrowLeft"
	 * key.
	 *
	 * Pressing multiple of these buttons at the same time will be handled as
	 * a single button press spanning the duration of all the presses.
	 * {@link isPressed} and {@link isReleased} will only be true once.
	 */
	merge(...others: Button[]): Button {
		return new MergedButton([this, ...others]);
	}
}

export class MergedButton extends Button {
	private buttons: Button[];

	constructor(buttons: Button[]) {
		super();
		if (buttons.length === 0) {
			throw new Error('MergedButton requires at least one button');
		}
		this.buttons = buttons.flatMap((button) =>
			button instanceof MergedButton ? button.buttons : [button],
		);
	}

	override merge(...others: Button[]): Button {
		return new MergedButton([...this.buttons, ...others]);
	}

	get isDown(): boolean {
		return this.buttons.some((button) => button.isDown);
	}

	get wasDown(): boolean {
		return this.buttons.some((button) => button.wasDown);
	}

	get name(): string {
		return this.buttons.map((b) => b.name).join(' / ');
	}
}
