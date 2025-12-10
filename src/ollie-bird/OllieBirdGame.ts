import BaseGame from './BaseGame';
import LevelEditor from './game-object/LevelEditor';

class OllieBirdGame extends BaseGame {
	override preStart(): void {
		this.backgroundColor = 'skyblue';
		this.spawn(LevelEditor);
	}
}

export default OllieBirdGame;
