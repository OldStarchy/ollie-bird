import { Button } from '../Button';
import type Mouse from './Mouse';
import { MouseButtonCode } from './Mouse';

export class MouseButton extends Button {
	constructor(
		private mouse: Mouse,
		private buttonCode: MouseButtonCode,
	) {
		super();
	}

	get isDown(): boolean {
		return this.mouse.isButtonDown(this.buttonCode);
	}

	get wasDown(): boolean {
		return this.mouse.wasButtonDown(this.buttonCode);
	}

	get name(): string {
		return `Mouse ${MouseButtonCode.nameOf(this.buttonCode)}`;
	}
}
