import sheet1Url from '../assets/sheet1.png';
import tankUrl from '../assets/tank.png';
import Sprite from './core/Sprite';
import Rect2 from './math/Rect2';

export default class Resources {
	static readonly sheet1 = Sprite.fromGrid(sheet1Url, 4, 4, 910, 911);

	static readonly grindingWheel = Resources.sheet1[0];
	static readonly bomb = Resources.sheet1.slice(1, 8);
	static readonly cloudIdle = Resources.sheet1.slice(8, 10);
	static readonly cloudStrike = Resources.sheet1.slice(10, 12);
	static readonly lightingIdle = Resources.sheet1.slice(12, 15);
	static readonly lightningStrike = Resources.sheet1[15];

	static readonly shooterBody = new Sprite(
		tankUrl,
		new Rect2(0, 0, 100, 100),
	);
	static readonly shooterGun = new Sprite(
		tankUrl,
		new Rect2(100, 0, 100, 50),
	);
	static readonly shooterPellet = new Sprite(
		tankUrl,
		new Rect2(125, 50, 50, 50),
	);
}
