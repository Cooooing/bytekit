import { useEffect, useMemo, useRef, useState } from 'react';
import GeneratorPanel from '@features/tools/shared/GeneratorPanel';
import CopyRow from '@features/tools/shared/CopyRow';
import { useMessageOnError } from '@shared/ui/AppMessage';
import { useToolRefPanel } from '@features/tools/shared/RefPanelContext';
import { useToolStorage } from '@features/tools/shared/useToolStorage';
import { calculateBinary, type BinaryCalculateResult, type BinaryOperation } from './functions';
import { binaryReference } from './references';

const operations: Array<{ value: BinaryOperation; label: string; desc: string; needsShift?: boolean; needsWidth?: boolean }> = [
	{ value: 'and', label: 'AND', desc: '所有输入逐位与。' },
	{ value: 'or', label: 'OR', desc: '所有输入逐位或。' },
	{ value: 'xor', label: 'XOR', desc: '所有输入逐位异或。' },
	{ value: 'nand', label: 'NAND', desc: 'AND 后按位取反。', needsWidth: true },
	{ value: 'nor', label: 'NOR', desc: 'OR 后按位取反。', needsWidth: true },
	{ value: 'xnor', label: 'XNOR', desc: 'XOR 后按位取反。', needsWidth: true },
	{ value: 'add', label: 'ADD', desc: '所有输入相加。' },
	{ value: 'subtract', label: 'SUB', desc: '按输入顺序连续相减。' },
	{ value: 'multiply', label: 'MUL', desc: '所有输入相乘。' },
	{ value: 'divide', label: 'DIV', desc: '按输入顺序连续整除。' },
	{ value: 'mod', label: 'MOD', desc: '按输入顺序连续取模。' },
	{ value: 'not', label: 'NOT', desc: '单个输入按位取反。', needsWidth: true },
	{ value: 'shift-left', label: 'SHL', desc: '单个输入左移。', needsShift: true },
	{ value: 'shift-right', label: 'SHR', desc: '单个输入右移。', needsShift: true },
	{ value: 'rotate-left', label: 'ROL', desc: '单个输入循环左移。', needsShift: true, needsWidth: true },
	{ value: 'rotate-right', label: 'ROR', desc: '单个输入循环右移。', needsShift: true, needsWidth: true },
];

const widthOptions = [
	{ value: 'auto', label: '自动' },
	{ value: '8', label: '8 位' },
	{ value: '16', label: '16 位' },
	{ value: '32', label: '32 位' },
	{ value: '64', label: '64 位' },
	{ value: 'custom', label: '自定义' },
] as const;

type WidthMode = typeof widthOptions[number]['value'];

interface BinaryState {
	input: string;
	operation: BinaryOperation;
	widthMode: WidthMode;
	customWidth: number;
	shift: number;
}

