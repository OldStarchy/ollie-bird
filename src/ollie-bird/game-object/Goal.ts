import { TAG_LEVEL_STRUCTURE } from '../const';
import type IGame from '../core/IGame';
import RectangleTrigger, {
	rectangleTriggerDtoSchema,
} from './RectangleTrigger';

class Goal extends RectangleTrigger {
	readonly serializationKey = 'Goal';

	protected override initialize() {
		super.initialize();
		this.style = 'green';
		this.tags.add(TAG_LEVEL_STRUCTURE);
	}

	static spawnDeserialize(game: IGame, data: unknown): Goal | null {
		const parseResult = rectangleTriggerDtoSchema.safeParse(data);
		if (!parseResult.success) {
			console.error('Failed to parse Goal data:', parseResult.error);
			return null;
		}

		const { x, y, width, height } = parseResult.data;
		const goal = game.spawn(Goal);
		goal.transform.position.set(x, y);
		goal.setSize(width, height);
		return goal;
	}
}

export default Goal;
