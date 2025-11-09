import { useEffect, useRef } from 'react';
import OllieBirdGame from '../ollie-bird/OllieBirdGame';

function OllieBirdGameComponent() {
	const rootRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		if (!rootRef.current) return;

		const game = new OllieBirdGame(rootRef.current);
		game.start();

		return () => {
			game.stop();
		};
	}, []);

	return (
		<canvas
			style={{
				width: '100%',
				height: '100%',
				display: 'block',
			}}
			ref={rootRef}
		/>
	);
}

export default OllieBirdGameComponent;
