import { useMemo, useState } from 'react';
import CopyRow from '../../../components/shared/ui/CopyRow';
import { useToolRefPanel } from '../../../components/shared/layouts/RefPanelContext';
import { generatePalette } from './functions';
import { colorPaletteReference } from './references';
import GeneratorPanel from '../../../components/shared/layouts/GeneratorPanel';

export default function ColorPalette() {
	const [input, setInput] = useState('#3B82F6');
	const result = useMemo(() => generatePalette(input), [input]);

	const controls = (
		<div className="tool-card tool-card--controls">
			<div className="tool-card__section">
				<h2 className="tool-card__title">选择基础颜色</h2>
				<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
					<input
						type="color"
						className="color-picker-input"
						value={result.ok ? input : '#3B82F6'}
						onChange={(e) => setInput(e.target.value)}
					/>
					<input
						className="password-length-input"
						type="text"
						value={input}
						onChange={(e) => setInput(e.target.value)}
						placeholder="#3B82F6"
						aria-label="HEX 颜色值"
						style={{ flex: 1, padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--surface-subtle)', color: 'var(--text)' }}
					/>
				</div>
			</div>
		</div>
	);

	const resultPanel = (
		<div className="tool-card tool-card--result">
			<h2 className="tool-card__title">调色板</h2>
			{result.ok ? (
				<div style={{ display: 'grid', gap: '8px' }}>
					<div style={{ display: 'flex', gap: '4px', borderRadius: 'var(--radius-md)', overflow: 'hidden', height: '4rem', border: '1px solid var(--border)' }}>
						{result.colors.map((color, i) => (
							<div
								key={i}
								style={{ flex: 1, background: color }}
								title={color}
							/>
						))}
					</div>
					<div style={{ display: 'grid', gap: '4px' }}>
						{result.colors.map((color, i) => (
							<CopyRow key={i} label={`${['50', '200', '500', '700', '900'][i]}`} value={color} />
						))}
					</div>
				</div>
			) : (
				<div style={{ color: 'var(--semantic-danger)' }}>{result.error}</div>
			)}
		</div>
	);

	useToolRefPanel('调色板参考', colorPaletteReference);

	return (
		<GeneratorPanel ariaLabel="颜色调色板工具" controls={controls} result={resultPanel} />
	);
}
