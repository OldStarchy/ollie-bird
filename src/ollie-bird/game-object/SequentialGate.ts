import { z } from 'zod';
import contextCheckpoint from '../../contextCheckpoint';
import { Layer, TAG_LEVEL_STRUCTURE } from '../const';
import Collider2d from '../core/modules/Collider2d';
import Bird from './Bird';
import RectangleTrigger, {
	rectangleTriggerDtoSchema,
} from './RectangleTrigger';

export const sequentialGateDtoSchema = rectangleTriggerDtoSchema.extend({
	sequenceNumber: z.number(),
});

export type SequentialGateDto = z.infer<typeof sequentialGateDtoSchema>;

export default class SequentialGate extends RectangleTrigger {
	static readonly defaultName: string = 'Sequential Gate';

	state: 'unavailable' | 'ready' | 'passed' = 'unavailable';

	readonly serializationKey = 'SequentialGate';

	sequenceNumber: number = 0;
	nextGate: SequentialGate | null = null;

	protected override initialize(): void {
		super.initialize();
		this.layer = Layer.Items;

		this.tags.add('sequential-gate');
		this.tags.add(TAG_LEVEL_STRUCTURE);
	}

	protected override update(): void {
		if (this.state !== 'ready') return;

		const bird =
			this.game
				.findObjectsByType(Bird)
				.filter(
					Collider2d.collidingWith(this.collider.getCollider()),
				)[0] ?? null;

		if (bird) {
			this.state = 'passed';

			bird.controls.Vibrate?.playEffect('dual-rumble', {
				duration: 50,
				startDelay: 0,
				strongMagnitude: 0.5,
				weakMagnitude: 0.0,
			});

			if (this.nextGate) {
				this.nextGate.state = 'ready';
			}
		}
	}

	protected override render(context: CanvasRenderingContext2D): void {
		const { x, y, width, height } = this.collider.getWorldRect();

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
		context.fillRect(x, y, width, height);

		const cx = x + width / 2;
		const cy = y + height / 2;

		using _ = contextCheckpoint(context);
		context.fillStyle = 'black';
		context.textAlign = 'center';
		context.textBaseline = 'middle';
		context.font = '30px sans-serif';
		context.fillText(this.sequenceNumber.toString(), cx, cy);
	}
}
