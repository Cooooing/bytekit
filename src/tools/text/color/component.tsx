import { useMemo, useState } from 'react';
import CopyRow from '../../../components/shared/ui/CopyRow';
import { useToolRefPanel } from '../../../components/shared/layouts/RefPanelContext';
import { parseColor, generatePalette } from './functions';
import { colorReference } from './references';
import GeneratorPanel from '../../../components/shared/layouts/GeneratorPanel';
import { useMessageOnError } from '../../../components/shared/ui/AppMessage';

const PALETTE_LABELS = ['50', '200', '500', '700', '900'];

export default function ColorConverter() {
	const [input, setInput] = useState('#3B82F680');
	const result = useMemo(() => parseColor(input), [input]);
	useMessageOnError(result.ok ? undefined : result.error);

	const displayResult = result.ok ? result : null;
	const palette = useMemo(() => (displayResult ? generatePalette(displayResult.hex) : null), [displayResult]);

	const pickerValue = displayResult ? displayResult.hex.slice(0, 7) : '#000000';

	const controls = (
		<div className="tool-card tool-card--controls">
			<div className="tool-card__section">
				<h2 className="tool-card__title">输入颜色值</h2>
				<input
					className="password-length-input"
					type="text"
					value={input}
					onChange={(e) => setInput(e.target.value)}
					placeholder="#FF5733、#FF573380、rgb(255, 87, 51)、hsl(14, 100%, 60%)"
					aria-label="颜色值"
					style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--surface-subtle)', color: 'var(--text)' }}
				/>
				<input
					type="color"
					className="color-picker-input"
					value={pickerValue}
					onChange={(e) => setInput(e.target.value)}
					aria-label="颜色选择器"
				/>
			</div>
		</div>
	);

	const resultPanel = (
		<div className="tool-card tool-card--result">
			<h2 className="tool-card__title">转换结果</h2>
			{displayResult ? (
				<div style={{ display: 'grid', gap: '12px' }}>
					<div
						style={{
							width: '100%',
							height: '5rem',
							borderRadius: 'var(--radius-md)',
							background: displayResult.rgba,
							border: '1px solid var(--border)',
						}}
					/>
					<div style={{ display: 'grid', gap: '6px' }}>
						<CopyRow label="HEX" value={displayResult.hex} density="compact" />
						<CopyRow label="RGB" value={displayResult.rgba} density="compact" />
						<CopyRow label="HSL" value={displayResult.hsla} density="compact" />
						<CopyRow label="Alpha" value={displayResult.alpha.toString()} density="compact" />
					</div>
					{palette && (
						<div className="tool-card__section color-palette">
							<div className="tool-card__title-row">
								<h3 className="tool-card__title">调色板</h3>
							</div>
							<div className="color-palette__grid">
								{palette.map((color, i) => (
									<div key={color} className="color-palette__item">
										<div className="color-palette__swatch" style={{ background: color }} />
										<CopyRow label={PALETTE_LABELS[i]} value={color} density="compact" />
									</div>
								))}
							</div>
						</div>
					)}
				</div>
			) : (
				<div className="state-box">输入颜色值后显示转换结果。</div>
			)}
		</div>
	);

	useToolRefPanel('颜色格式参考', colorReference);

	return (
		<GeneratorPanel ariaLabel="颜色转换工具" controls={controls} result={resultPanel} />
	);
}
