/**
 * Represents a 2D positional input (such as a mouse cursor or touch point).
 */
export interface Pointer {
	get x(): number;
	get y(): number;

	get previousX(): number;
	get previousY(): number;
}
