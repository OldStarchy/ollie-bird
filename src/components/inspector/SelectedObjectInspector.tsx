import { useMemo } from 'react';
import Module from '../../ollie-bird/core/IModular';
import { ReactInterop } from '../../react-interop/ReactInterop';
import { ReactInteropInspector } from '../../react-interop/ReactInteropInspector';
import { useSelectedObject } from './useSelectedObject';

export default function SelectedObjectInspector() {
	const [selectedObject] = useSelectedObject();

	const modules = useMemo(() => {
		if (!selectedObject) return [];
		return selectedObject.getModules(Module).toArray();
	}, [selectedObject]);

	if (!selectedObject) {
		return <div>No object selected</div>;
	}

	return (
		<div key={selectedObject.id}>
			<h3>Selected Object</h3>
			<p>Type: {selectedObject.constructor.name}</p>
			<p>
				Tags:{' '}
				{Array.from(selectedObject.tags, (tag) => tag.toString()).join(
					', ',
				)}
			</p>
			<hr />

			{ReactInterop.schema in selectedObject ? (
				<ReactInteropInspector
					model={selectedObject as unknown as ReactInterop<unknown>}
				/>
			) : (
				<p>This object has no directly inspectable properties.</p>
			)}

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
						{module.constructor.name}
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
