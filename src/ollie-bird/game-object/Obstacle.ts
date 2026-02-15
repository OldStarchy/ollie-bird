import { CELL_SIZE, TAG_DEADLY, TAG_LEVEL_STRUCTURE } from '../const';
import RectangleTrigger from './RectangleTrigger';

import wallBottomLeft from '../../assets/wall-bottom-left.png';
import wallBottomRight from '../../assets/wall-bottom-right.png';
import wallBottom from '../../assets/wall-bottom.png';
import wallCenter from '../../assets/wall-center.png';
import wallLeft from '../../assets/wall-left.png';
import wallRight from '../../assets/wall-right.png';
import wallTopLeft from '../../assets/wall-top-left.png';
import wallTopRight from '../../assets/wall-top-right.png';
import wallTop from '../../assets/wall-top.png';

class Obstacle extends RectangleTrigger {
	static readonly defaultName: string = 'Obstacle';

	static sprites = {
		wallTopLeft: new Image(),
		wallTopRight: new Image(),
		wallBottomLeft: new Image(),
		wallBottomRight: new Image(),
		wallLeft: new Image(),
		wallRight: new Image(),
		wallTop: new Image(),
		wallBottom: new Image(),
		wallCenter: new Image(),
	};

	static {
		Obstacle.sprites.wallTopLeft.src = wallTopLeft;
		Obstacle.sprites.wallTopRight.src = wallTopRight;
		Obstacle.sprites.wallBottomLeft.src = wallBottomLeft;
		Obstacle.sprites.wallBottomRight.src = wallBottomRight;
		Obstacle.sprites.wallLeft.src = wallLeft;
		Obstacle.sprites.wallRight.src = wallRight;
		Obstacle.sprites.wallTop.src = wallTop;
		Obstacle.sprites.wallBottom.src = wallBottom;
		Obstacle.sprites.wallCenter.src = wallCenter;
	}

	readonly serializationKey = 'Obstacle';

	protected override initialize() {
		super.initialize();
		this.style = 'red';
		this.tags.add(TAG_LEVEL_STRUCTURE);
		this.tags.add(TAG_DEADLY);
	}

	protected override render(context: CanvasRenderingContext2D) {
		const hg = CELL_SIZE / 2;
		// Calculate grid dimensions (x, y, width, height are already grid-aligned)
		const gridWidth = this.width / CELL_SIZE + 1;
		const gridHeight = this.height / CELL_SIZE + 1;

		// Draw tiles for each grid position covered by this obstacle
		for (let gx = 0; gx < gridWidth; gx++) {
			for (let gy = 0; gy < gridHeight; gy++) {
				const tileX = this.transform.position.x + gx * CELL_SIZE;
				const tileY = this.transform.position.y + gy * CELL_SIZE;

				// Determine which sprite to use based on position
				const isLeft = gx === 0;
				const isRight = gx === gridWidth - 1;
				const isTop = gy === 0;
				const isBottom = gy === gridHeight - 1;

				let sprite: HTMLImageElement;

				if (isTop && isLeft) {
					// Top-left corner
					sprite = Obstacle.sprites.wallTopLeft;
				} else if (isTop && isRight) {
					// Top-right corner
					sprite = Obstacle.sprites.wallTopRight;
				} else if (isBottom && isLeft) {
					// Bottom-left corner
					sprite = Obstacle.sprites.wallBottomLeft;
				} else if (isBottom && isRight) {
					// Bottom-right corner
					sprite = Obstacle.sprites.wallBottomRight;
				} else if (isTop) {
					// Top edge
					sprite = Obstacle.sprites.wallTop;
				} else if (isBottom) {
					// Bottom edge
					sprite = Obstacle.sprites.wallBottom;
				} else if (isLeft) {
					// Left edge
					sprite = Obstacle.sprites.wallLeft;
				} else if (isRight) {
					// Right edge
					sprite = Obstacle.sprites.wallRight;
				} else {
					// Interior tile
					sprite = Obstacle.sprites.wallCenter;
				}

				// Draw the sprite
				context.drawImage(
					sprite,
					tileX - hg,
					tileY - hg,
					CELL_SIZE,
					CELL_SIZE,
				);
			}
		}
	}
}

export default Obstacle;
