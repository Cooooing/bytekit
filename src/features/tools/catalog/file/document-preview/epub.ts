export interface EpubChapter {
	id: string;
	title: string;
	content: string;
}

type XmlNode = Record<string, unknown>;

export async function readEpub(file: File): Promise<EpubChapter[]> {
	const [{ default: JSZip }, { XMLParser }] = await Promise.all([import('jszip'), import('fast-xml-parser')]);
	const zip = await JSZip.loadAsync(await file.arrayBuffer());
	const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });
	const container = parser.parse(await requiredFile(zip, 'META-INF/container.xml')) as XmlNode;
	const rootfile = findFirst(container, 'rootfile') as XmlNode | undefined;
	const packagePath = String(rootfile?.['@_full-path'] ?? '');
	if (!packagePath) throw new Error('EPUB 缺少 package 文档。');
	const packageXml = parser.parse(await requiredFile(zip, packagePath)) as XmlNode;
	const manifest = findFirst(packageXml, 'manifest') as XmlNode | undefined;
	const spine = findFirst(packageXml, 'spine') as XmlNode | undefined;
	const items = asArray(manifest?.item).filter(isObject);
	const itemById = new Map(items.map((item) => [String(item['@_id'] ?? ''), item]));
	const base = packagePath.slice(0, packagePath.lastIndexOf('/') + 1);
	const chapters: EpubChapter[] = [];
	for (const itemref of asArray(spine?.itemref).filter(isObject)) {
		const item = itemById.get(String(itemref['@_idref'] ?? ''));
		if (!item) continue;
		const href = String(item['@_href'] ?? '');
		if (!href) continue;
		const path = resolvePath(base, href);
		const source = await requiredFile(zip, path);
		chapters.push({ id: String(item['@_id'] ?? href), title: href.split('/').at(-1) ?? href, content: documentBody(source) });
	}
	if (!chapters.length) throw new Error('EPUB 中没有可阅读章节。');
	return chapters;
}

function documentBody(source: string) {
	const document = new DOMParser().parseFromString(source, 'application/xhtml+xml');
	return document.body?.innerHTML || document.documentElement?.textContent || '';
}

function resolvePath(base: string, href: string) {
	const source = `${base}${href.split('#', 1)[0]}`;
	const resolved: string[] = [];
	for (const part of source.split('/')) {
		if (!part || part === '.') continue;
		if (part === '..') resolved.pop(); else resolved.push(part);
	}
	return resolved.join('/');
}

async function requiredFile(zip: { file: (path: string) => { async: (type: 'string') => Promise<string> } | null }, path: string) {
	const entry = zip.file(path);
	if (!entry) throw new Error(`EPUB 缺少 ${path}。`);
	return entry.async('string');
}

function findFirst(value: unknown, key: string): unknown {
	if (!isObject(value)) return undefined;
	if (key in value) return value[key];
	for (const child of Object.values(value)) {
		const match = findFirst(child, key);
		if (match !== undefined) return match;
	}
	return undefined;
}

function asArray(value: unknown): unknown[] { return value == null ? [] : Array.isArray(value) ? value : [value]; }
function isObject(value: unknown): value is XmlNode { return Boolean(value) && typeof value === 'object' && !Array.isArray(value); }
