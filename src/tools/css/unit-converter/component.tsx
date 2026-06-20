import { useMemo } from 'react';
import { useToolStorage } from '../../../hooks/useToolStorage';
import { convertAll, UNIT_LABELS, type CssUnit } from './functions';
import { cssUnitReference } from './references';
import GeneratorPanel from '../../../components/shared/layouts/GeneratorPanel';
import { useToolRefPanel } from '../../../components/shared/layouts/RefPanelContext';

const unitOptions: CssUnit[] = ['px', 'rem', 'em', 'vw', 'vh', 'percent'];

function unitSuffix(unit: CssUnit): string {
	return unit === 'percent' ? '%' : unit;
}

export default function CssUnitConverter() {
	const [state, setState] = useToolStorage('bytekit:tool:css-unit:v1', {
		value: 16,
		from: 'px' as CssUnit,
		to: 'rem' as CssUnit,
		baseFontSize: 16,
		viewportWidth: 1920,
		viewportHeight: 1080,
	});
	const { value, from, to, baseFontSize, viewportWidth, viewportHeight } = state;

	const results = useMemo(
		() => convertAll(value, from, baseFontSize, viewportWidth, viewportHeight),
		[value, from, baseFontSize, viewportWidth, viewportHeight],
	);

	const directResult = useMemo(
		() => results.find((r) => r.unit === to),
		[results, to],
	);

	const controls = (
		<div className="tool-card tool-card--controls">
			<div className="tool-card__section">
				<h2 className="tool-card__title">输入值</h2>
				<div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
					<input
						type="number"
						className="tool-textarea"
						value={value}
						onChange={(e) => setState((c) => ({ ...c, value: Number(e.target.value) }))}
						aria-label="输入值"
						style={{ width: '120px' }}
					/>
					<select
						className="tool-textarea"
						value={from}
						onChange={(e) => setState((c) => ({ ...c, from: e.target.value as CssUnit }))}
						aria-label="源单位"
					>
						{unitOptions.map((u) => (
							<option key={u} value={u}>{UNIT_LABELS[u]}</option>
						))}
					</select>
				</div>
			</div>

			<div className="tool-card__section">
				<h2 className="tool-card__title">目标单位</h2>
				<div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
					{unitOptions.map((u) => (
						<button
							key={u}
							type="button"
							className={to === u ? 'password-mode-tabs__item password-mode-tabs__item--active' : 'password-mode-tabs__item'}
							onClick={() => setState((c) => ({ ...c, to: u }))}
							aria-pressed={to === u}
						>
							{unitSuffix(u)}
						</button>
					))}
				</div>
			</div>

			<div className="tool-card__section">
				<h2 className="tool-card__title">基准设置</h2>
				<div style={{ display: 'grid', gap: '8px' }}>
					<label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}>
						根字体 (px)
						<input
							type="number"
							className="tool-textarea"
							value={baseFontSize}
							onChange={(e) => setState((c) => ({ ...c, baseFontSize: Number(e.target.value) }))}
							aria-label="根字体大小"
							style={{ width: '80px' }}
						/>
					</label>
					<label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}>
						视窗宽 (px)
						<input
							type="number"
							className="tool-textarea"
							value={viewportWidth}
							onChange={(e) => setState((c) => ({ ...c, viewportWidth: Number(e.target.value) }))}
							aria-label="视窗宽度"
							style={{ width: '80px' }}
						/>
					</label>
					<label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}>
						视窗高 (px)
						<input
							type="number"
							className="tool-textarea"
							value={viewportHeight}
							onChange={(e) => setState((c) => ({ ...c, viewportHeight: Number(e.target.value) }))}
							aria-label="视窗高度"
							style={{ width: '80px' }}
						/>
					</label>
				</div>
			</div>
		</div>
	);

	const resultPanel = (
		<div className="tool-card tool-card--result">
			<h2 className="tool-card__title">换算结果</h2>
			{directResult ? (
				<div style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '16px', color: 'var(--accent)' }}>
					{value}{unitSuffix(from)} = {directResult.value}{unitSuffix(to)}
				</div>
			) : null}
			<div style={{ display: 'grid', gap: '6px' }}>
				{results.map((r) => (
					<div
						key={r.unit}
						style={{
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'center',
							padding: '8px 12px',
							borderRadius: '6px',
							background: r.unit === to ? 'var(--accent-bg, rgba(var(--accent-rgb, 99,102,241), 0.1))' : 'var(--surface)',
							border: r.unit === to ? '1px solid var(--accent-border, var(--accent))' : '1px solid transparent',
							fontSize: '0.875rem',
						}}
					>
						<span style={{ color: 'var(--muted)' }}>{r.label}</span>
						<span style={{ fontFamily: 'var(--font-mono)', fontWeight: 500 }}>
							{r.value} {unitSuffix(r.unit)}
						</span>
					</div>
				))}
			</div>
		</div>
	);

	useToolRefPanel('CSS 单位参考', cssUnitReference);

	return <GeneratorPanel ariaLabel="CSS 单位换算工具" controls={controls} result={resultPanel} />;
}
