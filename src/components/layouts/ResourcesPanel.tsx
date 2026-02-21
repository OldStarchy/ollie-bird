import { useMemo } from 'react';
import Resources from '../../ollie-bird/Resources';
import { SpriteEditor } from '../SpriteEditor';

export default function ResourcesPanel() {
	// const _game = useGameContext();

	const sprites = useMemo(() => Resources.instance.getAllSprites(), []);

	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				gap: '1em',
			}}
		>
			{sprites.map((sprite, index) => (
				<div
					key={index}
					style={{ background: '#333', padding: '0.5rem' }}
				>
					<SpriteEditor sprite={sprite} />
				</div>
			))}
		</div>
	);
}
