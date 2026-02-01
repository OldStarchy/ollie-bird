import { z } from 'zod';
import ContextSave from '../../ContextSave';
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
	layer = Layer.Items;

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

		using _ = new ContextSave(context);
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

	static spawnDeserialize(game: IGame, data: unknown): SequentialGate | null {
		const parseResult = sequentialGateDtoSchema.safeParse(data);
		if (!parseResult.success) {
			console.error(
				'Failed to parse SequentialGate data:',
				parseResult.error,
			);
			return null;
		}

		const { x, y, width, height, sequenceNumber } = parseResult.data;
		const gate = game.spawn(SequentialGate);
		gate.transform.position.set(x, y);
		gate.setSize(width, height);
		gate.sequenceNumber = sequenceNumber;
		return gate;
	}
}
