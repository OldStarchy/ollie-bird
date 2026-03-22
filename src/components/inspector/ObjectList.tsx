import {
	useCallback,
	useEffect,
	useRef,
	useState,
	type ReactNode,
} from 'react';
import { TAG_EDITOR_OBJECT } from '../../ollie-bird/const';
import type GameObject from '../../ollie-bird/core/GameObject';
import toCallable from '../../toCallable';
import useGameContext from '../GameContext';
import Pill from '../Pill';
import { useSelectedObject } from './useSelectedObject';

export default function ObjectList() {
	const game = useGameContext();

	const rootRef = useRef<HTMLDivElement>(null);
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
		setSelectedObject((selectedObject) => {
			if (!selectedObject) {
				return selectedObject;
			}
			if (selectedObject.tags.has(TAG_EDITOR_OBJECT)) {
				alert(
					`Deleting editor objects will break the editor. If you really want to delete this, remove the ${TAG_EDITOR_OBJECT} tag.`,
				);
				return selectedObject;
			}

			const index = objects.findIndex(
				(obj) => obj.id === selectedObject.id,
			);
			if (index === -1) return selectedObject;

			game.destroy(selectedObject);
			return objects.at(index + 1) ?? null;
		});
	}, [game, objects, setSelectedObject]);

	const handleKeyDown = useCallback(
		(e: KeyboardEvent) => {
			switch (e.key) {
				case 'Delete':
				case 'Backspace':
					e.preventDefault();
					deleteSelectedObject();
					break;
				case 'ArrowUp': {
					e.preventDefault();
					setSelectedObject((selectedObject) => {
						if (!selectedObject) return null;

						const index = objects.findIndex(
							(obj) => obj.id === selectedObject.id,
						);
						if (index < 1) return selectedObject;
						return objects.at(index - 1) ?? null;
					});
					break;
				}
				case 'ArrowDown': {
					e.preventDefault();
					setSelectedObject((selectedObject) => {
						if (!selectedObject) return null;

						const index = objects.findIndex(
							(obj) => obj.id === selectedObject.id,
						);
						if (index === -1 || index === objects.length - 1)
							return selectedObject;
						return objects.at(index + 1) ?? null;
					});
					break;
				}
				case 'Home': {
					e.preventDefault();
					if (objects.length === 0) return;
					setSelectedObject(objects.at(0) ?? null);
					break;
				}
				case 'End': {
					e.preventDefault();
					if (objects.length === 0) return;
					setSelectedObject(objects.at(-1) ?? null);
					break;
				}
				default:
					break;
			}
		},
		[deleteSelectedObject, objects, setSelectedObject],
	);

	useEffect(() => {
		if (!rootRef.current) return;

		const ctrl = new AbortController();
		rootRef.current.addEventListener('keydown', handleKeyDown, {
			signal: ctrl.signal,
		});
		return () => ctrl.abort();
	}, [handleKeyDown]);

	return (
		<div ref={rootRef} tabIndex={-1}>
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
	const liRef = useRef<HTMLLIElement>(null);

	useEffect(() => {
		const sub = obj.change$.subscribe(() => {
			setName(obj.name);
		});
		setName(obj.name);

		return toCallable(sub);
	}, [obj]);

	useEffect(() => {
		if (selected && liRef.current) {
			liRef.current.scrollIntoView({ block: 'nearest' });
		}
	}, [selected]);

	return (
		<li
			ref={liRef}
			style={{
				background: selected ? 'rgba(0, 120, 215, 0.3)' : 'transparent',
				cursor: 'pointer',
				userSelect: 'none',
			}}
			key={obj.id}
			value={obj.id}
			onClick={() => onSelect(obj)}
		>
			{name}
			{obj.tags.size > 0 && (
				<>
					{' '}
					(
					{Array.from(obj.tags)
						.map(
							(tag) =>
								(
									<Pill
										key={tag}
										style={{
											backgroundColor: colorFromHash(tag),
										}}
									>
										{tag}
									</Pill>
								) as ReactNode,
						)
						.reduce((prev, curr) => [prev, ', ', curr])}
					)
				</>
			)}
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
