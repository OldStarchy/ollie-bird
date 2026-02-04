export abstract class InputButton {
	abstract get isDown(): boolean;
	abstract get wasDown(): boolean;
	abstract get isPressed(): boolean;
	abstract get isReleased(): boolean;
}
