import { useCallback, useState } from 'react';
import GeneratorPanel from '@features/tools/shared/GeneratorPanel';
import CopyRow from '@features/tools/shared/CopyRow';
import { useToolRefPanel } from '@features/tools/shared/RefPanelContext';
import { useAppMessage } from '@shared/ui/AppMessage';
import { useTheme } from '@themes/ThemeContext';
import type { IpInfoResponse } from './functions';
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
			if (!response.ok) throw new Error(`查询失败：HTTP ${response.status}`);
			const data = await response.json() as IpInfoResponse;
			if (!data.ok) throw new Error('查询失败。');
			setResult(data);
			if (!data.available) {
				message.warning(data.message ?? '当前环境未提供 Cloudflare 请求信息。');
			}
		} catch (error) {
			message.error(error instanceof Error ? error.message : 'IP 信息查询失败。');
		} finally {
			setLoading(false);
		}
	}, [message]);

	const controls = (
		<div className="tool-card tool-card--controls">
			<div className="tool-card__section">
				<h2 className="tool-card__title">当前访问 IP</h2>
				<p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>
					查询当前请求在 Cloudflare Worker 中可见的 IP、地理位置、ASN、机房和连接信息。
				</p>
				<Button variant="primary" onClick={handleLookup} disabled={loading}>
					{loading ? '查询中' : '查询当前 IP'}
				</Button>
			</div>
			<div className="tool-card__section">
				<h2 className="tool-card__title">说明</h2>
				<p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>
					此工具只依赖 Cloudflare 请求信息，不支持输入任意 IP 查询归属地，也不会保存查询结果。
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
				{result.message ?? '当前环境未提供 Cloudflare 请求信息。'}
			</div>
		);
	}

	const rows = [
		['IP 地址', result.ip],
		['国家/地区', result.cf.country],
		['城市', result.cf.city],
		['地区', result.cf.region],
		['地区代码', result.cf.regionCode],
		['大洲', result.cf.continent],
		['时区', result.cf.timezone],
		['经纬度', formatCoordinates(result.cf.latitude, result.cf.longitude)],
		['邮政编码', result.cf.postalCode],
		['ASN', result.cf.asn],
		['组织', result.cf.asOrganization],
		['Cloudflare 机房', result.cf.colo],
		['HTTP 协议', result.cf.httpProtocol],
		['TCP RTT', result.cf.clientTcpRtt],
		['QUIC RTT', result.cf.clientQuicRtt],
		['TLS 版本', result.cf.tlsVersion],
		['TLS 加密套件', result.cf.tlsCipher],
	].filter(([, value]) => Boolean(value)) as Array<[string, string]>;

	if (rows.length === 0) {
		return (
			<div className="state-box" style={{ minHeight: 'auto', padding: 'var(--space-4)' }}>
				Cloudflare 请求信息为空。
			</div>
		);
	}

	return (
		<div style={{ display: 'grid', gap: '6px' }}>
			{rows.map(([label, value]) => <CopyRow key={label} label={label} value={value} density="long" />)}
		</div>
	);
}

function formatCoordinates(latitude?: string, longitude?: string): string | undefined {
	if (!latitude || !longitude) return undefined;
	return `${latitude}, ${longitude}`;
}
