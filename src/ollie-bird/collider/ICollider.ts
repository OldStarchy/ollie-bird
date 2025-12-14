import type { Vec2Like } from '../Vec2';

export default interface ICollider {
	checkCollision(
		position: Vec2Like,
		other: ICollider,
		otherPosition: Vec2Like,
	): boolean;
}
