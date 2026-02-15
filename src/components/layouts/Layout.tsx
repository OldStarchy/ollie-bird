import {
	useCallback,
	useMemo,
	useState,
	type CSSProperties,
	type ReactNode,
} from 'react';
import { ReactInteropInspector } from '../../react-interop/ReactInteropInspector';
import Button from '../Button';
import useGameContext from '../GameContext';
import ObjectList from '../inspector/ObjectList';
import SelectedObjectInspector from '../inspector/SelectedObjectInspector';
import { useSelectedObject } from '../inspector/useSelectedObject';
import Rule from '../Rule';
import Spoiler from '../Spoiler';
import { LayoutContext } from './LayoutContext';
import ResourcesPanel from './ResourcesPanel';

export default function Layout({
	children,
	style,
}: {
	children: ReactNode;
	style?: CSSProperties;
}) {
	const [showSidebar, setShowSidebar] = useState(true);
	const [showAside, setShowAside] = useState(true);
	const [showHeader, setShowHeader] = useState(true);
	const [showFooter, setShowFooter] = useState(true);

	const toggleSidebar = useCallback(() => setShowSidebar((v) => !v), []);
	const toggleAside = useCallback(() => setShowAside((v) => !v), []);
	const toggleHeader = useCallback(() => setShowHeader((v) => !v), []);
	const toggleFooter = useCallback(() => setShowFooter((v) => !v), []);

	const game = useGameContext();

	const ctx = useMemo(
		() => ({
			showSidebar,
			toggleSidebar,
			showAside,
			toggleAside,
			showHeader,
			toggleHeader,
			showFooter,
			toggleFooter,
		}),
		[
			showSidebar,
			toggleSidebar,
			showAside,
			toggleAside,
			showHeader,
			toggleHeader,
			showFooter,
			toggleFooter,
		],
	);

	return (
		<LayoutContext.Provider value={ctx}>
			<div
				style={{
					display: 'grid',
					gridTemplateRows: 'auto 1fr auto',
					gridTemplateColumns: 'auto 1fr auto',
					gridTemplateAreas: `
					"header header header"
					"sidebar main aside"
					"footer footer footer"
				`,
					width: '100%',
					height: '100%',
					...style,
				}}
			>
				{showHeader && (
					<header
						style={{
							padding: '1rem',
							backgroundColor: '#282c34',
							color: 'white',
							gridArea: 'header',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'space-between',
						}}
					>
						<h1>My Application</h1>

						<Button
							onClick={() => {
								setShowSidebar(!showSidebar);
								setShowAside(!showSidebar);
								setShowFooter(!showSidebar);
							}}
						>
							Toggle Sidebars
						</Button>
					</header>
				)}
				{showSidebar && (
					<aside
						style={{
							padding: '1rem',
							gridArea: 'sidebar',
							overflowY: 'auto',
							width: '20rem',
						}}
					>
						<p>Game Config</p>
						<ReactInteropInspector model={game} />
						<Rule orientation="horizontal" />
						<ObjectList />
						<Rule orientation="horizontal" />
						<Spoiler title="Resources">
							<ResourcesPanel />
						</Spoiler>

						<SerializedView />
					</aside>
				)}
				<div
					style={{
						gridArea: 'main',
						position: 'relative',
					}}
				>
					<main
						style={{
							position: 'absolute',
							inset: 0,
							overflow: 'hidden',
						}}
					>
						{children}
					</main>
				</div>
				{showAside && (
					<aside
						style={{
							padding: '1rem',
							gridArea: 'aside',
							overflowY: 'auto',
							width: '20rem',
						}}
					>
						<SelectedObjectInspector />
					</aside>
				)}
				{showFooter && (
					<footer
						style={{
							padding: '1rem',
							textAlign: 'center',
							gridArea: 'footer',
						}}
					>
						Footer Content
					</footer>
				)}
			</div>
		</LayoutContext.Provider>
	);
}

function SerializedView() {
	const [obj, _] = useSelectedObject();

	if (!obj) {
		return null;
	}

	const serialized = obj.serialize();
	return (
		<div style={{ marginTop: '1rem' }}>
			<p>Serialized Data:</p>
			<pre
				style={{
					padding: '0.5rem',
					borderRadius: '4px',
					maxHeight: '200px',
					overflowY: 'auto',
				}}
			>
				{JSON.stringify(serialized, null, 2)}
			</pre>
		</div>
	);
}
