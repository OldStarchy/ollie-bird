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

export const LAYER_DEFAULT = 0;
export const LAYER_BACKGROUND = -100;
export const LAYER_ITEMS = 5;
export const LAYER_ENEMYS = 10;
export const LAYER_PLAYER = 20;
export const LAYER_FOREGROUND = 100;
