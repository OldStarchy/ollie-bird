import { z } from 'zod';
import contextCheckpoint from '../../contextCheckpoint';
import { Layer, TAG_LEVEL_STRUCTURE } from '../const';
import type IGame from '../core/IGame';
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

	layer = Layer.Items;

	state: 'unavailable' | 'ready' | 'passed' = 'unavailable';

	readonly serializationKey = 'SequentialGate';

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

		using _ = contextCheckpoint(context);
		context.fillStyle = 'black';
		context.textAlign = 'center';
		context.textBaseline = 'middle';
		context.font = '30px sans-serif';
		context.fillText(this.sequenceNumber.toString(), cx, cy);
	}

	override serialize(): SequentialGateDto {
		return {
			...super.serialize(),
			sequenceNumber: this.sequenceNumber,
		};
	}

	static spawnDeserialize(game: IGame, data: unknown): SequentialGate {
		const parseResult = sequentialGateDtoSchema.parse(data);

		const { x, y, width, height, sequenceNumber } = parseResult;
		const gate = game.spawn(SequentialGate);
		gate.transform.position.set(x, y);
		gate.setSize(width, height);
		gate.sequenceNumber = sequenceNumber;
		return gate;
	}
}
