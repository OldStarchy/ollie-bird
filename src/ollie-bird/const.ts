export const CELL_SIZE = 50;

/**
 * Objects with this tag will be destroyed when reloading the level
 */
export const TAG_LEVEL_OBJECT = 'level-object';

/**
 * Objects with this tag will be destroyed when loading a new / different level
 */
export const TAG_LEVEL_STRUCTURE = 'level-structure';

/**
 * Touching an object with this tag will kill the player
 */
export const TAG_DEADLY = 'deadly';

/**
 * Objects with this tag are considered goals. Reaching them will complete the level
 */
export const TAG_GOAL = 'goal';

export enum Layer {
	Background,
	Default,
	Items,
	Enemys,
	Player,
	Foreground,
}