export default function BinaryCalculator() {
	const [state, setState] = useToolStorage<BinaryState>('bytekit:tool:binary:v1', {
		input: '1010\n1100\n0b1111',
		operation: 'and',
		widthMode: 'auto',
		customWidth: 8,
		shift: 1,
	});
	const [lastResult, setLastResult] = useState<BinaryCalculateResult | null>(null);
	const lastError = useRef('');
	const activeOperation = operations.find((item) => item.value === state.operation) ?? operations[0];
	const width = resolveWidth(state.widthMode, state.customWidth);

	const result = useMemo(() => calculateBinary({
		operation: state.operation,
		input: state.input,
		width,
		shift: state.shift,
	}), [state.input, state.operation, state.shift, width]);

	useEffect(() => {
		if (result.ok) {
			setLastResult(result.result);
			lastError.current = '';
			return;
		}
		if (result.error !== lastError.current) {
			lastError.current = result.error;
		}
	}, [result]);

	useMessageOnError(result.ok ? undefined : result.error);
	useToolRefPanel('二进制运算参考', binaryReference);

	const controls = (
		<div className="tool-card tool-card--controls">
			<div className="tool-card__section">
				<h2 className="tool-card__title">输入值</h2>
				<textarea
					className="tool-textarea"
					value={state.input}
					onChange={(event) => updateState({ input: event.target.value })}
					placeholder="每行一个输入，如 1010、0b1010、0x0a、0o12"
					aria-label="二进制运算输入"
					rows={8}
				/>
				<p style={{ color: 'var(--muted)', fontSize: '0.8rem', lineHeight: 1.5 }}>
					支持空格、换行、逗号分隔；无前缀且只包含 0/1 时按二进制解析。
				</p>
			</div>

			<div className="tool-card__section">
				<h2 className="tool-card__title">运算</h2>
				<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(5rem, 1fr))', gap: '8px' }}>
					{operations.map((operation) => (
						<label
							key={operation.value}
							className={state.operation === operation.value ? 'regex-flag regex-flag--active' : 'regex-flag'}
							title={operation.desc}
							style={state.operation === operation.value ? { borderWidth: '2px', boxShadow: '0 0 0 2px var(--primary-soft)', background: 'var(--primary-soft)' } : undefined}
						>
							<input
								type="radio"
								name="binary-operation"
								value={operation.value}
								checked={state.operation === operation.value}
								onChange={() => updateState({ operation: operation.value })}
								className="sr-only"
							/>
							<span className="regex-flag__code">{operation.label}</span>
						</label>
					))}
				</div>
				<p style={{ color: 'var(--muted)', fontSize: '0.8rem', lineHeight: 1.5 }}>{activeOperation.desc}</p>
			</div>

			<div className="tool-card__section">
				<h2 className="tool-card__title">位宽</h2>
				<div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
					{widthOptions.map((option) => (
						<label
							key={option.value}
							className={state.widthMode === option.value ? 'regex-flag regex-flag--active' : 'regex-flag'}
							style={state.widthMode === option.value ? { borderWidth: '2px', boxShadow: '0 0 0 2px var(--primary-soft)', background: 'var(--primary-soft)' } : undefined}
						>
							<input
								type="radio"
								name="binary-width"
								value={option.value}
								checked={state.widthMode === option.value}
								onChange={() => updateState({ widthMode: option.value })}
								className="sr-only"
							/>
							<span className="regex-flag__label">{option.label}</span>
						</label>
					))}
				</div>
				{state.widthMode === 'custom' ? (
					<input
						className="tool-textarea"
						type="number"
						min={1}
						max={4096}
						value={state.customWidth}
						onChange={(event) => updateState({ customWidth: Number(event.target.value) })}
						aria-label="自定义位宽"
						style={{ marginTop: '8px' }}
					/>
				) : null}
			</div>

			{activeOperation.needsShift ? (
				<div className="tool-card__section">
					<h2 className="tool-card__title">移位数量</h2>
					<input
						className="tool-textarea"
						type="number"
						min={0}
						value={state.shift}
						onChange={(event) => updateState({ shift: Number(event.target.value) })}
						aria-label="移位数量"
					/>
				</div>
			) : null}
		</div>
	);

	const resultPanel = (
		<div className="tool-card tool-card--result">
			<h2 className="tool-card__title">运算结果</h2>
			{lastResult ? (
				<div style={{ display: 'grid', gap: 'var(--space-3)' }}>
					<div className="tool-card__section">
						<div className="tool-card__title-row">
							<span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>当前位宽</span>
						</div>
						<div style={{ fontSize: '1rem', fontWeight: 650 }}>{lastResult.width} 位</div>
					</div>
					<div style={{ display: 'grid', gap: '6px' }}>
						<CopyRow label="二进制" value={lastResult.binary} density="long" />
						<CopyRow label="十进制" value={lastResult.decimal} density="long" />
						<CopyRow label="十六进制" value={lastResult.hex} density="long" />
						<CopyRow label="八进制" value={lastResult.octal} density="long" />
					</div>
					<div className="tool-card__section">
						<div className="tool-card__title-row">
							<span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>输入数量</span>
						</div>
						<div style={{ fontSize: '1rem', fontWeight: 650 }}>{lastResult.inputs.length}</div>
					</div>
				</div>
			) : (
				<div className="state-box">输入数值后显示运算结果。</div>
			)}
		</div>
	);

	return <GeneratorPanel ariaLabel="二进制运算工具" controls={controls} result={resultPanel} />;

	function updateState(partial: Partial<BinaryState>) {
		setState((current) => ({ ...current, ...partial }));
	}
}

function resolveWidth(widthMode: WidthMode, customWidth: number): number | undefined {
	if (widthMode === 'auto') return undefined;
	if (widthMode === 'custom') return customWidth;
	return Number(widthMode);
}
