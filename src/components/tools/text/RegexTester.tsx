import { useMemo, useState } from 'react';
import Badge from '../../ui/Badge';
import Button from '../../ui/Button';
import CopyRow from '../../ui/CopyRow';
import ReferencePanel from '../../ui/ReferencePanel';
import { useToolStorage } from '../../../hooks/useToolStorage';
import { testRegex } from '../../../lib/tools/text/regex';

const flagOptions = [
	{ flag: 'g', label: '全局匹配', desc: '匹配所有结果，不只第一个' },
	{ flag: 'i', label: '忽略大小写', desc: '不区分大小写字母' },
	{ flag: 'm', label: '多行模式', desc: '^ 和 $ 匹配每行的开头/结尾' },
	{ flag: 's', label: 'DotAll', desc: '. 匹配换行符 \\n' },
	{ flag: 'u', label: 'Unicode', desc: '启用 Unicode 模式' },
	{ flag: 'y', label: 'Sticky', desc: '从 lastIndex 位置精确匹配' },
];

const regexReference = [
	{
		title: '基础语法',
		items: [
			{ syntax: '.', desc: '任意字符' },
			{ syntax: '\\d', desc: '数字 [0-9]' },
			{ syntax: '\\w', desc: '单词字符 [a-zA-Z0-9_]' },
			{ syntax: '\\s', desc: '空白字符' },
			{ syntax: '[abc]', desc: '字符集，匹配 a 或 b 或 c' },
			{ syntax: '[^abc]', desc: '否定字符集' },
			{ syntax: '^', desc: '行首' },
			{ syntax: '$', desc: '行尾' },
		],
	},
	{
		title: '量词',
		items: [
			{ syntax: '*', desc: '0 次或多次' },
			{ syntax: '+', desc: '1 次或多次' },
			{ syntax: '?', desc: '0 次或 1 次' },
			{ syntax: '{n}', desc: '恰好 n 次' },
			{ syntax: '{n,}', desc: '至少 n 次' },
			{ syntax: '{n,m}', desc: 'n 到 m 次' },
		],
	},
	{
		title: '分组与引用',
		items: [
			{ syntax: '(abc)', desc: '捕获分组' },
			{ syntax: '(?:abc)', desc: '非捕获分组' },
			{ syntax: '(?<name>)', desc: '命名分组' },
			{ syntax: '\\1', desc: '反向引用第 1 组' },
			{ syntax: 'a|b', desc: '或运算' },
		],
	},
	{
		title: '前瞻与后顾',
		items: [
			{ syntax: '(?=...)', desc: '正向前瞻' },
			{ syntax: '(?!...)', desc: '负向前瞻' },
			{ syntax: '(?<=...)', desc: '正向后顾' },
			{ syntax: '(?<!...)', desc: '负向后顾' },
		],
	},
];

