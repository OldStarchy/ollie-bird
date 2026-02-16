import { z } from 'zod';
import contextCheckpoint from '../../contextCheckpoint';
import Module from '../core/Module';
import Collider2d from '../core/modules/Collider2d';
import Bird from '../game-object/Bird';

export const checkpointDtoSchema = z.object({
	sequenceNumber: z.number(),
});

export type CheckpointDto = z.input<typeof checkpointDtoSchema>;

export default class Checkpoint extends Module {
	static readonly defaultName: string = 'Checkpoint';

	state: 'unavailable' | 'ready' | 'passed' = 'unavailable';

	accessor sequenceNumber: number = 0;
	nextGate: Checkpoint | null = null;

	private collider!: Collider2d;

	protected override initialize(): void {
		super.initialize();
		this.collider = this.getModule(Collider2d)!;
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
		const [bg, fg] = (() => {
			switch (this.state) {
				case 'unavailable':
					return [
						'rgba(128, 128, 128, 0.3)',
						'rgba(128, 128, 128, 1)',
					];
				case 'ready':
					return ['rgba(0, 255, 0, 0.3)', 'rgba(0, 255, 0, 1)'];
				case 'passed':
					return ['rgba(255, 255, 0, 0.3)', 'rgba(255, 255, 0, 1)'];
			}
		})();

		const { x: cx, y: cy } = this.collider.getWorldCenter();
		this.collider.widgetFillStyle = bg;
		this.collider.widgetStrokeStyle = fg;
		this.collider.doRenderGizmos(context);

		using _ = contextCheckpoint(context);
		context.fillStyle = 'black';
		context.textAlign = 'center';
		context.textBaseline = 'middle';
		context.font = '30px sans-serif';
		context.fillText(this.sequenceNumber.toString(), cx, cy);
	}

	static {
		Module.serializer.registerSerializationType('Checkpoint', this);
	}
}
