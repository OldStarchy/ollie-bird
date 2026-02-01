import { useEffect, useState } from 'react';
import type GameObject from '../../ollie-bird/core/GameObject';
import useGameContext from '../GameContext';
import { useSelectedObject } from './useSelectedObject';

export default function ObjectList() {
	const game = useGameContext();

	const [objects, setObjects] = useState<GameObject[]>([]);
	const [selectedObject, setSelectedObject] = useSelectedObject();

	useEffect(() => {
		const sub = game.gameObjects$.subscribe(() => {
			setObjects(game.getObjects());
		});
		setObjects(game.getObjects());

		return () => {
			sub.unsubscribe();
		};
	}, [game]);

	return (
		<div>
			<h3>Game Objects</h3>
			<ul>
				{objects.map((obj) => {
					const selected = selectedObject?.id === obj.id;
					return (
						<GameObjectListEntry
							selected={selected}
							key={obj.id}
							obj={obj}
							onSelect={() => setSelectedObject(obj)}
						/>
					);
				})}
			</ul>
		</div>
	);
}

function GameObjectListEntry({
	obj,
	selected,
	onSelect,
}: {
	obj: GameObject;
	selected: boolean;
	onSelect: (obj: GameObject) => void;
}) {
	const [name, setName] = useState(obj.name);

	useEffect(() => {
		const sub = obj.change$.subscribe(() => {
			setName(obj.name);
		});
		setName(obj.name);

		return () => {
			sub.unsubscribe();
		};
	}, [obj]);

	return (
		<li
			style={{
				background: selected ? 'rgba(0, 120, 215, 0.3)' : 'transparent',
				cursor: 'pointer',
				userSelect: 'none',
			}}
			key={obj.id}
			value={obj.id}
			onClick={() => onSelect(obj)}
		>
			{name} ({obj.name}) ({Array.from(obj.tags).join(', ')})
		</li>
	);
}
