import type Sprite from '../../core/Sprite';
import type { CinematicFrameState } from './CinematicFrameState';

export type CinematicFrame = {
	sprite: Sprite;
	state: CinematicFrameState;
	destRect: Omit<CinematicFrameState, 'opacity'>;
	caption: string | null;
};
