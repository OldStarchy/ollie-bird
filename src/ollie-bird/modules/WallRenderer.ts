import wallBottomLeft from '../../assets/wall-bottom-left.png';
import wallBottomRight from '../../assets/wall-bottom-right.png';
import wallBottom from '../../assets/wall-bottom.png';
import wallCenter from '../../assets/wall-center.png';
import wallLeft from '../../assets/wall-left.png';
import wallRight from '../../assets/wall-right.png';
import wallTopLeft from '../../assets/wall-top-left.png';
import wallTopRight from '../../assets/wall-top-right.png';
import wallTop from '../../assets/wall-top.png';
import { CELL_SIZE } from '../const';
import type { Rect2Like } from '../core/math/Rect2';
import Module from '../core/Module';
import RectangleCollider2d from '../core/modules/colliders/RectangleCollider2d';

export default class WallRenderer extends Module {
	static readonly displayName = 'Wall Renderer';

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
		WallRenderer.sprites.wallTopLeft.src = wallTopLeft;
		WallRenderer.sprites.wallTopRight.src = wallTopRight;
		WallRenderer.sprites.wallBottomLeft.src = wallBottomLeft;
		WallRenderer.sprites.wallBottomRight.src = wallBottomRight;
		WallRenderer.sprites.wallLeft.src = wallLeft;
		WallRenderer.sprites.wallRight.src = wallRight;
		WallRenderer.sprites.wallTop.src = wallTop;
		WallRenderer.sprites.wallBottom.src = wallBottom;
		WallRenderer.sprites.wallCenter.src = wallCenter;
	}

	protected collider!: RectangleCollider2d;

	protected override initialize(): void {
		this.collider = this.getModule(RectangleCollider2d)!;
	}

	protected override render(context: CanvasRenderingContext2D) {
		const rectangle = this.collider;

		WallRenderer.renderWall(context, rectangle.getWorldRect());
	}

	static renderWall(
		context: CanvasRenderingContext2D,
		rectangle: Rect2Like,
		cellSize = CELL_SIZE,
	) {
		const { x, y, width, height } = rectangle;

		const hg = cellSize / 2;
		// Calculate grid dimensions (x, y, width, height are already grid-aligned)
		const gridWidth = width / cellSize + 1;
		const gridHeight = height / cellSize + 1;

		// Draw tiles for each grid position covered by this obstacle
		for (let gx = 0; gx < gridWidth; gx++) {
			for (let gy = 0; gy < gridHeight; gy++) {
				const tileX = x + gx * cellSize;
				const tileY = y + gy * cellSize;

				// Determine which sprite to use based on position
				const isLeft = gx === 0;
				const isRight = gx === gridWidth - 1;
				const isTop = gy === 0;
				const isBottom = gy === gridHeight - 1;

				let sprite: HTMLImageElement;

				if (isTop && isLeft) {
					// Top-left corner
					sprite = WallRenderer.sprites.wallTopLeft;
				} else if (isTop && isRight) {
					// Top-right corner
					sprite = WallRenderer.sprites.wallTopRight;
				} else if (isBottom && isLeft) {
					// Bottom-left corner
					sprite = WallRenderer.sprites.wallBottomLeft;
				} else if (isBottom && isRight) {
					// Bottom-right corner
					sprite = WallRenderer.sprites.wallBottomRight;
				} else if (isTop) {
					// Top edge
					sprite = WallRenderer.sprites.wallTop;
				} else if (isBottom) {
					// Bottom edge
					sprite = WallRenderer.sprites.wallBottom;
				} else if (isLeft) {
					// Left edge
					sprite = WallRenderer.sprites.wallLeft;
				} else if (isRight) {
					// Right edge
					sprite = WallRenderer.sprites.wallRight;
				} else {
					// Interior tile
					sprite = WallRenderer.sprites.wallCenter;
				}

				// Draw the sprite
				context.drawImage(
					sprite,
					tileX - hg,
					tileY - hg,
					cellSize,
					cellSize,
				);
			}
		}
	}

	static {
		Module.serializer.registerSerializationType('WallRenderer', this);
	}
}
