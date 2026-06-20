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
						<CopyRow label="HEX" value={displayResult.hex} />
						<CopyRow label="RGB" value={displayResult.rgba} />
						<CopyRow label="HSL" value={displayResult.hsla} />
						<CopyRow label="Alpha" value={displayResult.alpha.toString()} />
					</div>
					{palette && (
						<div style={{ display: 'grid', gap: '6px' }}>
							<div style={{ fontSize: '0.875rem', color: 'var(--muted)', marginTop: '4px' }}>调色板</div>
							<div style={{ display: 'flex', gap: '8px' }}>
								{palette.map((color, i) => (
									<div key={color} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', minWidth: 0 }}>
										<div
											style={{
												width: '100%',
												height: '2rem',
												borderRadius: 'var(--radius-sm)',
												background: color,
												border: '1px solid var(--border)',
											}}
										/>
										<span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', wordBreak: 'break-all' }}>
											{PALETTE_LABELS[i]} {color}
										</span>
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
