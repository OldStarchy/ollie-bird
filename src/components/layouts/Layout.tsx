import {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useState,
	type CSSProperties,
	type ReactNode,
} from 'react';
import Button from '../Button';

interface LayoutContext {
	showSidebar: boolean;
	toggleSidebar: () => void;

	showAside: boolean;
	toggleAside: () => void;

	showHeader: boolean;
	toggleHeader: () => void;

	showFooter: boolean;
	toggleFooter: () => void;
}
const LayoutContext = createContext<LayoutContext | null>(null);

export function useLayoutContext() {
	return useContext(LayoutContext);
}

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
						<p>Sidebar Content</p>
						<Button
							onClick={() => {
								setShowSidebar(false);
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
