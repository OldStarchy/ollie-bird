import { TAG_LEVEL_STRUCTURE } from '../const';
import RectangleTrigger from './RectangleTrigger';

class Goal extends RectangleTrigger {
	init() {
		super.init();
		this.style = 'green';
		this.tags.add(TAG_LEVEL_STRUCTURE);
	}
}

export default Goal;
