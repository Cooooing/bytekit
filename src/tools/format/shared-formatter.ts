const HTML_VOID_TAGS = new Set([
	'area',
	'base',
	'br',
	'col',
	'embed',
	'hr',
	'img',
	'input',
	'link',
	'meta',
	'param',
	'source',
	'track',
	'wbr',
]);

const RAW_TEXT_TAGS = new Set(['script', 'style', 'pre', 'textarea']);

interface FormatOptions {
	mode: 'html' | 'xml';
	indentSize?: number;
}

type Token =
	| { type: 'tag'; value: string; name: string; closing: boolean; selfClosing: boolean; rawText?: string }
	| { type: 'text'; value: string }
	| { type: 'inline'; value: string }
	| { type: 'preserve'; value: string };

export function formatCode(input: string, options: FormatOptions | number = { mode: 'html' }): string {
	const normalizedOptions = typeof options === 'number' ? { mode: 'html' as const, indentSize: options } : options;
	const indent = ' '.repeat(normalizedOptions.indentSize ?? 2);
	const tokens = tokenizeMarkup(input, normalizedOptions.mode);
	const lines: string[] = [];
	let level = 0;

	for (const token of tokens) {
		if (token.type === 'preserve') {
			lines.push(...indentPreservedBlock(token.value, level, indent));
			continue;
		}

		if (token.type === 'text') {
			const text = token.value.trim();
			if (text) lines.push(`${indent.repeat(level)}${text}`);
			continue;
		}

		if (token.type === 'inline') {
			lines.push(`${indent.repeat(level)}${token.value}`);
			continue;
		}

		if (token.closing) level = Math.max(0, level - 1);
		lines.push(`${indent.repeat(level)}${token.value}`);

		if (token.rawText) {
			lines.push(...indentPreservedBlock(token.rawText, level + 1, indent));
		}

		if (!token.closing && !token.selfClosing) level += 1;
	}

	return lines.join('\n').trim();
}

export function minifyCode(input: string): string {
	return input
		.replace(/<!--[\s\S]*?-->/g, '')
		.replace(/>\s+</g, '><')
		.replace(/\s{2,}/g, ' ')
		.trim();
}

function tokenizeMarkup(input: string, mode: FormatOptions['mode']): Token[] {
	const tokens: Token[] = [];
	let index = 0;

	while (index < input.length) {
		const nextTag = input.indexOf('<', index);
		if (nextTag === -1) {
			pushText(tokens, input.slice(index));
			break;
		}

		pushText(tokens, input.slice(index, nextTag));

		if (input.startsWith('<!--', nextTag)) {
			const end = input.indexOf('-->', nextTag + 4);
			const finalIndex = end === -1 ? input.length : end + 3;
			tokens.push({ type: 'preserve', value: input.slice(nextTag, finalIndex).trim() });
			index = finalIndex;
			continue;
		}

		if (input.startsWith('<![CDATA[', nextTag)) {
			const end = input.indexOf(']]>', nextTag + 9);
			const finalIndex = end === -1 ? input.length : end + 3;
			tokens.push({ type: 'preserve', value: input.slice(nextTag, finalIndex).trim() });
			index = finalIndex;
			continue;
		}

		const tagEnd = findTagEnd(input, nextTag);
		const finalIndex = tagEnd === -1 ? input.length : tagEnd + 1;
		const tag = input.slice(nextTag, finalIndex).trim();
		const tagName = getTagName(tag);
		const closing = /^<\//.test(tag);
		const declarative = /^<(!|\/?!|\?)/.test(tag) || tag.startsWith('<?') || tag.startsWith('<!');
		const selfClosing = declarative || /\/>$/.test(tag) || (mode === 'html' && HTML_VOID_TAGS.has(tagName));

		if (!closing && !selfClosing && tagName && !RAW_TEXT_TAGS.has(tagName)) {
			const inline = readInlineElement(input, tag, tagName, finalIndex);
			if (inline) {
				tokens.push({ type: 'inline', value: inline.value });
				index = inline.end;
				continue;
			}
		}

		if (mode === 'html' && !closing && RAW_TEXT_TAGS.has(tagName) && !selfClosing) {
			const closeTag = `</${tagName}>`;
			const rawStart = finalIndex;
			const closeStart = input.toLowerCase().indexOf(closeTag, rawStart);
			if (closeStart !== -1) {
				const rawText = input.slice(rawStart, closeStart).trim();
				tokens.push({ type: 'tag', value: tag, name: tagName, closing: false, selfClosing: false, rawText });
				tokens.push({ type: 'tag', value: input.slice(closeStart, closeStart + closeTag.length), name: tagName, closing: true, selfClosing: false });
				index = closeStart + closeTag.length;
				continue;
			}
		}

		tokens.push({ type: 'tag', value: tag, name: tagName, closing, selfClosing });
		index = finalIndex;
	}

	return tokens;
}

function pushText(tokens: Token[], value: string) {
	if (value.trim()) tokens.push({ type: 'text', value });
}

function readInlineElement(input: string, openTag: string, tagName: string, contentStart: number): { value: string; end: number } | null {
	const closeTag = `</${tagName}>`;
	const closeStart = input.toLowerCase().indexOf(closeTag, contentStart);
	if (closeStart === -1) return null;

	const content = input.slice(contentStart, closeStart);
	if (!content.trim() || content.includes('<') || content.includes('\n') || content.includes('\r')) return null;

	return {
		value: `${openTag}${content.trim()}${input.slice(closeStart, closeStart + closeTag.length)}`,
		end: closeStart + closeTag.length,
	};
}

function findTagEnd(input: string, start: number): number {
	let quote: string | null = null;
	for (let index = start + 1; index < input.length; index += 1) {
		const char = input[index];
		if ((char === '"' || char === "'") && input[index - 1] !== '\\') {
			quote = quote === char ? null : quote ?? char;
		}
		if (char === '>' && !quote) return index;
	}
	return -1;
}

function getTagName(tag: string): string {
	const match = tag.match(/^<\/?\s*([a-zA-Z0-9:_-]+)/);
	return match?.[1]?.toLowerCase() ?? '';
}

function indentPreservedBlock(value: string, level: number, indent: string): string[] {
	if (!value.trim()) return [];
	return value
		.split(/\r?\n/)
		.map((line) => line.trimEnd())
		.filter((line) => line.trim())
		.map((line) => `${indent.repeat(level)}${line}`);
}
