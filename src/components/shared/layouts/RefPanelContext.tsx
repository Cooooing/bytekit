import { createContext, useContext, type ReactNode } from 'react';

interface RefContent {
	title: string;
	sections: Array<{
		title: string;
		items: Array<{ syntax: string; desc: string }>;
	}>;
}

interface RefPanelContextValue {
	setRefContent: (content: RefContent | null) => void;
}

const RefPanelCtx = createContext<RefPanelContextValue>({ setRefContent: () => {} });

export function useRefPanel() {
	return useContext(RefPanelCtx);
}

export function RefPanelProvider({ children, value }: { children: ReactNode; value: RefPanelContextValue }) {
	return <RefPanelCtx.Provider value={value}>{children}</RefPanelCtx.Provider>;
}

export type { RefContent };
