import { LAYER_ITEMS, TAG_LEVEL_STRUCTURE } from '../const';
import Collider2d from '../modules/Collider2d';
import Bird from './Bird';
import RectangleTrigger from './RectangleTrigger';

export default class SequentialGate extends RectangleTrigger {
	layer = LAYER_ITEMS;

	state: 'unavailable' | 'ready' | 'passed' = 'unavailable';

	sequenceNumber: number = 0;
	nextGate: SequentialGate | null = null;

	protected override initialize(): void {
		this.tags.add('sequential-gate');
		this.tags.add(TAG_LEVEL_STRUCTURE);
	}

	protected override update(): void {
		if (this.state !== 'ready') return;

		const hitABird =
			this.game
				.findObjectsByType(Bird)
				.filter(Collider2d.collidingWith(this.collider.getCollider()))
				.length > 0;

		if (hitABird) {
			this.state = 'passed';
			if (this.nextGate) {
				this.nextGate.state = 'ready';
			}
		}
	}

	protected override render(context: CanvasRenderingContext2D): void {
		const color = (() => {
			switch (this.state) {
				case 'unavailable':
					return 'gray';
				case 'ready':
					return 'green';
				case 'passed':
					return 'yellow';
			}
		})();

		context.fillStyle = color;
		context.fillRect(
			...this.transform.position.xy,
			this.width,
			this.height,
		);

		const cx = this.transform.position.x + this.width / 2;
		const cy = this.transform.position.y + this.height / 2;

		context.save();
		context.fillStyle = 'black';
		context.textAlign = 'center';
		context.textBaseline = 'middle';
		context.font = '30px sans-serif';
		context.fillText(this.sequenceNumber.toString(), cx, cy);
		context.restore();
	}
}