export default function RegexTester() {
	const [state, setState] = useToolStorage('bytekit:tool:regex:v1', {
		input: 'Hello World 123\nfoo@bar.com\n2024-01-15',
		pattern: '\\d+',
		flags: 'g',
	});
	const { input, pattern, flags } = state;
	const setInput = (v: string) => setState((c) => ({ ...c, input: v }));
	const setPattern = (v: string) => setState((c) => ({ ...c, pattern: v }));
	const setFlags = (v: string) => setState((c) => ({ ...c, flags: v }));
	const [copied, setCopied] = useState(false);

	function toggleFlag(flag: string) {
		setFlags(flags.includes(flag) ? flags.replace(flag, '') : flags + flag);
	}

	const result = useMemo(() => testRegex(pattern, flags, input), [pattern, flags, input]);

	const highlightedHtml = useMemo(() => {
		if (!result.ok || result.matches.length === 0) return escapeHtml(input);

		const parts: string[] = [];
		let lastIdx = 0;
		for (const m of result.matches) {
			if (m.index > lastIdx) parts.push(escapeHtml(input.slice(lastIdx, m.index)));
			parts.push(`<mark class="regex-highlight">${escapeHtml(m.fullMatch)}</mark>`);
			lastIdx = m.index + m.fullMatch.length;
		}
		if (lastIdx < input.length) parts.push(escapeHtml(input.slice(lastIdx)));
		return parts.join('');
	}, [input, result]);

	async function copyRegex() {
		const regex = `/${pattern}/${flags}`;
		try {
			await navigator.clipboard.writeText(regex);
			setCopied(true);
			setTimeout(() => setCopied(false), 1400);
		} catch {
			// ignore
		}
	}

	return (
		<div className="regex-layout">
			<div className="regex-layout__main">
				<div className="regex-tester__pattern">
					<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
						<h2 className="password-card__title" style={{ margin: 0 }}>正则表达式</h2>
						<Button variant="secondary" size="sm" onClick={copyRegex}>{copied ? '已复制' : '复制正则'}</Button>
					</div>
					<div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
						<span style={{ color: 'var(--muted)', fontFamily: 'monospace', fontSize: '1.1rem' }}>/</span>
						<input
							type="text"
							value={pattern}
							onChange={(e) => setPattern(e.target.value)}
							placeholder="正则表达式"
							aria-label="正则表达式"
							style={{ flex: 1, padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--surface-subtle)', color: 'var(--text)', fontFamily: 'monospace', fontSize: '0.9375rem' }}
						/>
						<span style={{ color: 'var(--muted)', fontFamily: 'monospace', fontSize: '1.1rem' }}>/</span>
						<span style={{ color: 'var(--muted)', fontFamily: 'monospace', fontSize: '0.875rem', minWidth: '2rem' }}>{flags}</span>
						{result.ok ? <Badge tone="success">{result.count} 个匹配</Badge> : <Badge tone="danger">错误</Badge>}
					</div>
					<div className="regex-flags">
						{flagOptions.map((opt) => (
							<label
								key={opt.flag}
								className={`regex-flag ${flags.includes(opt.flag) ? 'regex-flag--active' : ''}`}
								title={opt.desc}
							>
								<input
									type="checkbox"
									checked={flags.includes(opt.flag)}
									onChange={() => toggleFlag(opt.flag)}
									className="sr-only"
								/>
								<span className="regex-flag__code">{opt.flag}</span>
								<span className="regex-flag__label">{opt.label}</span>
							</label>
						))}
					</div>
				</div>

				<div className="regex-tester__input">
					<h2 className="password-card__title">测试文本</h2>
					<textarea
						value={input}
						onChange={(e) => setInput(e.target.value)}
						placeholder="输入要测试的文本"
						aria-label="测试文本"
						rows={6}
						style={{ width: '100%', padding: '12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--surface-subtle)', color: 'var(--text)', fontFamily: 'monospace', fontSize: '0.875rem', lineHeight: 1.6, resize: 'vertical' }}
					/>
				</div>

				<div className="regex-tester__highlight">
					<h2 className="password-card__title">高亮预览</h2>
					<pre
						className="regex-highlight-area"
						dangerouslySetInnerHTML={{ __html: highlightedHtml }}
					/>
				</div>

				{result.ok && result.matches.length > 0 && (
					<div className="regex-tester__results">
						<h2 className="password-card__title">匹配详情</h2>
						<div style={{ display: 'grid', gap: '6px' }}>
							{result.matches.map((m, i) => (
								<div key={i}>
									<CopyRow label={`匹配 ${i + 1}`} value={m.fullMatch} />
									{m.groups.length > 0 && (
										<div style={{ paddingLeft: '2rem', display: 'grid', gap: '2px', marginTop: '4px' }}>
											{m.groups.map((g, j) => (
												<CopyRow key={j} label={`$${j + 1}`} value={g} />
											))}
										</div>
									)}
								</div>
							))}
						</div>
					</div>
				)}

				{result.ok && result.matches.length === 0 && (
					<div style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>无匹配结果。</div>
				)}

				{!result.ok && (
					<div style={{ color: 'var(--semantic-danger)', fontSize: '0.875rem' }}>{result.error}</div>
				)}
			</div>

			<div className="regex-layout__ref">
				<ReferencePanel title="正则语法速查" sections={regexReference} />
			</div>
		</div>
	);
}

function escapeHtml(str: string): string {
	return str
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}
