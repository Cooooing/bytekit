export type UrlResult =
	| { ok: true; encoded: string; decoded: string; components: UrlComponents }
	| { ok: false; error: string };

export interface UrlComponents {
	protocol: string;
	hostname: string;
	port: string;
	pathname: string;
	search: string;
	hash: string;
	params: Array<{ key: string; value: string }>;
}

export function encodeUrl(input: string): UrlResult {
	if (!input.trim()) return { ok: false, error: '请输入 URL 或文本。' };
	return {
		ok: true,
		encoded: encodeURI(input),
		decoded: input,
		components: parseUrlSafe(input),
	};
}

export function decodeUrl(input: string): UrlResult {
	if (!input.trim()) return { ok: false, error: '请输入要解码的 URL。' };
	try {
		const decoded = decodeURI(input);
		return {
			ok: true,
			encoded: input,
			decoded,
			components: parseUrlSafe(decoded),
		};
	} catch {
		return { ok: false, error: 'URL 解码失败，输入格式不正确。' };
	}
}

export function encodeComponent(input: string): string {
	return encodeURIComponent(input);
}

export function decodeComponent(input: string): string {
	return decodeURIComponent(input);
}

function parseUrlSafe(urlStr: string): UrlComponents {
	try {
		const url = new URL(urlStr);
		const params: Array<{ key: string; value: string }> = [];
		url.searchParams.forEach((value, key) => params.push({ key, value }));
		return {
			protocol: url.protocol,
			hostname: url.hostname,
			port: url.port,
			pathname: url.pathname,
			search: url.search,
			hash: url.hash,
			params,
		};
	} catch {
		return { protocol: '', hostname: '', port: '', pathname: urlStr, search: '', hash: '', params: [] };
	}
}
