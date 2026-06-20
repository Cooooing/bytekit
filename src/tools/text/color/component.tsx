import { useMemo, useState } from 'react';
import CopyRow from '../../../components/shared/ui/CopyRow';
import { useToolRefPanel } from '../../../components/shared/layouts/RefPanelContext';
import { parseColor, generatePalette } from './functions';
import { colorReference } from './references';
import GeneratorPanel from '../../../components/shared/layouts/GeneratorPanel';

const PALETTE_LABELS = ['50', '200', '500', '700', '900'];

export default function ColorConverter() {
	const [input, setInput] = useState('#3B82F6');
	const result = useMemo(() => parseColor(input), [input]);
	const palette = useMemo(() => (result.ok ? generatePalette(result.hex) : null), [result]);

	const controls = (
		<div className="tool-card tool-card--controls">
			<div className="tool-card__section">
				<h2 className="tool-card__title">输入颜色值</h2>
				<input
					className="password-length-input"
					type="text"
					value={input}
					onChange={(e) => setInput(e.target.value)}
					placeholder="#FF5733 或 rgb(255, 87, 51) 或 hsl(14, 100%, 60%)"
					aria-label="颜色值"
					style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--surface-subtle)', color: 'var(--text)' }}
				/>
				<input
					type="color"
					className="color-picker-input"
					value={result.ok ? result.hex : '#000000'}
					onChange={(e) => setInput(e.target.value)}
				/>
			</div>
		</div>
	);

	const resultPanel = (
		<div className="tool-card tool-card--result">
			<h2 className="tool-card__title">转换结果</h2>
			{result.ok ? (
				<div style={{ display: 'grid', gap: '12px' }}>
					<div
						style={{
							width: '100%',
							height: '5rem',
							borderRadius: 'var(--radius-md)',
							background: result.rgba,
							border: '1px solid var(--border)',
						}}
					/>
					<div style={{ display: 'grid', gap: '6px' }}>
						<CopyRow label="HEX" value={result.hex} />
						<CopyRow label="RGB" value={result.rgba} />
						<CopyRow label="HSL" value={result.hsla} />
					</div>
					{palette && (
						<div style={{ display: 'grid', gap: '6px' }}>
							<div style={{ fontSize: '0.875rem', color: 'var(--muted)', marginTop: '4px' }}>调色板</div>
							<div style={{ display: 'flex', gap: '8px' }}>
								{palette.map((color, i) => (
									<div key={color} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
										<div
											style={{
												width: '100%',
												height: '2rem',
												borderRadius: 'var(--radius-sm)',
												background: color,
												border: '1px solid var(--border)',
											}}
										/>
										<span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
											{PALETTE_LABELS[i]} {color}
										</span>
									</div>
								))}
							</div>
						</div>
					)}
				</div>
			) : (
				<div style={{ color: 'var(--semantic-danger)' }}>{result.error}</div>
			)}
		</div>
	);

	useToolRefPanel('颜色格式参考', colorReference);

	return (
		<GeneratorPanel ariaLabel="颜色转换工具" controls={controls} result={resultPanel} />
	);
}
