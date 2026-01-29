import BaseGame from './core/BaseGame';
import LevelEditor from './game-object/LevelEditor';

class OllieBirdGame extends BaseGame {
	override preStart(): void {
		this.color = 'SkyBlue';
		this.spawn(LevelEditor);
	}
}

export default OllieBirdGame;
