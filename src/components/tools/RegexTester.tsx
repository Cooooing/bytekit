import { useMemo, useRef, useState } from 'react';
import Badge from '../ui/Badge';
import CopyRow from '../ui/CopyRow';
import { useToolStorage } from '../../hooks/useToolStorage';
import { testRegex } from '../../lib/tools/regex';

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

	const result = useMemo(() => testRegex(pattern, flags, input), [pattern, flags, input]);

	// Build highlighted HTML for the input text
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

	return (
		<div className="regex-tester">
			<div className="regex-tester__pattern">
				<h2 className="password-card__title">正则表达式</h2>
				<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
					<span style={{ color: 'var(--muted)', fontFamily: 'monospace' }}>/</span>
					<input
						type="text"
						value={pattern}
						onChange={(e) => setPattern(e.target.value)}
						placeholder="正则表达式"
						aria-label="正则表达式"
						style={{ flex: 1, padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--surface-subtle)', color: 'var(--text)', fontFamily: 'monospace', fontSize: '0.9375rem' }}
					/>
					<span style={{ color: 'var(--muted)', fontFamily: 'monospace' }}>/</span>
					<input
						type="text"
						value={flags}
						onChange={(e) => setFlags(e.target.value)}
						placeholder="g"
						aria-label="正则标志"
						style={{ width: '3rem', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--surface-subtle)', color: 'var(--text)', fontFamily: 'monospace', fontSize: '0.9375rem' }}
					/>
					{result.ok ? <Badge tone="success">{result.count} 个匹配</Badge> : <Badge tone="danger">错误</Badge>}
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
	);
}

function escapeHtml(str: string): string {
	return str
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}
