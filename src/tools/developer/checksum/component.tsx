import { useEffect, useMemo, useRef, useState } from 'react';
import GeneratorPanel from '../../../components/shared/layouts/GeneratorPanel';
import { useToolRefPanel } from '../../../components/shared/layouts/RefPanelContext';
import CopyRow from '../../../components/shared/ui/CopyRow';
import { useMessageOnError } from '../../../components/shared/ui/AppMessage';
import { useTheme } from '../../../themes/ThemeContext';
import { useToolStorage } from '../../../hooks/useToolStorage';
import {
	calculateChecksum,
	type ChecksumAlgorithm,
	type ChecksumInputMode,
	type ChecksumResult,
} from './functions';
import { checksumReference } from './references';

const inputModes: Array<{ value: ChecksumInputMode; label: string; desc: string }> = [
	{ value: 'hex', label: 'Hex 字节', desc: '适合串口、Modbus 和设备报文。' },
	{ value: 'text', label: '文本', desc: '按 UTF-8 字节计算。' },
	{ value: 'binary', label: '二进制字节', desc: '每 8 位组成一个字节。' },
];

const algorithms: Array<{ value: ChecksumAlgorithm; label: string; desc: string }> = [
	{ value: 'crc16-modbus', label: 'CRC16/MODBUS', desc: '设备通信和 Modbus RTU 常用。' },
	{ value: 'crc16-ccitt-false', label: 'CRC16/CCITT-FALSE', desc: '通信协议和嵌入式场景常见。' },
	{ value: 'crc16-xmodem', label: 'CRC16/XMODEM', desc: 'XMODEM 协议变体。' },
	{ value: 'crc16-kermit', label: 'CRC16/KERMIT', desc: 'KERMIT 协议变体。' },
	{ value: 'crc16-ibm-arc', label: 'CRC16/IBM-ARC', desc: 'ARC、IBM、ANSI 常见变体。' },
	{ value: 'crc16-usb', label: 'CRC16/USB', desc: 'USB 协议 CRC16 变体。' },
	{ value: 'crc16-custom', label: 'CRC16 自定义', desc: '手动设置多项式、初始值、反射和结果异或。' },
	{ value: 'crc32', label: 'CRC32', desc: '文件、压缩包和数据块常用。' },
	{ value: 'crc8', label: 'CRC8', desc: '8 位 CRC 标准变体。' },
	{ value: 'crc8-maxim', label: 'CRC8/MAXIM', desc: 'Maxim/Dallas 常见 8 位 CRC。' },
	{ value: 'lrc', label: 'LRC', desc: '纵向冗余校验，常见于简单报文。' },
	{ value: 'bcc', label: 'BCC/XOR', desc: '逐字节异或校验。' },
];

interface ChecksumState {
	input: string;
	inputMode: ChecksumInputMode;
	algorithm: ChecksumAlgorithm;
	customCrc16: {
		poly: string;
		init: string;
		xorout: string;
		refin: boolean;
		refout: boolean;
	};
}

