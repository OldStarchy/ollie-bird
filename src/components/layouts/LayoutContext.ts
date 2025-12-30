import { createContext, useContext } from 'react';

export interface LayoutContext {
	showSidebar: boolean;
	toggleSidebar: () => void;

	showAside: boolean;
	toggleAside: () => void;

	showHeader: boolean;
	toggleHeader: () => void;

	showFooter: boolean;
	toggleFooter: () => void;
}
export const LayoutContext = createContext<LayoutContext | null>(null);

export default function useLayoutContext() {
	return useContext(LayoutContext);
}
