import { useCallback, useEffect, useState } from 'react';
import { useToolRefPanel } from '../../../components/shared/layouts/RefPanelContext';
import { generateLorem } from './functions';
import { loremReference } from './references';
import GeneratorPanel from '../../../components/shared/layouts/GeneratorPanel';
import { useTheme } from '../../../themes/ThemeContext';

export default function LoremGenerator() {
	const { Button } = useTheme();
	const [paragraphs, setParagraphs] = useState(3);
	const [language, setLanguage] = useState<'zh' | 'en'>('zh');
	const [output, setOutput] = useState('');

	const handleGenerate = useCallback(() => {
		setOutput(generateLorem(paragraphs, language));
	}, [paragraphs, language]);

	// Generate on first render
	useEffect(() => {
		if (!output) {
			setOutput(generateLorem(paragraphs, language));
		}
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	const controls = (
		<div className="tool-card tool-card--controls">
			<div className="tool-card__section">
				<h2 className="tool-card__title">参数设置</h2>
				<div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
					<div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
						<label style={{ fontSize: '0.875rem', color: 'var(--muted)', minWidth: '60px' }}>段落数</label>
						<input
							className="password-length-input"
							type="number"
							min={1}
							max={20}
							value={paragraphs}
							onChange={(e) => {
								const v = Math.max(1, Math.min(20, Number(e.target.value) || 1));
								setParagraphs(v);
							}}
							style={{ width: '80px' }}
							aria-label="段落数"
						/>
					</div>
					<div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
						<label style={{ fontSize: '0.875rem', color: 'var(--muted)', minWidth: '60px' }}>语言</label>
						<div style={{ display: 'flex', gap: '8px' }}>
							<Button variant={language === 'zh' ? 'primary' : 'secondary'} onClick={() => setLanguage('zh')}>中文</Button>
							<Button variant={language === 'en' ? 'primary' : 'secondary'} onClick={() => setLanguage('en')}>英文</Button>
						</div>
					</div>
				</div>
				<Button variant="primary" onClick={handleGenerate} style={{ marginTop: '12px', width: '100%' }}>生成</Button>
			</div>
		</div>
	);

	const resultPanel = (
		<div className="tool-card tool-card--result" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
			<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
				<h2 className="tool-card__title">生成结果</h2>
				<Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(output)}>
					复制
				</Button>
			</div>
			<div
				style={{
					flex: 1,
					overflow: 'auto',
					fontSize: '0.875rem',
					lineHeight: 1.7,
					color: 'var(--fg)',
					whiteSpace: 'pre-wrap',
				}}
			>
				{output}
			</div>
		</div>
	);

	useToolRefPanel('占位文本参考', loremReference);

	return (
		<GeneratorPanel ariaLabel="Lorem Ipsum 生成器" controls={controls} result={resultPanel} />
	);
}
