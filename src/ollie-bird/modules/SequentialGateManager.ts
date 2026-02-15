import { toss } from 'toss-expression';
import Module from '../core/Module';
import filterEvent from '../core/rxjs/filterEvent';
import LevelEditor from '../game-object/LevelEditor';
import SequentialGate from '../game-object/SequentialGate';

export default class SequentialGateManager extends Module {
	static readonly displayName = 'SequentialGateManager';

	protected override initialize(): void {
		super.initialize();

		const owner =
			this.game.findObjectsByType(LevelEditor)[0] ??
			toss(
				new Error(
					`${SequentialGateManager.displayName} requires a ${LevelEditor.name}`,
				),
			);
		const subr = owner.levelEvent$
			.pipe(filterEvent('levelStart'))
			.subscribe(() => {
				const gates = owner.game.findObjectsByType(SequentialGate);

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
		Module.serializer.registerSerializationType(
			'SequentialGateManager',
			this,
		);
	}
}
