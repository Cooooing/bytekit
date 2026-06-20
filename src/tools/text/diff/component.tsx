import { useMemo } from 'react';
import { useToolStorage } from '../../../hooks/useToolStorage';
import { diffLines, type DiffCell } from './functions';
import { diffReference } from './references';
import { useToolRefPanel } from '../../../components/shared/layouts/RefPanelContext';

export default function DiffViewer() {
	const [state, setState] = useToolStorage('bytekit:tool:diff:v1', {
		textA: 'Hello World\nfoo bar\nbaz qux\nunchanged line',
		textB: 'Hello World\nfoo BAR\nbaz qux\nnew line\nextra line',
	});
	const { textA, textB } = state;
	const setTextA = (v: string) => setState((c) => ({ ...c, textA: v }));
	const setTextB = (v: string) => setState((c) => ({ ...c, textB: v }));

	const diff = useMemo(() => diffLines(textA, textB), [textA, textB]);

	const stats = useMemo(() => {
		const added = diff.filter((row) => row.right.type === 'added').length;
		const removed = diff.filter((row) => row.left.type === 'removed').length;
		const unchanged = diff.filter((row) => row.left.type === 'equal' && row.right.type === 'equal').length;
		return { added, removed, unchanged };
	}, [diff]);

	useToolRefPanel('差异对比参考', diffReference);

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
				<div style={{ overflow: 'auto' }}>
					<table style={{ width: '100%', minWidth: 0, borderCollapse: 'collapse', tableLayout: 'fixed' }}>
						<thead>
							<tr>
								<th className="diff-viewer__col-header" style={{ width: '50%', textAlign: 'left' }}>原始</th>
								<th className="diff-viewer__col-header" style={{ width: '50%', textAlign: 'left', borderLeft: '1px solid var(--border)' }}>修改</th>
							</tr>
						</thead>
						<tbody>
							{diff.map((row, i) => (
								<tr key={i}>
									<DiffCellView cell={row.left} side="left" />
									<DiffCellView cell={row.right} side="right" />
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}

function DiffCellView({ cell, side }: { cell: DiffCell; side: 'left' | 'right' }) {
	return (
		<td
			className={`diff-line diff-line--${cell.type}`}
			style={{
				display: 'table-cell',
				minHeight: '1.5rem',
				padding: 0,
				borderLeft: side === 'right' ? '1px solid var(--border)' : undefined,
				verticalAlign: 'top',
			}}
		>
			<span className="diff-line__num" style={{ display: 'inline-block' }}>
				{cell.lineNum ?? ''}
			</span>
			<span
				className="diff-line__content"
				style={{
					display: 'inline-block',
					minWidth: 'calc(100% - 2.5rem)',
					overflow: 'visible',
					textOverflow: 'clip',
					whiteSpace: 'pre-wrap',
					overflowWrap: 'anywhere',
				}}
			>
				{cell.content || ' '}
			</span>
		</td>
	);
}
