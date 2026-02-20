import { type Dispatch, useCallback, useEffect, useState } from 'react';
import type GameObject from '../../ollie-bird/core/GameObject';
import ObjectSelector from '../../ollie-bird/modules/ObjectSelector';
import toCallable from '../../toCallable';
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
		const selector =
			game
				.getObjects()
				.map((obj) => obj.getModule(ObjectSelector))
				.find((m) => m) ?? null;

		setObjectSelector(selector);
	}, [game]);

	useEffect(() => {
		if (!objectSelector) return;

		const subscription = objectSelector.observe().subscribe(() => {
			setSelectedObjectState(objectSelector.selectedObject);
		});

		setSelectedObjectState(objectSelector.selectedObject);

		return toCallable(subscription);
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
