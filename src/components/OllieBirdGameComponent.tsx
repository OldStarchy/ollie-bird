import { useEffect, useRef, useState } from 'react';
import OllieBirdGame from '../ollie-bird/OllieBirdGame';
import GameCanvas from './GameCanvas';
import { GameContext } from './GameContext';
import LevelPicker from './LevelPicker';
import Layout from './layouts/Layout';

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
		<GameContext.Provider value={game || null}>
			{game && (
				<Layout style={{ width: '100vw', height: '100vh' }}>
					<div
						style={{
							width: '100%',
							height: '100%',
						}}
					>
						<div
							style={{
								position: 'absolute',
								top: 10,
								left: 10,
								zIndex: 1000,
							}}
						>
							<LevelPicker
								onClose={() => canvasRef.current?.focus()}
							/>
						</div>
						<GameCanvas
							game={game}
							ref={canvasRef}
							style={{ width: '100%', height: '100%' }}
						/>
					</div>
				</Layout>
			)}
		</GameContext.Provider>
	);
}

export default OllieBirdGameComponent;
