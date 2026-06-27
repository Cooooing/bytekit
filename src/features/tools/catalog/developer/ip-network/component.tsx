import { useEffect, useMemo, useRef, useState } from 'react';
import GeneratorPanel from '@features/tools/shared/GeneratorPanel';
import CopyRow from '@features/tools/shared/CopyRow';
import { useToolRefPanel } from '@features/tools/shared/RefPanelContext';
import { useToolStorage } from '@features/tools/shared/useToolStorage';
import { useMessageOnError } from '@shared/ui/AppMessage';
import { calculateIpNetwork, type IpNetworkMode, type IpNetworkResult, type IpNetworkRow } from './functions';
import { ipNetworkReference } from './references';

const modes: Array<{ value: IpNetworkMode; label: string; desc: string }> = [
	{ value: 'auto', label: '自动识别', desc: '自动识别 IP、CIDR、掩码和 IPv4 地址范围。' },
	{ value: 'cidr', label: 'CIDR 子网', desc: '按 IP/前缀长度计算网络地址、广播地址和主机范围。' },
	{ value: 'mask', label: '掩码转换', desc: '把 IPv4 子网掩码转换为前缀长度和反掩码。' },
	{ value: 'batch', label: '批量分析', desc: '每行一个输入，合法行和错误行都会保留在结果里。' },
];

interface IpNetworkState {
	input: string;
	mode: IpNetworkMode;
}

export default function IpNetworkCalculator() {
	const [state, setState] = useToolStorage<IpNetworkState>('bytekit:tool:ip-network:v1', {
		input: '192.168.1.10/24\n255.255.255.0\n2001:db8::1',
		mode: 'auto',
	});
	const [lastResult, setLastResult] = useState<IpNetworkResult | null>(null);
	const lastError = useRef('');
	const result = useMemo(() => calculateIpNetwork(state), [state]);
	const activeMode = modes.find((mode) => mode.value === state.mode) ?? modes[0];

	useEffect(() => {
		if (result.ok) {
			setLastResult(result.result);
			lastError.current = '';
			return;
		}
		if (result.error !== lastError.current) lastError.current = result.error;
	}, [result]);

	useMessageOnError(result.ok ? undefined : result.error);
	useToolRefPanel('IP 网络参考', ipNetworkReference);

	const controls = (
		<div className="tool-card tool-card--controls">
			<div className="tool-card__section">
				<h2 className="tool-card__title">输入</h2>
				<textarea
					className="tool-textarea"
					value={state.input}
					onChange={(event) => updateState({ input: event.target.value })}
					placeholder="例如 192.168.1.10/24、255.255.255.0、192.168.1.1-192.168.1.20"
					aria-label="IP 网络计算输入"
					rows={9}
				/>
				<p style={{ color: 'var(--muted)', fontSize: '0.8rem', lineHeight: 1.5 }}>{activeMode.desc}</p>
			</div>

			<div className="tool-card__section">
				<h2 className="tool-card__title">模式</h2>
				<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(7rem, 1fr))', gap: '8px' }}>
					{modes.map((mode) => (
						<label
							key={mode.value}
							className={state.mode === mode.value ? 'regex-flag regex-flag--active' : 'regex-flag'}
							title={mode.desc}
							style={state.mode === mode.value ? activeOptionStyle : undefined}
						>
							<input
								type="radio"
								name="ip-network-mode"
								value={mode.value}
								checked={state.mode === mode.value}
								onChange={() => updateState({ mode: mode.value })}
								className="sr-only"
							/>
							<span className="regex-flag__label">{mode.label}</span>
						</label>
					))}
				</div>
			</div>
		</div>
	);

	const resultPanel = (
		<div className="tool-card tool-card--result">
			<h2 className="tool-card__title">计算结果</h2>
			{lastResult ? (
				<div style={{ display: 'grid', gap: 'var(--space-4)' }}>
					{lastResult.rows.map((row, index) => (
						<IpResultBlock key={`${row.source}-${index}`} row={row} index={index} />
					))}
				</div>
			) : (
				<div className="state-box">输入 IP、CIDR、掩码或地址范围后显示计算结果。</div>
			)}
		</div>
	);

	return <GeneratorPanel ariaLabel="IP 网络计算器" controls={controls} result={resultPanel} />;

	function updateState(partial: Partial<IpNetworkState>) {
		setState((current) => ({ ...current, ...partial }));
	}
}

