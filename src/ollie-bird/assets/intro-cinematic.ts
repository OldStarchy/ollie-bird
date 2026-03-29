import Sprite from '../core/Sprite';

import intro_01 from '../../assets/cinematics/intro-01.png';
import intro_02 from '../../assets/cinematics/intro-02.png';
import intro_03 from '../../assets/cinematics/intro-03.png';
// import intro_04 from '../../assets/cinematics/intro-04.png';
import intro_05 from '../../assets/cinematics/intro-05.png';
import intro_06 from '../../assets/cinematics/intro-06.png';
import intro_07 from '../../assets/cinematics/intro-07.png';
import intro_08 from '../../assets/cinematics/intro-08.png';
import type { CinematicFrame } from '../modules/cinematic/CinematicFrame';

// prettier-ignore
export const introCinematic = [
	{
		sprite: new Sprite(intro_01, undefined, false),
		state: { x:0.00, y: 0.00, width: 1.00, height: 1.00, opacity: 0 },
		destRect: { x: 0.30, y: 0.20, width: 0.70, height: 0.70 },
		caption: '*Hammering sounds*\nsomewhere, in a place…',
	},
	{
		sprite: new Sprite(intro_02, undefined, false),
		state: { x:0.00, y: 0.20, width: 1.00, height: 0.80, opacity: 0 },
		destRect: { x: 0.10, y: 0.00, width: 0.80, height: 0.70 },
		caption: 'From the depths of a workshop…\n*Making a robot sounds*',
	},
	{
		sprite: new Sprite(intro_03, undefined, false),
		state: { x:0.30, y: 0.40, width: 0.20, height: 0.20, opacity: 0 },
		destRect: { x: 0.00, y: 0.00, width: 1.00, height: 1.00 },
		caption: 'A robot was born.',
	},
	{
		sprite: new Sprite(intro_05, undefined, false),
		state: { x:0.00, y: 0.00, width: 1.00, height: 1.00, opacity: 0 },
		destRect: { x: 0.05, y: 0.02, width: 0.90, height: 0.90 },
		caption: null,
	},
	{
		sprite: new Sprite(intro_06, undefined, false),
		state: { x:0.05, y: 0.02, width: 0.90, height: 0.90, opacity: 0 },
		destRect: { x: 0.00, y: 0.00, width: 1.00, height: 1.00 },
		caption: '*UFO sounds*\nBut evil forces were at work…',
	},
	{
		sprite: new Sprite(intro_07, undefined, false),
		state: { x:0.00, y: 0.00, width: 1.00, height: 1.00, opacity: 0 },
		destRect: { x: 0.10, y: 0.05, width: 0.80, height: 0.85 },
		caption: '*wawawawwawa sounds*\n*also panicked bird sounds*',
	},
	{
		sprite: new Sprite(intro_08, undefined, false),
		state: { x:0.10, y: 0.05, width: 0.80, height: 0.85, opacity: 0 },
		destRect: { x: 0.00, y: 0.00, width: 1.00, height: 1.00 },
		caption: 'And so, the adventure begins…\n*rocky 1 theme plays*',
	},
] as CinematicFrame[];