export default function ChecksumCalculator() {
	const { Button } = useTheme();
	const [state, setState] = useToolStorage<ChecksumState>('bytekit:tool:checksum:v1', {
		input: '01 03 00 00 00 02',
		inputMode: 'hex',
		algorithm: 'crc16-modbus',
		customCrc16: {
			poly: '0x8005',
			init: '0xffff',
			xorout: '0x0000',
			refin: true,
			refout: true,
		},
	});
	const [lastResult, setLastResult] = useState<ChecksumResult | null>(null);
	const lastError = useRef('');

	const activeInputMode = inputModes.find((item) => item.value === state.inputMode) ?? inputModes[0];
	const activeAlgorithm = algorithms.find((item) => item.value === state.algorithm) ?? algorithms[0];
	const result = useMemo(() => calculateChecksum(state), [state]);

	useEffect(() => {
		if (result.ok) {
			setLastResult(result.result);
			lastError.current = '';
			return;
		}
		if (result.error !== lastError.current) lastError.current = result.error;
	}, [result]);

	useMessageOnError(result.ok ? undefined : result.error);
	useToolRefPanel('校验码参考', checksumReference);

	const controls = (
		<div className="tool-card tool-card--controls">
			<div className="tool-card__section">
				<h2 className="tool-card__title">输入内容</h2>
				<textarea
					className="tool-textarea"
					value={state.input}
					onChange={(event) => updateState({ input: event.target.value })}
					placeholder={state.inputMode === 'hex' ? '例如 01 03 00 00 00 02' : state.inputMode === 'binary' ? '例如 00000001 00000011' : '输入文本内容'}
					aria-label="校验码输入内容"
					rows={7}
				/>
				<p style={{ color: 'var(--muted)', fontSize: '0.8rem', lineHeight: 1.5 }}>
					{activeInputMode.desc}
				</p>
			</div>

			<div className="tool-card__section">
				<h2 className="tool-card__title">输入模式</h2>
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
								name="checksum-input-mode"
								value={mode.value}
								checked={state.inputMode === mode.value}
								onChange={() => updateState({ inputMode: mode.value })}
								className="sr-only"
							/>
							<span className="regex-flag__label">{mode.label}</span>
						</label>
					))}
				</div>
			</div>

			<div className="tool-card__section">
				<h2 className="tool-card__title">算法</h2>
				<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(9rem, 1fr))', gap: '8px' }}>
					{algorithms.map((algorithm) => (
						<label
							key={algorithm.value}
							className={state.algorithm === algorithm.value ? 'regex-flag regex-flag--active' : 'regex-flag'}
							title={algorithm.desc}
							style={state.algorithm === algorithm.value ? activeFlagStyle : undefined}
						>
							<input
								type="radio"
								name="checksum-algorithm"
								value={algorithm.value}
								checked={state.algorithm === algorithm.value}
								onChange={() => updateState({ algorithm: algorithm.value })}
								className="sr-only"
							/>
							<span className="regex-flag__code">{algorithm.label}</span>
						</label>
					))}
				</div>
				<p style={{ color: 'var(--muted)', fontSize: '0.8rem', lineHeight: 1.5 }}>{activeAlgorithm.desc}</p>
			</div>

			{state.algorithm === 'crc16-custom' ? (
				<div className="tool-card__section">
					<h2 className="tool-card__title">CRC16 参数</h2>
					<div style={{ display: 'grid', gap: '8px' }}>
						<label style={fieldLabelStyle}>
							<span>多项式</span>
							<input className="tool-textarea" type="text" value={state.customCrc16.poly} onChange={(event) => updateCustom({ poly: event.target.value })} aria-label="CRC16 多项式" />
						</label>
						<label style={fieldLabelStyle}>
							<span>初始值</span>
							<input className="tool-textarea" type="text" value={state.customCrc16.init} onChange={(event) => updateCustom({ init: event.target.value })} aria-label="CRC16 初始值" />
						</label>
						<label style={fieldLabelStyle}>
							<span>结果异或</span>
							<input className="tool-textarea" type="text" value={state.customCrc16.xorout} onChange={(event) => updateCustom({ xorout: event.target.value })} aria-label="CRC16 结果异或" />
						</label>
						<div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
							<CheckToggle label="输入反射" checked={state.customCrc16.refin} onChange={(refin) => updateCustom({ refin })} />
							<CheckToggle label="输出反射" checked={state.customCrc16.refout} onChange={(refout) => updateCustom({ refout })} />
						</div>
					</div>
				</div>
			) : null}
		</div>
	);

	const resultPanel = (
		<div className="tool-card tool-card--result">
			<h2 className="tool-card__title">校验结果</h2>
			{lastResult ? (
				<div style={{ display: 'grid', gap: 'var(--space-4)' }}>
					<div className="tool-card__section">
						<div className="tool-card__title-row">
							<span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>当前算法</span>
						</div>
						<div style={{ fontSize: '1rem', fontWeight: 650, lineHeight: 1.5 }}>{lastResult.label}</div>
						<div style={{ color: 'var(--muted)', fontSize: '0.8rem', marginTop: '4px' }}>
							{lastResult.width} 位，输入 {lastResult.byteLength} 字节
						</div>
					</div>
					<div style={{ display: 'grid', gap: '6px' }}>
						<CopyRow label="Hex" value={lastResult.hex} density="long" />
						<CopyRow label="十进制" value={lastResult.decimal} density="long" />
						<CopyRow label="二进制" value={lastResult.binary} density="long" />
						<CopyRow label="高字节在前" value={lastResult.highFirst} density="long" />
						<CopyRow label="低字节在前" value={lastResult.lowFirst} density="long" />
					</div>
					<div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
						<Button variant="secondary" size="sm" onClick={() => updateState({ input: lastResult.lowFirst, inputMode: 'hex' })}>
							使用低字节结果
						</Button>
						<Button variant="ghost" size="sm" onClick={() => updateState({ input: lastResult.highFirst, inputMode: 'hex' })}>
							使用高字节结果
						</Button>
					</div>
				</div>
			) : (
				<div className="state-box">输入内容后显示校验码。</div>
			)}
		</div>
	);

	return <GeneratorPanel ariaLabel="校验码计算器" controls={controls} result={resultPanel} />;

	function updateState(partial: Partial<ChecksumState>) {
		setState((current) => ({ ...current, ...partial }));
	}

	function updateCustom(partial: Partial<ChecksumState['customCrc16']>) {
		setState((current) => ({
			...current,
			customCrc16: { ...current.customCrc16, ...partial },
		}));
	}
}

function CheckToggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
	return (
		<label className={checked ? 'regex-flag regex-flag--active' : 'regex-flag'} style={checked ? activeFlagStyle : undefined}>
			<input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="sr-only" />
			<span className="regex-flag__label">{label}</span>
		</label>
	);
}

const activeFlagStyle = {
	borderWidth: '2px',
	boxShadow: '0 0 0 2px var(--primary-soft)',
	background: 'var(--primary-soft)',
};

const fieldLabelStyle = {
	display: 'grid',
	gap: '4px',
	fontSize: '0.8rem',
	color: 'var(--muted)',
} as const;
