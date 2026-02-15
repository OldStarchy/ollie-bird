import sheet1Url from '../assets/sheet1.png';
import bird_f1 from '../assets/bird_f1.png';
import bird_f2 from '../assets/bird_f2.png';
import bird_f3 from '../assets/bird_f3.png';
import bird_f4 from '../assets/bird_f4.png';
import bird_f5 from '../assets/bird_f5.png';
import bird_r1 from '../assets/bird_r1.png';
import bird_r2 from '../assets/bird_r2.png';
import bird_r3 from '../assets/bird_r3.png';
import bird_r4 from '../assets/bird_r4.png';
import bird_r5 from '../assets/bird_r5.png';

import Sprite from './core/Sprite';

export default class Resources {
	static sprites: Sprite[] = [];

	static add(...sprites: Sprite[]): Sprite[] {
		Resources.sprites.push(...sprites);
		return sprites;
	}

	static readonly sheet1 = Resources.add(
		...Sprite.fromGrid(sheet1Url, 4, 4, 910, 911),
	);

	static readonly grindingWheel = Resources.sheet1[0];
	static readonly bomb = Resources.sheet1.slice(1, 8);
	static readonly cloudIdle = Resources.sheet1.slice(8, 10);
	static readonly cloudStrike = Resources.sheet1.slice(10, 12);
	static readonly lightingIdle = Resources.sheet1.slice(12, 15);
	static readonly lightningStrike = Resources.sheet1[15];

	static readonly birdFrontSprites = Resources.add(
		new Sprite(bird_f1),
		new Sprite(bird_f2),
		new Sprite(bird_f3),
		new Sprite(bird_f4),
		new Sprite(bird_f5),
	) as [Sprite, Sprite, Sprite, Sprite, Sprite];

	static readonly birdRightSprites = Resources.add(
		new Sprite(bird_r1),
		new Sprite(bird_r2),
		new Sprite(bird_r3),
		new Sprite(bird_r4),
		new Sprite(bird_r5),
	) as [Sprite, Sprite, Sprite, Sprite, Sprite];
}
