/**
 * Converts an event map
 *
 * ```ts
 * interface EventMap {
 * 	eventName: EventDataType;
 * 	eventName2: void; // for events without data
 * }
 * ```
 *
 * to a discriminated union of event objects
 *
 * ```ts
 * type GameEvent =
 * 	| { type: 'eventName'; data: EventDataType }
 * 	| { type: 'eventName2'; data?: never };
 * ```
 */
export type EventMap<T> = {
	[K in keyof T]: T[K] extends void
		? { type: K; data?: never }
		: { type: K; data: T[K] };
}[keyof T];
