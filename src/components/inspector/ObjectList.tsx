import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { TAG_EDITOR_OBJECT } from '../../ollie-bird/const';
import type GameObject from '../../ollie-bird/core/GameObject';
import toCallable from '../../toCallable';
import useGameContext from '../GameContext';
import Pill from '../Pill';
import { useSelectedObject } from './useSelectedObject';

export default function ObjectList() {
	const game = useGameContext();

	const [objects, setObjects] = useState<GameObject[]>([]);
	const [selectedObject, setSelectedObject] = useSelectedObject();

	useEffect(() => {
		const sub = game.gameObjects$.subscribe(() => {
			setObjects(game.getObjects().toArray());
		});
		setObjects(game.getObjects().toArray());

		return toCallable(sub);
	}, [game]);

	const deleteSelectedObject = useCallback(() => {
		if (selectedObject) {
			if (selectedObject.tags.has(TAG_EDITOR_OBJECT)) {
				alert(
					`Deleting editor objects will break the editor. If you really want to delete this, remove the ${TAG_EDITOR_OBJECT} tag.`,
				);
				return;
			}

			game.destroy(selectedObject);
		}
	}, [game, selectedObject]);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Delete' || e.key === 'Backspace') {
				deleteSelectedObject();
			}
		};
		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [deleteSelectedObject]);

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

		return toCallable(sub);
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
			{name} (
			{Array.from(obj.tags)
				.map(
					(tag) =>
						(
							<Pill
								key={tag}
								style={{ backgroundColor: colorFromHash(tag) }}
							>
								{tag}
							</Pill>
						) as ReactNode,
				)
				.reduce((prev, curr) => [prev, ', ', curr])}
			)
		</li>
	);
}

function colorFromHash(str: string) {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		hash = str.charCodeAt(i) + ((hash << 5) - hash) + Math.E * 10001;
	}
	const color = `hsl(${hash % 360}, 70%, 20%)`;
	return color;
}
