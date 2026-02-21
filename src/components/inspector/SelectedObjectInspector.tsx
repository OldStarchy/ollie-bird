import { useMemo } from 'react';
import Module from '../../ollie-bird/core/Module';
import {
	ReactInterop,
	useReactInterop,
} from '../../react-interop/ReactInterop';
import { ReactInteropInspector } from '../../react-interop/ReactInteropInspector';
import { useSelectedObject } from './useSelectedObject';

export default function SelectedObjectInspector() {
	const [selectedObject] = useSelectedObject();

	const modules = useMemo(() => {
		if (!selectedObject) return [];
		return selectedObject.getModulesByType(Module).toArray();
	}, [selectedObject]);

	const [data] = useReactInterop(selectedObject);

	if (!selectedObject || !data) {
		return <div>No object selected</div>;
	}

	return (
		<div key={selectedObject.id}>
			<h3>Selected Object</h3>
			<p>Type: {selectedObject.constructor.defaultName}</p>
			<p>
				Tags:{' '}
				{Array.from(data.tags, (tag) => tag.toString()).join(', ')}
			</p>
			<hr />

			<ReactInteropInspector model={selectedObject} />

			{modules.map((module, index) => (
				<div
					key={index}
					style={{
						marginTop: '1em',
						border: '1px groove #ccc',
						padding: '1em 0.5em 0.5em',
						position: 'relative',
					}}
				>
					<h4
						style={{
							position: 'absolute',
							top: '0',
							transform: `translateY(-50%)`,
							background: 'black',
							padding: '0 0.5em',
						}}
					>
						{module.constructor.displayName}
					</h4>
					{ReactInterop.schema in module ? (
						<ReactInteropInspector
							model={module as unknown as ReactInterop<unknown>}
						/>
					) : (
						<p>This module is not inspectable.</p>
					)}
				</div>
			))}
		</div>
	);
}
