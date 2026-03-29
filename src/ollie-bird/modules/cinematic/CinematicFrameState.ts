export type CinematicFrameState = {
	// This rect defines a portion of the image to draw, normalized to 0-1 for
	// each axis. This would be a RectLike but animejs doesn't support nested
	// objects in its animation targets.
	// (0, 0, 1, 1) would draw the entire image, (0.5, 0, 0.5, 1) would draw the
	// right half of the image, etc.
	// The render code will scale this rect to fit the display size. Aspect ratio is not maintained

	/**
	 * Normalized left coordinate of the portion of the image to draw, from 0 to 1.
	 */
	x: number;

	/**
	 * Normalized top coordinate of the portion of the image to draw, from 0 to 1.
	 */
	y: number;

	/**
	 * Normalized width of the portion of the image to draw, from 0 to 1.
	 */
	width: number;

	/**
	 * Normalized height of the portion of the image to draw, from 0 to 1.
	 */
	height: number;

	/**
	 * Opacity of the image, from 0 (transparent) to 1 (opaque).
	 *
	 * opacity==0 frames are not rendered at all.
	 */
	opacity: number;
};
