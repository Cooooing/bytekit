import { useEffect, useMemo, useRef, useState } from 'react';
import GeneratorPanel from '@features/tools/shared/GeneratorPanel';
import { useToolRefPanel } from '@features/tools/shared/RefPanelContext';
import { useMessageOnError } from '@shared/ui/AppMessage';
import CopyRow from '@features/tools/shared/CopyRow';
import { useToolStorage } from '@features/tools/shared/useToolStorage';
import { convertBases, type BaseConversionResult, type BaseInputMode } from './functions';
import { baseConverterReference } from './references';

const inputModes: Array<{ value: BaseInputMode; label: string; desc: string }> = [
	{ value: 'auto', label: '自动', desc: '识别 0b、0o、0x 前缀；无前缀按十进制解析。' },
	{ value: 'base-2', label: '二进制', desc: '按 2 进制解析输入。' },
	{ value: 'base-8', label: '八进制', desc: '按 8 进制解析输入。' },
	{ value: 'base-10', label: '十进制', desc: '按 10 进制解析输入。' },
	{ value: 'base-16', label: '十六进制', desc: '按 16 进制解析输入。' },
	{ value: 'custom', label: '自定义', desc: '按指定的 2-36 进制解析输入。' },
];

interface BaseConverterState {
	input: string;
	inputMode: BaseInputMode;
	sourceBase: number;
	targetBase: number;
}

export default function BaseConverter() {
	const [state, setState] = useToolStorage<BaseConverterState>('bytekit:tool:base-converter:v1', {
		input: '0b1010\n0xFF\n255',
		inputMode: 'auto',
		sourceBase: 36,
		targetBase: 36,
	});
	const [lastResult, setLastResult] = useState<BaseConversionResult | null>(null);
	const lastError = useRef('');
	const result = useMemo(() => convertBases(state), [state]);
	const activeInputMode = inputModes.find((item) => item.value === state.inputMode) ?? inputModes[0];

	useEffect(() => {
		if (result.ok) {
			setLastResult(result.result);
			lastError.current = '';
			return;
		}
		if (result.error !== lastError.current) lastError.current = result.error;
	}, [result]);

	useMessageOnError(result.ok ? undefined : result.error);
	useToolRefPanel('进制转换参考', baseConverterReference);

	const controls = (
		<div className="tool-card tool-card--controls">
			<div className="tool-card__section">
				<h2 className="tool-card__title">输入数值</h2>
				<textarea
					className="tool-textarea"
					value={state.input}
					onChange={(event) => updateState({ input: event.target.value })}
					placeholder="每行一个数值，例如 0b1010、0xFF、ZZ"
					aria-label="进制转换输入"
					rows={8}
				/>
				<p style={{ color: 'var(--muted)', fontSize: '0.8rem', lineHeight: 1.5 }}>{activeInputMode.desc}</p>
			</div>

			<div className="tool-card__section">
				<h2 className="tool-card__title">源进制</h2>
				<div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
					{inputModes.map((mode) => (
						<label
							key={mode.value}
							className={state.inputMode === mode.value ? 'regex-flag regex-flag--active' : 'regex-flag'}
							title={mode.desc}
							style={state.inputMode === mode.value ? activeFlagStyle : undefined}
						>
							<input
								type="radio"
								name="base-input-mode"
								value={mode.value}
								checked={state.inputMode === mode.value}
								onChange={() => updateState({ inputMode: mode.value })}
								className="sr-only"
							/>
							<span className="regex-flag__label">{mode.label}</span>
						</label>
					))}
				</div>
				{state.inputMode === 'custom' ? (
					<label style={fieldLabelStyle}>
						<span>源进制</span>
						<input
							className="tool-textarea"
							type="number"
							min={2}
							max={36}
							value={state.sourceBase}
							onChange={(event) => updateState({ sourceBase: Number(event.target.value) })}
							aria-label="自定义源进制"
						/>
					</label>
				) : null}
			</div>

			<div className="tool-card__section">
				<h2 className="tool-card__title">自定义目标进制</h2>
				<input
					className="tool-textarea"
					type="number"
					min={2}
					max={36}
					value={state.targetBase}
					onChange={(event) => updateState({ targetBase: Number(event.target.value) })}
					aria-label="自定义目标进制"
				/>
			</div>
		</div>
	);

	const resultPanel = (
		<div className="tool-card tool-card--result">
			<h2 className="tool-card__title">转换结果</h2>
			{lastResult ? (
				<div style={{ display: 'grid', gap: 'var(--space-4)' }}>
					{lastResult.rows.map((row, index) => (
						<div key={`${row.source}-${index}`} className="tool-card__section">
							<div className="tool-card__title-row">
								<span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>输入 #{index + 1}</span>
							</div>
							<CopyRow label="原始值" value={row.source} density="long" />
							<CopyRow label="二进制" value={row.binary} density="long" />
							<CopyRow label="八进制" value={row.octal} density="long" />
							<CopyRow label="十进制" value={row.decimal} density="long" />
							<CopyRow label="十六进制" value={row.hex} density="long" />
							<CopyRow label={`${lastResult.targetBase} 进制`} value={row.custom} density="long" />
						</div>
					))}
				</div>
			) : (
				<div className="state-box">输入数值后显示转换结果。</div>
			)}
		</div>
	);

	return <GeneratorPanel ariaLabel="进制转换器" controls={controls} result={resultPanel} />;

	function updateState(partial: Partial<BaseConverterState>) {
		setState((current) => ({ ...current, ...partial }));
	}
}

const activeFlagStyle = {
	borderWidth: '2px',
	boxShadow: '0 0 0 2px var(--primary-soft)',
	background: 'var(--primary-soft)',
};

const fieldLabelStyle = {
	display: 'grid',
	gap: '4px',
	marginTop: '8px',
	fontSize: '0.8rem',
	color: 'var(--muted)',
} as const;
