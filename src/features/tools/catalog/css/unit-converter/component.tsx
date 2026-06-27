import { useEffect, useMemo, useState } from 'react';
import { useToolStorage } from '@features/tools/shared/useToolStorage';
import { convertAll, UNIT_LABELS, type CssUnit } from './functions';
import { cssUnitReference } from './references';
import GeneratorPanel from '@features/tools/shared/GeneratorPanel';
import { useToolRefPanel } from '@features/tools/shared/RefPanelContext';
import { useMessageOnError } from '@shared/ui/AppMessage';
import CopyRow from '@features/tools/shared/CopyRow';

const unitOptions: CssUnit[] = ['px', 'rem', 'em', 'vw', 'vh', 'percent'];

interface UnitDisplay {
	directText: string;
	results: Array<{ unit: CssUnit; label: string; value: number }>;
}

function unitSuffix(unit: CssUnit): string {
	return unit === 'percent' ? '%' : unit;
}

function fieldValue(value: unknown, fallback: string): string {
	return typeof value === 'string' ? value : typeof value === 'number' ? String(value) : fallback;
}

function positiveNumber(value: string): number | null {
	const parsed = Number(value);
	return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export default function CssUnitConverter() {
	const [state, setState] = useToolStorage('bytekit:tool:css-unit:v1', {
		value: '16',
		from: 'px' as CssUnit,
		to: 'rem' as CssUnit,
		baseFontSize: '16',
		viewportWidth: '1920',
		viewportHeight: '1080',
	});
	const { value, from, to, baseFontSize, viewportWidth, viewportHeight } = state;
	const valueText = fieldValue(value, '16');
	const baseFontSizeText = fieldValue(baseFontSize, '16');
	const viewportWidthText = fieldValue(viewportWidth, '1920');
	const viewportHeightText = fieldValue(viewportHeight, '1080');
	const numericValue = Number(valueText);
	const numericBaseFontSize = positiveNumber(baseFontSizeText);
	const numericViewportWidth = positiveNumber(viewportWidthText);
	const numericViewportHeight = positiveNumber(viewportHeightText);
	const hasValidInput = Number.isFinite(numericValue) && numericBaseFontSize !== null && numericViewportWidth !== null && numericViewportHeight !== null;
	const error = !Number.isFinite(numericValue)
		? '请输入有效数值。'
		: numericBaseFontSize === null
			? '根字体大小必须大于 0。'
			: numericViewportWidth === null
				? '视窗宽度必须大于 0。'
				: numericViewportHeight === null
					? '视窗高度必须大于 0。'
					: '';

	const results = useMemo(
		() => hasValidInput ? convertAll(numericValue, from, numericBaseFontSize, numericViewportWidth, numericViewportHeight) : [],
		[hasValidInput, numericValue, from, numericBaseFontSize, numericViewportWidth, numericViewportHeight],
	);

	const directResult = useMemo(
		() => results.find((r) => r.unit === to),
		[results, to],
	);
	const currentDisplay = useMemo<UnitDisplay | null>(
		() => hasValidInput && directResult
			? { directText: `${valueText}${unitSuffix(from)} = ${directResult.value}${unitSuffix(to)}`, results }
			: null,
		[directResult, from, hasValidInput, results, to, valueText],
	);
	const [lastDisplay, setLastDisplay] = useState<UnitDisplay | null>(currentDisplay);
	const display = error ? null : currentDisplay ?? lastDisplay;

	useMessageOnError(error || undefined);

	useEffect(() => {
		if (currentDisplay) setLastDisplay(currentDisplay);
	}, [currentDisplay]);

	const controls = (
		<div className="tool-card tool-card--controls">
			<div className="tool-card__section">
				<h2 className="tool-card__title">输入值</h2>
				<div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
					<input
						type="number"
						className="tool-textarea"
						value={valueText}
						onChange={(e) => setState((c) => ({ ...c, value: e.target.value }))}
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
							className={to === u ? 'css-unit-option css-unit-option--active' : 'css-unit-option'}
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
							value={baseFontSizeText}
							onChange={(e) => setState((c) => ({ ...c, baseFontSize: e.target.value }))}
							aria-label="根字体大小"
							style={{ width: '80px' }}
						/>
					</label>
					<label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}>
						视窗宽 (px)
						<input
							type="number"
							className="tool-textarea"
							value={viewportWidthText}
							onChange={(e) => setState((c) => ({ ...c, viewportWidth: e.target.value }))}
							aria-label="视窗宽度"
							style={{ width: '80px' }}
						/>
					</label>
					<label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}>
						视窗高 (px)
						<input
							type="number"
							className="tool-textarea"
							value={viewportHeightText}
							onChange={(e) => setState((c) => ({ ...c, viewportHeight: e.target.value }))}
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
			{display ? (
				<div className="tool-card__section">
					<CopyRow label="目标结果" value={display.directText} />
				</div>
			) : (
				<div className="tool-empty-state">输入数值和基准后显示换算结果。</div>
			)}
			<div style={{ display: 'grid', gap: '6px' }}>
				{display?.results.map((r) => (
					<div
						key={r.unit}
						style={{
							display: 'grid',
							minWidth: 0,
							padding: r.unit === to ? '2px' : 0,
							borderRadius: '6px',
							background: r.unit === to ? 'var(--primary-soft)' : 'transparent',
							border: r.unit === to ? '1px solid var(--primary)' : '1px solid transparent',
						}}
					>
						<CopyRow label={r.label} value={`${r.value} ${unitSuffix(r.unit)}`} />
					</div>
				))}
			</div>
		</div>
	);

	useToolRefPanel('CSS 单位参考', cssUnitReference);

	return <GeneratorPanel ariaLabel="CSS 单位换算工具" controls={controls} result={resultPanel} />;
}
