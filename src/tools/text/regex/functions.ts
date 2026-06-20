export type RegexMatch = {
	fullMatch: string;
	index: number;
	groups: string[];
};

export type RegexResult =
	| { ok: true; matches: RegexMatch[]; count: number }
	| { ok: false; error: string };

function localizeRegexError(error: unknown): string {
	if (!(error instanceof Error)) return '正则表达式无效。';
	const message = error.message;
	if (message.includes('Unterminated group')) return '正则表达式分组未闭合。';
	if (message.includes('Unterminated character class')) return '字符集未闭合，请检查方括号。';
	if (message.includes('Invalid regular expression')) return '正则表达式语法无效。';
	return message;
}

export function testRegex(pattern: string, flags: string, input: string): RegexResult {
	if (!pattern) return { ok: true, matches: [], count: 0 };
	if (!input) return { ok: true, matches: [], count: 0 };

	try {
		const regex = new RegExp(pattern, flags);
		const matches: RegexMatch[] = [];
		let match: RegExpExecArray | null;

		if (flags.includes('g') || flags.includes('y')) {
			while ((match = regex.exec(input)) !== null) {
				matches.push({
					fullMatch: match[0],
					index: match.index,
					groups: match.slice(1),
				});
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

		return { ok: true, matches, count: matches.length };
	} catch (error) {
		return { ok: false, error: localizeRegexError(error) };
	}
}
