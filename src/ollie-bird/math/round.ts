export function round(value: number, toNearest: number): number {
	return Math.round(value / toNearest) * toNearest;
}
