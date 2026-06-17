import { useMemo, useState } from 'react';
import { useToolStorage } from '../../../hooks/useToolStorage';
import { diffLines } from './functions';

export default function DiffViewer() {
	const [state, setState] = useToolStorage('bytekit:tool:diff:v1', {
		textA: 'Hello World\nfoo bar\nbaz qux\nunchanged line',
		textB: 'Hello World\nfoo BAR\nbaz qux\nnew line\nextra line',
	});
	const { textA, textB } = state;
	const setTextA = (v: string) => setState((c) => ({ ...c, textA: v }));
	const setTextB = (v: string) => setState((c) => ({ ...c, textB: v }));

	const linesA = useMemo(() => textA.split('\n'), [textA]);
	const linesB = useMemo(() => textB.split('\n'), [textB]);
	const diff = useMemo(() => diffLines(textA, textB), [textA, textB]);

	const stats = useMemo(() => {
		const added = diff.filter((l) => l.type === 'added').length;
		const removed = diff.filter((l) => l.type === 'removed').length;
		const unchanged = diff.filter((l) => l.type === 'equal').length;
		return { added, removed, unchanged };
	}, [diff]);

	return (
		<div className="diff-viewer">
			<div className="diff-viewer__inputs">
				<div className="diff-viewer__input-panel">
					<h2 className="tool-card__title">原始文本</h2>
					<textarea
						value={textA}
						onChange={(e) => setTextA(e.target.value)}
						aria-label="原始文本"
						rows={8}
						style={{ width: '100%', padding: '12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--surface-subtle)', color: 'var(--text)', fontFamily: 'monospace', fontSize: '0.875rem', lineHeight: 1.6, resize: 'vertical' }}
					/>
				</div>
				<div className="diff-viewer__input-panel">
					<h2 className="tool-card__title">修改文本</h2>
					<textarea
						value={textB}
						onChange={(e) => setTextB(e.target.value)}
						aria-label="修改文本"
						rows={8}
						style={{ width: '100%', padding: '12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--surface-subtle)', color: 'var(--text)', fontFamily: 'monospace', fontSize: '0.875rem', lineHeight: 1.6, resize: 'vertical' }}
					/>
				</div>
			</div>

			<div className="diff-viewer__result">
				<div className="diff-viewer__stats">
					<span className="diff-stat diff-stat--equal">{stats.unchanged} 行相同</span>
					<span className="diff-stat diff-stat--added">+{stats.added} 行新增</span>
					<span className="diff-stat diff-stat--removed">-{stats.removed} 行删除</span>
				</div>
				<div className="diff-viewer__columns">
					<div className="diff-viewer__col diff-viewer__col--left">
						<div className="diff-viewer__col-header">原始</div>
						{diff.filter((l) => l.type !== 'added').map((line, i) => (
							<div key={i} className={`diff-line diff-line--${line.type}`}>
								<span className="diff-line__num">{line.lineNum}</span>
								<span className="diff-line__content">{line.content || ' '}</span>
							</div>
						))}
					</div>
					<div className="diff-viewer__col diff-viewer__col--right">
						<div className="diff-viewer__col-header">修改</div>
						{diff.filter((l) => l.type !== 'removed').map((line, i) => (
							<div key={i} className={`diff-line diff-line--${line.type}`}>
								<span className="diff-line__num">{line.lineNum}</span>
								<span className="diff-line__content">{line.content || ' '}</span>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
