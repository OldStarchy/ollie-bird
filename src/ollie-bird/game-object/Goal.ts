import { TAG_LEVEL_STRUCTURE } from '../const';
import RectangleTrigger from './RectangleTrigger';

class Goal extends RectangleTrigger {
	static readonly defaultName: string = 'Goal';

	readonly serializationKey = 'Goal';

	protected override initialize() {
		super.initialize();
		this.style = 'green';
		this.tags.add(TAG_LEVEL_STRUCTURE);
	}
}

export default Goal;
