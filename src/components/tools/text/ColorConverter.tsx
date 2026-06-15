import { useMemo, useState } from 'react';
import CopyRow from '../../ui/CopyRow';
import ReferencePanel from '../../ui/ReferencePanel';
import { parseColor } from '../../../lib/tools/text/color';
import { colorReference } from '../../../lib/tools/references';
import { GeneratorPanel } from '../ToolLayouts';

export default function ColorConverter() {
	const [input, setInput] = useState('#3B82F6');
	const result = useMemo(() => parseColor(input), [input]);

	const controls = (
		<div className="password-card password-card--controls">
			<div className="password-card__section">
				<h2 className="password-card__title">输入颜色值</h2>
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
					value={result.ok ? result.hex : '#000000'}
					onChange={(e) => setInput(e.target.value)}
					style={{ width: '100%', height: '3rem', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', marginTop: '8px' }}
				/>
			</div>
		</div>
	);

	const resultPanel = (
		<div className="password-card password-card--result">
			<h2 className="password-card__title">转换结果</h2>
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
				</div>
			) : (
				<div style={{ color: 'var(--semantic-danger)' }}>{result.error}</div>
			)}
		</div>
	);

	return (
		<>
			<GeneratorPanel ariaLabel="颜色转换工具" controls={controls} result={resultPanel} />
			<ReferencePanel title="颜色格式参考" sections={colorReference} />
		</>
	);
}
