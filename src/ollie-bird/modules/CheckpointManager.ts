import { toss } from 'toss-expression';
import { TAG_CHECKPOINT } from '../const';
import Module from '../core/Module';
import filterEvent from '../core/rxjs/filterEvent';
import Checkpoint from './Checkpoint';
import LevelGameplayManager from './LevelGameplayManager';

export default class CheckpointManager extends Module {
	static readonly displayName = 'Checkpoint Manager';

	protected override initialize(): void {
		super.initialize();

		const owner =
			this.owner.game
				.getObjects()
				.map((obj) => obj.getModule(LevelGameplayManager))
				.find((m) => m !== null) ??
			toss(
				new Error(
					`${CheckpointManager.displayName} requires a ${LevelGameplayManager.name}`,
				),
			);
		const subr = owner.event$
			.pipe(filterEvent('levelStart'))
			.subscribe(() => {
				const gates = owner.game
					.findObjectsByTag(TAG_CHECKPOINT)
					.map((obj) => obj.getModule(Checkpoint)!)
					.toArray();

				gates.sort((a, b) => a.sequenceNumber - b.sequenceNumber);

				gates.forEach((gate, index) => {
					gate.sequenceNumber = index + 1;
					gate.nextGate = gates[index + 1] || null;
					gate.state = index === 0 ? 'ready' : 'unavailable';
				});
			});

		this.disposableStack.use(subr);
	}

	static {
		Module.serializer.registerSerializationType('CheckpointManager', this);
	}
}
