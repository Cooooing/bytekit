export function getOfflinePageCandidates(pathname: string) {
	if (pathname === '/') return ['/index.html'];
	const normalized = pathname.endsWith('/') ? pathname : `${pathname}/`;
	return [`${normalized}index.html`];
}
