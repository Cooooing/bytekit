import { useCallback, useState } from 'react';
import GeneratorPanel from '@features/tools/shared/GeneratorPanel';
import CopyRow from '@features/tools/shared/CopyRow';
import { useToolRefPanel } from '@features/tools/shared/RefPanelContext';
import { useAppMessage } from '@shared/ui/AppMessage';
import { useTheme } from '@themes/ThemeContext';
import type { IpInfoResponse, IpInfoSource } from './functions';
import { ipInfoReference } from './references';

export default function IpInfoLookup() {
	const { Button } = useTheme();
	const message = useAppMessage();
	const [result, setResult] = useState<IpInfoResponse | null>(null);
	const [loading, setLoading] = useState(false);

	useToolRefPanel('IP 信息参考', ipInfoReference);

	const handleLookup = useCallback(async () => {
		setLoading(true);
		try {
			const response = await fetch('/api/ip-info', {
				headers: { accept: 'application/json' },
				cache: 'no-store',
			});
			if (response.status === 404) {
				setResult(unavailableResult('当前部署环境没有可用的 IP 信息 API。'));
				message.warning('当前部署环境没有可用的 IP 信息 API。');
				return;
			}
			if (!response.ok) throw new Error(`查询失败：HTTP ${response.status}`);
			const data = await response.json() as IpInfoResponse;
			if (!data.ok) throw new Error('查询失败。');
			setResult(data);
			if (!data.available) {
				message.warning(data.message ?? '当前部署环境未提供服务端 IP 请求信息。');
			}
		} catch (error) {
			const fallback = unavailableResult('当前部署环境暂时无法查询 IP 信息。');
			setResult(fallback);
			message.error(error instanceof Error ? error.message : fallback.message ?? 'IP 信息查询失败。');
		} finally {
			setLoading(false);
		}
	}, [message]);

	const controls = (
		<div className="tool-card tool-card--controls">
			<div className="tool-card__section">
				<h2 className="tool-card__title">当前访问 IP</h2>
				<p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>
					查询当前部署环境可见的访问者 IP。Cloudflare、Vercel 和通用服务端环境会返回不同字段。
				</p>
				<Button variant="primary" onClick={handleLookup} disabled={loading}>
					{loading ? '查询中' : '查询当前 IP'}
				</Button>
			</div>
			<div className="tool-card__section">
				<h2 className="tool-card__title">说明</h2>
				<p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>
					此工具只读取当前请求信息，不支持输入任意 IP 查询归属地，也不会保存查询结果。
				</p>
			</div>
		</div>
	);

	const resultPanel = (
		<div className="tool-card tool-card--result">
			<h2 className="tool-card__title">查询结果</h2>
			{result ? <IpInfoResult result={result} /> : <div className="state-box">点击查询后显示当前访问 IP 信息。</div>}
		</div>
	);

	return <GeneratorPanel ariaLabel="IP 信息查询" controls={controls} result={resultPanel} />;
}

function IpInfoResult({ result }: { result: IpInfoResponse }) {
	if (!result.available) {
		return (
			<div className="state-box" style={{ minHeight: 'auto', padding: 'var(--space-4)' }}>
				{result.message ?? '当前部署环境未提供服务端 IP 请求信息。'}
			</div>
		);
	}

	const rows = [
		['数据来源', sourceLabel(result.source)],
		['IP 地址', result.ip],
		['国家/地区', result.info.country],
		['城市', result.info.city],
		['地区', result.info.region],
		['地区代码', result.info.regionCode],
		['大洲', result.info.continent],
		['时区', result.info.timezone],
		['经纬度', formatCoordinates(result.info.latitude, result.info.longitude)],
		['邮政编码', result.info.postalCode],
		['ASN', result.info.asn],
		['组织', result.info.asOrganization],
		['Cloudflare 机房', result.info.colo],
		['HTTP 协议', result.info.httpProtocol],
		['TCP RTT', result.info.clientTcpRtt],
		['QUIC RTT', result.info.clientQuicRtt],
		['TLS 版本', result.info.tlsVersion],
		['TLS 加密套件', result.info.tlsCipher],
	].filter(([, value]) => Boolean(value)) as Array<[string, string]>;

	if (rows.length === 0) {
		return (
			<div className="state-box" style={{ minHeight: 'auto', padding: 'var(--space-4)' }}>
				当前请求信息为空。
			</div>
		);
	}

	return (
		<div style={{ display: 'grid', gap: '6px' }}>
			{rows.map(([label, value]) => <CopyRow key={label} label={label} value={value} density="long" />)}
		</div>
	);
}

function sourceLabel(source: IpInfoSource): string {
	if (source === 'cloudflare') return 'Cloudflare';
	if (source === 'vercel') return 'Vercel';
	if (source === 'generic') return '通用请求头';
	return '不可用';
}

function unavailableResult(message: string): IpInfoResponse {
	return {
		ok: true,
		available: false,
		source: 'unavailable',
		info: {},
		message,
	};
}

function formatCoordinates(latitude?: string, longitude?: string): string | undefined {
	if (!latitude || !longitude) return undefined;
	return `${latitude}, ${longitude}`;
}
