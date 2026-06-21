export type RegexMatch = {
	fullMatch: string;
	index: number;
	groups: string[];
};

export type RegexResult =
	| { ok: true; matches: RegexMatch[]; count: number; truncated: boolean }
	| { ok: false; error: string };

const MAX_REGEX_INPUT_LENGTH = 100000;
const MAX_REGEX_MATCHES = 1000;

function localizeRegexError(error: unknown): string {
	if (!(error instanceof Error)) return '正则表达式无效。';
	const message = error.message;
	if (message.includes('Unterminated group')) return '正则表达式分组未闭合。';
	if (message.includes('Unterminated character class')) return '字符集未闭合，请检查方括号。';
	if (message.includes('Invalid regular expression')) return '正则表达式语法无效。';
	return message;
}

export function testRegex(pattern: string, flags: string, input: string): RegexResult {
	if (!pattern) return { ok: true, matches: [], count: 0, truncated: false };
	if (!input) return { ok: true, matches: [], count: 0, truncated: false };
	if (input.length > MAX_REGEX_INPUT_LENGTH) {
		return { ok: false, error: `输入过长，正则测试最多支持 ${MAX_REGEX_INPUT_LENGTH.toLocaleString('zh-CN')} 个字符。` };
	}

	try {
		const regex = new RegExp(pattern, flags);
		const matches: RegexMatch[] = [];
		let match: RegExpExecArray | null;
		let truncated = false;

		if (flags.includes('g') || flags.includes('y')) {
			while ((match = regex.exec(input)) !== null) {
				matches.push({
					fullMatch: match[0],
					index: match.index,
					groups: match.slice(1),
				});
				if (matches.length >= MAX_REGEX_MATCHES) {
					truncated = true;
					break;
				}
				if (match[0].length === 0) regex.lastIndex++;
			}
		} else {
			match = regex.exec(input);
			if (match) {
				matches.push({
					fullMatch: match[0],
					index: match.index,
					groups: match.slice(1),
				});
			}
		}

		return { ok: true, matches, count: matches.length, truncated };
	} catch (error) {
		return { ok: false, error: localizeRegexError(error) };
	}
}
