// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type GameObject from '../GameObject';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type Collider2d from '../modules/Collider2d';

/**
 * Represents a shape that can be used for collision detection.
 *
 * Colliders are short-lived readonly objects. For a moving object, a new
 * collider should be created for each frame encoding the position and shape of
 * the object for that instant. Conveniently, for each collider shape, there is
 * a corresponding {@link Collider2d} Module that can be attached to a
 * {@link GameObject} to handle collision detection.
 *
 * ## Shape Precedence
 *
 * Since collision detection between two different shapes can can be defined on
 * either shape, the `precedence` property is used to determine which shape's
 * `checkCollision` method should be used when checking for collisions between two
 * shapes of different types.
 *
 * eg. the Rectangle - Circle collision is handled by the Rectangle because it
 * has a higher precedence (2) than the Circle (1). When adding a new shape,
 * give it a precedence 1 higher than the previous highest precedence, and
 * implement collision detection with all existing shapes that have a lower
 * precedence, in addition to collisions of the same shape.
 *
 * {@link checkCollision} should handle resolution of precedence, and invert the
 * collision check if the other shape has a higher precedence.
 *
 * ```ts
 * checkCollision(other: ColliderShape): boolean {
 *   if (this.precedence < other.precedence) {
 *     return other.checkCollision(this);
 *   }
 *
 *   // handle collisions with other shapes
 * }
 * ```
 */
export default interface ColliderShape {
	readonly precedence: number;

	/**
	 * Returns true if this shape is overlapping with the other shape.
	 */
	checkCollision(other: ColliderShape): boolean;
}
