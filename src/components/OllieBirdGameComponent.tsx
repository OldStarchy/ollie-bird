import { useEffect, useRef, useState } from 'react';
import OllieBirdGame from '../ollie-bird/OllieBirdGame';
import GameCanvas from './GameCanvas';
import LevelPicker from './LevelPicker';

declare global {
	interface GameEventMap {
		loadLevel: string;
		getLevelData: (data: string) => void;
	}
}

function OllieBirdGameComponent() {
	const canvasRef = useRef<{ focus(): void }>(null);
	const [game, setGame] = useState<OllieBirdGame>();

	useEffect(() => {
		const game = new OllieBirdGame();
		game.start();
		setGame(game);

		return () => {
			game.stop();
			setGame(undefined);
		};
	}, []);

	return (
		<div
			style={{
				width: '100%',
				height: '100%',
			}}
		>
			{game && (
				<>
					<div
						style={{
							position: 'absolute',
							top: 10,
							left: 10,
							zIndex: 1000,
						}}
					>
						<LevelPicker
							game={game}
							onClose={() => canvasRef.current?.focus()}
						/>
					</div>
					<GameCanvas
						game={game}
						ref={canvasRef}
						style={{ width: '100%', height: '100%' }}
					/>
				</>
			)}
		</div>
	);
}

export default OllieBirdGameComponent;
