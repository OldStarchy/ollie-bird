export abstract class InputAxis {
	abstract get value(): number;
	abstract accessor deadzone: number;
	abstract accessor inverted: boolean;
}
