import {
	type Dispatch,
	type SetStateAction,
	useCallback,
	useEffect,
	useState,
} from 'react';
import type GameObject from '../../ollie-bird/core/GameObject';
import ObjectSelector from '../../ollie-bird/modules/ObjectSelector';
import toCallable from '../../toCallable';
import useGameContext from '../GameContext';

export function useSelectedObject(): [
	GameObject | null,
	Dispatch<SetStateAction<GameObject | null>>,
] {
	const game = useGameContext();

	const [objectSelector, setObjectSelector] = useState<ObjectSelector | null>(
		null,
	);
	const [selectedObject, setSelectedObjectState] =
		useState<GameObject | null>(null);

	useEffect(() => {
		const selector = game.findModuleByType(ObjectSelector);

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
		(
			obj:
				| GameObject
				| null
				| ((previous: GameObject | null) => GameObject | null),
		) => {
			if (objectSelector) {
				if (typeof obj !== 'function') {
					const val = obj;
					obj = () => val;
				}

				objectSelector.selectedObject = obj(
					objectSelector.selectedObject,
				);
			}
		},
		[objectSelector],
	);

	return [selectedObject, setSelectedObject];
}
