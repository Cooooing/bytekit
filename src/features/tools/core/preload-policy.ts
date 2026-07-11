export interface ConnectionInfo {
	saveData?: boolean;
	effectiveType?: string;
}

export function allowsPassivePreload(connection?: ConnectionInfo) {
	return !connection?.saveData && connection?.effectiveType !== 'slow-2g' && connection?.effectiveType !== '2g';
}
