import { useMemo } from 'react';
import Badge from '../../../components/shared/ui/Badge';
import CopyRow from '../../../components/shared/ui/CopyRow';
import { useToolRefPanel } from '../../../components/shared/layouts/RefPanelContext';
import { useToolStorage } from '../../../hooks/useToolStorage';
import { testRegex } from './functions';
import { regexReference } from './references';
import { useTheme } from '../../../themes/ThemeContext';
import { useTransientNotice } from '../../../hooks/useTransientNotice';
import { useAppMessage, useMessageOnError } from '../../../components/shared/ui/AppMessage';

const flagOptions = [
	{ flag: 'g', label: '全局匹配', desc: '匹配所有结果，而不是只返回第一个。' },
	{ flag: 'i', label: '忽略大小写', desc: '不区分英文字母大小写。' },
	{ flag: 'm', label: '多行模式', desc: '^ 和 $ 匹配每一行的开头和结尾。' },
	{ flag: 's', label: 'DotAll', desc: '. 可以匹配换行符。' },
	{ flag: 'u', label: 'Unicode', desc: '启用 Unicode 模式。' },
	{ flag: 'y', label: 'Sticky', desc: '从 lastIndex 位置精确匹配；连续匹配会在第一个不连续位置停止。' },
];

export default function RegexTester() {
	const { Button } = useTheme();
	const message = useAppMessage();
	const [state, setState] = useToolStorage('bytekit:tool:regex:v1', {
		input: 'Hello World 123\nfoo@bar.com\n2024-01-15',
		pattern: '\\d+',
		flags: 'g',
	});
	const { input, pattern, flags } = state;
	const setInput = (v: string) => setState((c) => ({ ...c, input: v }));
	const setPattern = (v: string) => setState((c) => ({ ...c, pattern: v }));
	const setFlags = (v: string) => setState((c) => ({ ...c, flags: v }));
	const [copyNotice, showCopyNotice] = useTransientNotice();

	function toggleFlag(flag: string) {
		setFlags(flags.includes(flag) ? flags.replace(flag, '') : flags + flag);
	}

	const result = useMemo(() => testRegex(pattern, flags, input), [pattern, flags, input]);
	const canCopy = pattern.length > 0 && result.ok;
	useMessageOnError(result.ok ? undefined : result.error);

	const highlightedHtml = useMemo(() => {
		if (!result.ok || result.matches.length === 0) return escapeHtml(input);

		const parts: string[] = [];
		let lastIdx = 0;
		for (const m of result.matches) {
			if (m.index > lastIdx) parts.push(escapeHtml(input.slice(lastIdx, m.index)));
			parts.push(`<mark class="regex-highlight">${escapeHtml(m.fullMatch || ' ')}</mark>`);
			lastIdx = m.index + m.fullMatch.length;
		}
		if (lastIdx < input.length) parts.push(escapeHtml(input.slice(lastIdx)));
		return parts.join('');
	}, [input, result]);

	async function copyRegex() {
		if (!canCopy) {
			message.error(result.ok ? '请输入正则。' : result.error);
			return;
		}

		const regex = `new RegExp(${JSON.stringify(pattern)}, ${JSON.stringify(flags)})`;
		try {
			await navigator.clipboard.writeText(regex);
			showCopyNotice('已复制');
		} catch {
			message.error('复制失败。');
		}
	}

	useToolRefPanel('正则语法速查', regexReference);

	return (
		<div className="regex-tester">
			<div className="regex-tester__pattern">
				<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '12px' }}>
					<h2 className="tool-card__title" style={{ margin: 0 }}>正则表达式</h2>
					<div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
						{copyNotice ? <span className="code-editor__action-status" role="status" aria-live="polite">{copyNotice}</span> : null}
						<Button variant="secondary" size="sm" onClick={copyRegex} disabled={!canCopy}>复制正则</Button>
					</div>
				</div>
				<div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
					<span style={{ color: 'var(--muted)', fontFamily: 'monospace', fontSize: '1.1rem' }}>/</span>
					<input
						type="text"
						value={pattern}
						onChange={(e) => setPattern(e.target.value)}
						placeholder="正则表达式"
						aria-label="正则表达式"
						style={{ flex: 1, minWidth: 0, padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--surface-subtle)', color: 'var(--text)', fontFamily: 'monospace', fontSize: '0.9375rem' }}
					/>
					<span style={{ color: 'var(--muted)', fontFamily: 'monospace', fontSize: '1.1rem' }}>/</span>
					<span style={{ color: 'var(--muted)', fontFamily: 'monospace', fontSize: '0.875rem', minWidth: '2rem' }}>{flags}</span>
					{result.ok ? <Badge tone="success">{result.count} 个匹配</Badge> : <Badge tone="neutral">待修正</Badge>}
				</div>
				<div className="regex-flags">
					{flagOptions.map((opt) => {
						const active = flags.includes(opt.flag);
						return (
							<label
								key={opt.flag}
								className={`regex-flag ${active ? 'regex-flag--active' : ''}`}
								title={opt.desc}
								style={active ? { borderWidth: '2px', boxShadow: '0 0 0 2px var(--primary-soft)', background: 'var(--primary-soft)' } : undefined}
							>
								<input
									type="checkbox"
									checked={active}
									onChange={() => toggleFlag(opt.flag)}
									className="sr-only"
								/>
								<span className="regex-flag__code">{opt.flag}</span>
								<span className="regex-flag__label">{opt.label}</span>
							</label>
						);
					})}
				</div>
			</div>

			<div className="regex-tester__input">
				<h2 className="tool-card__title">测试文本</h2>
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
				<h2 className="tool-card__title">高亮预览</h2>
				<pre
					className="regex-highlight-area"
					dangerouslySetInnerHTML={{ __html: highlightedHtml }}
				/>
			</div>

			{result.ok && result.matches.length > 0 && (
				<div className="regex-tester__results">
					<h2 className="tool-card__title">匹配详情</h2>
					<div style={{ display: 'grid', gap: '6px' }}>
						{result.matches.map((m, i) => (
							<div key={`${m.index}-${i}`}>
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
