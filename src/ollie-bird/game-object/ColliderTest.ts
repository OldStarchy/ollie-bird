import { CELL_SIZE } from '../const';
import GameObject from '../core/GameObject';
import Module from '../core/IModular';
import CircleCollider2d from '../modules/CircleCollider2d';
import Collider2d from '../modules/Collider2d';
import RectangleCollider2d from '../modules/RectangleCollider2d';

class ResetColors extends Module {
	defaultFill: string = 'rgba(0, 255, 0, 0.3)';
	defaultStroke: string = 'rgba(0, 255, 0, 1)';
	protected override initialize(): void {
		const colliderModule = this.owner.getModule(Collider2d)!;

		this.defaultFill = colliderModule.widgetFillStyle;
		this.defaultStroke = colliderModule.widgetStrokeStyle;
	}

	protected override beforeUpdate(): void {
		const colliderModule = this.owner.getModule(Collider2d)!;

		colliderModule.widgetFillStyle = this.defaultFill;
		colliderModule.widgetStrokeStyle = this.defaultStroke;
	}
}

export default class ColliderTest extends GameObject {
	protected override initialize(): void {
		const collider = this.addModule(CircleCollider2d);
		collider.center = { x: 0, y: 0 };
		collider.radius = 20;
		collider.renderWidget = true;

		const createRandomRectCollider = () => {
			const x = Math.floor((Math.random() * 800) / CELL_SIZE) * CELL_SIZE;
			const y = Math.floor((Math.random() * 600) / CELL_SIZE) * CELL_SIZE;
			const width = (Math.round(Math.random() * 5) + 1) * CELL_SIZE;
			const height = (Math.round(Math.random() * 5) + 1) * CELL_SIZE;

			const obj = this.game.spawn(GameObject);
			obj.transform.position.x = x;
			obj.transform.position.y = y;
			obj.addModule(ResetColors);

			const collider = obj.addModule(RectangleCollider2d, {
				x: 0,
				y: 0,
				width: width,
				height: height,
			});
			collider.renderWidget = true;
		};

		for (let i = 0; i < 20; i++) {
			createRandomRectCollider();
		}
	}

	protected override update(): void {
		this.transform.position.x = this.game.mouse.x;
		this.transform.position.y = this.game.mouse.y;

		const colliderModule = this.getModule(Collider2d)!;

		this.game
			.getObjects()
			.filter((obj) => obj !== this)
			.filter(Collider2d.collidingWith(colliderModule.getCollider()))
			.forEach((obj) => {
				const colliderModule = obj.getModule(Collider2d);
				if (colliderModule) {
					colliderModule.widgetFillStyle = 'rgba(255, 0, 0, 0.5)';
					colliderModule.widgetStrokeStyle = 'red';
				}
			});
	}
}
