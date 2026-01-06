import { useMemo } from 'react';
import Resources from '../../ollie-bird/Resources';
import useGameContext from '../GameContext';
import PropertiesPanel from '../PropertiesPanel';

export default function ResourcesPanel() {
	const _game = useGameContext();

	const sprites = useMemo(() => Resources.sprites, []);

	return (
		<div>
			{sprites.map((sprite, index) => (
				<div key={index}>
					<PropertiesPanel model={sprite} />
				</div>
			))}
		</div>
	);
}
