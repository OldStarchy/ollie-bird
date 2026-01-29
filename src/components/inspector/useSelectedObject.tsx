import { type Dispatch, useCallback, useEffect, useState } from 'react';
import type GameObject from '../../ollie-bird/core/GameObject';
import LevelEditor from '../../ollie-bird/game-object/LevelEditor';
import ObjectSelector from '../../ollie-bird/modules/ObjectSelector';
import useGameContext from '../GameContext';

export function useSelectedObject(): [
	GameObject | null,
	Dispatch<GameObject | null>,
] {
	const game = useGameContext();

	const [objectSelector, setObjectSelector] = useState<ObjectSelector | null>(
		null,
	);
	const [selectedObject, setSelectedObjectState] =
		useState<GameObject | null>(null);

	useEffect(() => {
		const selector = game
			.findObjectsByType(LevelEditor)[0]
			?.getModule(ObjectSelector);

		setObjectSelector(selector ?? null);
	}, [game]);

	useEffect(() => {
		if (!objectSelector) return;

		const subscription = objectSelector.observe().subscribe(() => {
			setSelectedObjectState(objectSelector.selectedObject);
		});

		setSelectedObjectState(objectSelector.selectedObject);

		return () => {
			subscription.unsubscribe();
		};
	}, [objectSelector]);

	const setSelectedObject = useCallback(
		(obj: GameObject | null) => {
			if (objectSelector) {
				objectSelector.selectedObject = obj;
			}
		},
		[objectSelector],
	);

	return [selectedObject, setSelectedObject];
}
