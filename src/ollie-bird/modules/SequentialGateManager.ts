import type GameObject from '../core/GameObject';
import Module from '../core/IModular';
import SequentialGate from '../game-object/SequentialGate';

export default class SequentialGateManager extends Module {
	protected override initialize(): void {
		super.initialize();

		const owner = this.owner as GameObject;
		(owner as GameObject).onGameEvent('gameStart', () => {
			const gates = owner.game.findObjectsByType(SequentialGate);

			gates.sort((a, b) => a.sequenceNumber - b.sequenceNumber);

			gates.forEach((gate, index) => {
				gate.sequenceNumber = index + 1;
				gate.nextGate = gates[index + 1] || null;
				gate.state = index === 0 ? 'ready' : 'unavailable';
			});
		});
	}
}