function IpResultBlock({ row, index }: { row: IpNetworkRow; index: number }) {
	if (!row.ok) {
		return (
			<div className="tool-card__section">
				<div className="tool-card__title-row">
					<span style={captionStyle}>输入 #{index + 1}</span>
					<span style={{ ...badgeStyle, color: 'var(--semantic-danger)' }}>错误</span>
				</div>
				<CopyRow label="原始值" value={row.source} density="long" />
				<div className="state-box state-box--error" style={{ minHeight: 'auto', padding: 'var(--space-3)' }}>{row.error}</div>
			</div>
		);
	}

	if (row.kind === 'cidr') {
		return (
			<div className="tool-card__section">
				<ResultHead index={index} label="CIDR 子网" />
				<CopyRow label="输入地址" value={row.ip} density="long" />
				<CopyRow label="网络地址" value={row.network} density="long" />
				<CopyRow label="广播地址" value={row.broadcast} density="long" />
				<CopyRow label="可用范围" value={`${row.firstUsable} - ${row.lastUsable}`} density="long" />
				<CopyRow label="地址数量" value={row.totalAddresses} density="long" />
				<CopyRow label="可用主机" value={row.usableHosts} density="long" />
				<CopyRow label="子网掩码" value={row.subnetMask} density="long" />
				<CopyRow label="反掩码" value={row.wildcardMask} density="long" />
				<CopyRow label="地址类型" value={row.types.join('、')} density="long" />
			</div>
		);
	}

	if (row.kind === 'mask') {
		return (
			<div className="tool-card__section">
				<ResultHead index={index} label="掩码" />
				<CopyRow label="子网掩码" value={row.mask} density="long" />
				<CopyRow label="前缀长度" value={`/${row.prefix}`} density="long" />
				<CopyRow label="反掩码" value={row.wildcardMask} density="long" />
				<CopyRow label="二进制" value={row.binary} density="long" />
			</div>
		);
	}

	if (row.kind === 'range') {
		return (
			<div className="tool-card__section">
				<ResultHead index={index} label="IPv4 范围" />
				<CopyRow label="起始地址" value={row.start} density="long" />
				<CopyRow label="结束地址" value={row.end} density="long" />
				<CopyRow label="地址数量" value={row.totalAddresses} density="long" />
			</div>
		);
	}

	return (
		<div className="tool-card__section">
			<ResultHead index={index} label={row.kind.toUpperCase()} />
			<CopyRow label="标准地址" value={row.normalized} density="long" />
			<CopyRow label="地址类型" value={row.types.join('、')} density="long" />
			{row.decimal ? <CopyRow label="十进制整数" value={row.decimal} density="long" /> : null}
			{row.hex ? <CopyRow label="十六进制" value={row.hex} density="long" /> : null}
			{row.binary ? <CopyRow label="二进制" value={row.binary} density="long" /> : null}
		</div>
	);
}

function ResultHead({ index, label }: { index: number; label: string }) {
	return (
		<div className="tool-card__title-row">
			<span style={captionStyle}>输入 #{index + 1}</span>
			<span style={badgeStyle}>{label}</span>
		</div>
	);
}

const activeOptionStyle = {
	borderWidth: '2px',
	boxShadow: '0 0 0 2px var(--primary-soft)',
	background: 'var(--primary-soft)',
};

const captionStyle = {
	fontSize: '0.8rem',
	color: 'var(--muted)',
} as const;

const badgeStyle = {
	fontSize: '0.75rem',
	fontWeight: 700,
	color: 'var(--primary-strong)',
} as const;
