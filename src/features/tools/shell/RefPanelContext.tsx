import { createContext, useContext, useEffect, type ReactNode } from 'react';

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

export function useToolRefPanel(title: string, sections: RefContent['sections']) {
	const { setRefContent } = useRefPanel();
	useEffect(() => {
		setRefContent({ title, sections });
		return () => setRefContent(null);
	}, [setRefContent, title, sections]);
}

export function RefPanelProvider({ children, value }: { children: ReactNode; value: RefPanelContextValue }) {
	return <RefPanelCtx.Provider value={value}>{children}</RefPanelCtx.Provider>;
}

export type { RefContent };
