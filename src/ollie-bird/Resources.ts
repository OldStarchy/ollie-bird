import baddie1 from '../assets/baddie-1.png';
import baddie2 from '../assets/baddie-2.png';
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
import sheet1Url from '../assets/sheet1.png';

import Sprite from './core/Sprite';

class ResourceMap<T> {
	#map = new Map<string, T>();

	constructor(public readonly name: string) {}

	getAll(): [string, T][] {
		return Array.from(this.#map.entries());
	}

	register(name: string, resource: T): void {
		if (this.#map.has(name)) {
			throw new Error(
				`${this.name} Resource with name ${name} is already registered`,
			);
		}
		this.#map.set(name, resource);
	}

	get(name: string): T {
		const resource = this.#map.get(name);
		if (!resource) {
			throw new Error(
				`${this.name} Resource with name ${name} not found`,
			);
		}
		return resource;
	}
}

export interface BirdSpriteSet {
	idle: Sprite;
	raise: Sprite;
	spread: Sprite;
	flap: Sprite;
	dive: Sprite;
}

export namespace BirdSpriteSet {
	export function create(
		idle: Sprite,
		raise: Sprite,
		spread: Sprite,
		flap: Sprite,
		dive: Sprite,
	): BirdSpriteSet {
		return {
			idle,
			raise,
			spread,
			flap,
			dive,
		};
	}
}

export default class Resources {
	static instance = new Resources();

	readonly sprite = new ResourceMap<Sprite>('Sprite');
	readonly spriteSet = new ResourceMap<readonly Sprite[]>('Sprite Sequence');
	readonly birdSpriteSet = new ResourceMap<BirdSpriteSet>('5 Sprites');

	getAllSprites(): Sprite[] {
		return [
			...this.sprite.getAll().map(([_, sprite]) => sprite),
			...this.spriteSet.getAll().flatMap(([_, sprites]) => sprites),
			...this.birdSpriteSet
				.getAll()
				.flatMap(
					([_, birdSprites]) =>
						Object.values(birdSprites) as Sprite[],
				),
		];
	}

	static {
		const sheet1 = Sprite.fromGrid(sheet1Url, 4, 4, 910, 911);

		this.instance.sprite.register('bomb', sheet1[1]);
		this.instance.spriteSet.register('bomb', sheet1.slice(1, 8));

		this.instance.sprite.register('grindingWheel', sheet1[0]);
		this.instance.spriteSet.register('cloudIdle', sheet1.slice(8, 10));
		this.instance.spriteSet.register('cloudStrike', sheet1.slice(10, 12));
		this.instance.spriteSet.register('lightingIdle', sheet1.slice(12, 15));
		this.instance.sprite.register('lightningStrike', sheet1[15]);

		const walkerSet = [new Sprite(baddie1), new Sprite(baddie2)] as const;
		this.instance.sprite.register('walker', walkerSet[0]);
		this.instance.spriteSet.register('walker', walkerSet);

		const birdF1 = new Sprite(bird_f1);
		this.instance.sprite.register('bird-icon', birdF1);

		this.instance.birdSpriteSet.register(
			'birdFrontSprites',
			BirdSpriteSet.create(
				birdF1,
				new Sprite(bird_f2),
				new Sprite(bird_f3),
				new Sprite(bird_f4),
				new Sprite(bird_f5),
			),
		);

		this.instance.birdSpriteSet.register(
			'birdRightSprites',
			BirdSpriteSet.create(
				new Sprite(bird_r1),
				new Sprite(bird_r2),
				new Sprite(bird_r3),
				new Sprite(bird_r4),
				new Sprite(bird_r5),
			),
		);
	}
}
