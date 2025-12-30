import {
	useCallback,
	useMemo,
	useState,
	type CSSProperties,
	type ReactNode,
} from 'react';
import Button from '../Button';
import { useGameContext } from '../OllieBirdGameComponent';
import PropertiesPanel from '../PropertiesPanel';
import Rule from '../Rule';
import { LayoutContext } from './LayoutContext';

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

	if (!game) return;
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
						}}
					>
						<h1>My Application</h1>
					</header>
				)}
				{showSidebar && (
					<aside
						style={{
							padding: '1rem',
							gridArea: 'sidebar',
						}}
					>
						<p>Game Config</p>
						<PropertiesPanel model={game} />
						<Rule orientation="horizontal" />
						{/* <p>Sidebar Content</p>
						<PropertiesPanelTest /> */}
						<Button
							onClick={() => {
								setShowAside(false);
								setShowHeader(false);
								setShowFooter(false);
							}}
						>
							Hide all the decorations
						</Button>
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
						}}
					>
						Aside Content
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
