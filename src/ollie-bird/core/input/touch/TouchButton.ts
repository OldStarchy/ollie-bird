import { Button } from '../Button';
import type { TouchPointer } from './TouchPointer';

/**
 * A Button that is "down" while a specific touch point is active.
 */
export class TouchButton extends Button {
	readonly name: string;

	constructor(private readonly pointer: TouchPointer) {
		super();
		this.name = `Touch`;
	}

	get isDown(): boolean {
		return this.pointer.isActive;
	}

	get wasDown(): boolean {
		return this.pointer.wasActive;
	}
}
