import sheet1Url from '../assets/sheet1.png';
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
}
