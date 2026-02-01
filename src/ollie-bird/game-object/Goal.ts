import { TAG_LEVEL_STRUCTURE } from '../const';
import type IGame from '../core/IGame';
import RectangleTrigger, {
	rectangleTriggerDtoSchema,
} from './RectangleTrigger';

class Goal extends RectangleTrigger {
	static readonly defaultName: string = 'Goal';

	readonly serializationKey = 'Goal';

	protected override initialize() {
		super.initialize();
		this.style = 'green';
		this.tags.add(TAG_LEVEL_STRUCTURE);
	}

	static spawnDeserialize(game: IGame, data: unknown): Goal {
		const parseResult = rectangleTriggerDtoSchema.parse(data);

		const { x, y, width, height } = parseResult;
		const goal = game.spawn(Goal);
		goal.transform.position.set(x, y);
		goal.setSize(width, height);
		return goal;
	}
}

export default Goal;
