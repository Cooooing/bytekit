import { useCallback, useState } from 'react';
import GeneratorPanel from '@features/tools/shared/GeneratorPanel';
import CopyRow from '@features/tools/shared/CopyRow';
import { useToolRefPanel } from '@features/tools/shared/RefPanelContext';
import { useAppMessage } from '@shared/ui/AppMessage';
import { useTheme } from '@themes/ThemeContext';
import type { IpInfoResponse, IpInfoSource } from './functions';
import { ipInfoReference } from './references';

interface BrowserEnvironmentInfo {
	browser?: string;
	browserVersion?: string;
	os?: string;
	platform?: string;
	architecture?: string;
	bitness?: string;
	model?: string;
	mobile?: string;
	language?: string;
	languages?: string;
	timezone?: string;
	timezoneOffset?: string;
	localTime?: string;
	userAgent?: string;
	vendor?: string;
	cookieEnabled?: string;
	doNotTrack?: string;
	online?: string;
	webdriver?: string;
	hardwareConcurrency?: string;
	deviceMemory?: string;
	maxTouchPoints?: string;
	pointer?: string;
	hover?: string;
	screenSize?: string;
	availableScreenSize?: string;
	viewportSize?: string;
	devicePixelRatio?: string;
	colorDepth?: string;
	pixelDepth?: string;
	connectionType?: string;
	effectiveType?: string;
	downlink?: string;
	rtt?: string;
	saveData?: string;
}

interface LookupResult {
	ipInfo: IpInfoResponse;
	browserInfo: BrowserEnvironmentInfo;
}

interface NavigatorUADataLike {
	brands?: Array<{ brand: string; version: string }>;
	mobile?: boolean;
	platform?: string;
	getHighEntropyValues?: (hints: string[]) => Promise<{
		architecture?: string;
		bitness?: string;
		model?: string;
		platform?: string;
		platformVersion?: string;
		uaFullVersion?: string;
		fullVersionList?: Array<{ brand: string; version: string }>;
	}>;
}

interface NavigatorConnectionLike {
	type?: string;
	effectiveType?: string;
	downlink?: number;
	rtt?: number;
	saveData?: boolean;
}

type NavigatorWithExtraInfo = Navigator & {
	userAgentData?: NavigatorUADataLike;
	connection?: NavigatorConnectionLike;
	deviceMemory?: number;
};

export default function IpInfoLookup() {
	const { Button } = useTheme();
	const message = useAppMessage();
	const [result, setResult] = useState<LookupResult | null>(null);
	const [loading, setLoading] = useState(false);

	useToolRefPanel('IP 信息参考', ipInfoReference);

	const handleLookup = useCallback(async () => {
		setLoading(true);
		const browserInfo = await collectBrowserInfo();
		try {
			const response = await fetch('/api/ip-info', {
				headers: { accept: 'application/json' },
				cache: 'no-store',
			});
			if (response.status === 404) {
				const fallback = unavailableResult('当前部署环境没有可用的 IP 信息 API。');
				setResult({ ipInfo: fallback, browserInfo });
				message.warning(fallback.message ?? '当前部署环境没有可用的 IP 信息 API。');
				return;
			}
			if (!response.ok) throw new Error(`查询失败：HTTP ${response.status}`);
			const data = await response.json() as IpInfoResponse;
			if (!data.ok) throw new Error('查询失败。');
			setResult({ ipInfo: data, browserInfo });
			if (!data.available) {
				message.warning(data.message ?? '当前部署环境未提供服务端 IP 请求信息。');
			}
		} catch (error) {
			const fallback = unavailableResult('当前部署环境暂时无法查询 IP 信息。');
			setResult({ ipInfo: fallback, browserInfo });
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
					查询当前部署环境可见的访问者 IP，并同时读取浏览器、系统、屏幕和网络环境信息。
				</p>
				<Button variant="primary" onClick={handleLookup} disabled={loading}>
					{loading ? '查询中' : '查询当前环境'}
				</Button>
			</div>
			<div className="tool-card__section">
				<h2 className="tool-card__title">说明</h2>
				<p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>
					IP 信息来自部署平台或服务端请求头；浏览器环境来自当前浏览器。客户端信息可以被修改，只适合展示和调试。
				</p>
			</div>
		</div>
	);

	const resultPanel = (
		<div className="tool-card tool-card--result">
			<h2 className="tool-card__title">查询结果</h2>
			{result ? <IpInfoResult result={result} /> : <div className="state-box">点击查询后显示当前访问环境信息。</div>}
		</div>
	);

	return <GeneratorPanel ariaLabel="IP 信息查询" controls={controls} result={resultPanel} />;
}

function IpInfoResult({ result }: { result: LookupResult }) {
	return (
		<div style={{ display: 'grid', gap: 'var(--space-4)' }}>
			<ResultSection title="网络信息" rows={buildIpRows(result.ipInfo)} emptyText={result.ipInfo.message ?? '当前部署环境未提供服务端 IP 请求信息。'} />
			<ResultSection title="浏览器环境" rows={buildBrowserRows(result.browserInfo)} emptyText="当前浏览器环境信息为空。" />
		</div>
	);
}

function ResultSection({ title, rows, emptyText }: { title: string; rows: Array<[string, string]>; emptyText: string }) {
	return (
		<div className="tool-card__section">
			<div className="tool-card__title-row">
				<span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{title}</span>
			</div>
			{rows.length > 0 ? (
				<div style={{ display: 'grid', gap: '6px' }}>
					{rows.map(([label, value]) => <CopyRow key={label} label={label} value={value} density="long" />)}
				</div>
			) : (
				<div className="state-box" style={{ minHeight: 'auto', padding: 'var(--space-4)' }}>{emptyText}</div>
			)}
		</div>
	);
}

function buildIpRows(result: IpInfoResponse): Array<[string, string]> {
	if (!result.available) return [];
	return filterRows([
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
	]);
}

function buildBrowserRows(info: BrowserEnvironmentInfo): Array<[string, string]> {
	return filterRows([
		['浏览器', formatPair(info.browser, info.browserVersion)],
		['操作系统', info.os],
		['平台', info.platform],
		['架构', info.architecture],
		['位数', info.bitness],
		['设备型号', info.model],
		['移动设备', info.mobile],
		['语言', info.language],
		['语言列表', info.languages],
		['时区', info.timezone],
		['时区偏移', info.timezoneOffset],
		['本地时间', info.localTime],
		['浏览器厂商', info.vendor],
		['Cookie', info.cookieEnabled],
		['Do Not Track', info.doNotTrack],
		['在线状态', info.online],
		['WebDriver', info.webdriver],
		['CPU 线程数', info.hardwareConcurrency],
		['设备内存', info.deviceMemory],
		['触控点数量', info.maxTouchPoints],
		['指针类型', info.pointer],
		['悬停能力', info.hover],
		['屏幕尺寸', info.screenSize],
		['可用屏幕', info.availableScreenSize],
		['视口尺寸', info.viewportSize],
		['设备像素比', info.devicePixelRatio],
		['颜色深度', info.colorDepth],
		['像素深度', info.pixelDepth],
		['网络类型', info.connectionType],
		['网络质量', info.effectiveType],
		['估算下行', info.downlink],
		['估算 RTT', info.rtt],
		['省流量模式', info.saveData],
		['User-Agent', info.userAgent],
	]);
}

async function collectBrowserInfo(): Promise<BrowserEnvironmentInfo> {
	if (typeof window === 'undefined') return {};

	const nav = navigator as NavigatorWithExtraInfo;
	const uaData = nav.userAgentData;
	const highEntropy = await getHighEntropyValues(uaData);
	const browser = getBrowserName(uaData, nav.userAgent);
	const connection = nav.connection;

	return {
		browser,
		browserVersion: getBrowserVersion(browser, uaData, highEntropy, nav.userAgent),
		os: highEntropy?.platform ?? uaData?.platform ?? getOsName(nav.userAgent),
		platform: nav.platform,
		architecture: highEntropy?.architecture,
		bitness: highEntropy?.bitness,
		model: highEntropy?.model,
		mobile: formatBoolean(uaData?.mobile),
		language: nav.language,
		languages: nav.languages?.join(', '),
		timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
		timezoneOffset: `${new Date().getTimezoneOffset()} 分钟`,
		localTime: new Date().toLocaleString(),
		userAgent: nav.userAgent,
		vendor: nav.vendor,
		cookieEnabled: formatBoolean(nav.cookieEnabled),
		doNotTrack: nav.doNotTrack ?? undefined,
		online: formatBoolean(nav.onLine),
		webdriver: formatBoolean(nav.webdriver),
		hardwareConcurrency: formatNumber(nav.hardwareConcurrency),
		deviceMemory: nav.deviceMemory ? `${nav.deviceMemory} GB` : undefined,
		maxTouchPoints: formatNumber(nav.maxTouchPoints),
		pointer: getMediaQueryValue('(pointer: fine)', 'fine') ?? getMediaQueryValue('(pointer: coarse)', 'coarse') ?? getMediaQueryValue('(pointer: none)', 'none'),
		hover: getMediaQueryValue('(hover: hover)', 'hover') ?? getMediaQueryValue('(hover: none)', 'none'),
		screenSize: `${window.screen.width} x ${window.screen.height}`,
		availableScreenSize: `${window.screen.availWidth} x ${window.screen.availHeight}`,
		viewportSize: `${window.innerWidth} x ${window.innerHeight}`,
		devicePixelRatio: String(window.devicePixelRatio),
		colorDepth: `${window.screen.colorDepth} bit`,
		pixelDepth: `${window.screen.pixelDepth} bit`,
		connectionType: connection?.type,
		effectiveType: connection?.effectiveType,
		downlink: connection?.downlink === undefined ? undefined : `${connection.downlink} Mbps`,
		rtt: connection?.rtt === undefined ? undefined : `${connection.rtt} ms`,
		saveData: formatBoolean(connection?.saveData),
	};
}

async function getHighEntropyValues(uaData: NavigatorUADataLike | undefined) {
	if (!uaData?.getHighEntropyValues) return undefined;
	try {
		return await uaData.getHighEntropyValues([
			'architecture',
			'bitness',
			'model',
			'platform',
			'platformVersion',
			'uaFullVersion',
			'fullVersionList',
		]);
	} catch {
		return undefined;
	}
}

function getBrowserName(uaData: NavigatorUADataLike | undefined, userAgent: string): string | undefined {
	const brand = uaData?.brands?.find((item) => !/Not.?A.?Brand|Chromium/i.test(item.brand)) ?? uaData?.brands?.[0];
	if (brand?.brand) return normalizeBrowserBrand(brand.brand);
	if (/Edg\//.test(userAgent)) return 'Microsoft Edge';
	if (/OPR\//.test(userAgent)) return 'Opera';
	if (/Chrome\//.test(userAgent)) return 'Google Chrome';
	if (/Firefox\//.test(userAgent)) return 'Firefox';
	if (/Safari\//.test(userAgent) && /Version\//.test(userAgent)) return 'Safari';
	return undefined;
}

function getBrowserVersion(
	browser: string | undefined,
	uaData: NavigatorUADataLike | undefined,
	highEntropy: Awaited<ReturnType<typeof getHighEntropyValues>>,
	userAgent: string,
): string | undefined {
	const fullVersion = highEntropy?.fullVersionList?.find((item) => normalizeBrowserBrand(item.brand) === browser)?.version;
	if (fullVersion) return fullVersion;
	const brandVersion = uaData?.brands?.find((item) => normalizeBrowserBrand(item.brand) === browser)?.version;
	if (brandVersion) return brandVersion;
	const match = userAgent.match(/(?:Chrome|Firefox|Version|Edg|OPR)\/([\d.]+)/);
	return match?.[1];
}

function getOsName(userAgent: string): string | undefined {
	if (/Windows/i.test(userAgent)) return 'Windows';
	if (/Android/i.test(userAgent)) return 'Android';
	if (/iPhone|iPad|iPod/i.test(userAgent)) return 'iOS';
	if (/Mac OS X|Macintosh/i.test(userAgent)) return 'macOS';
	if (/Linux/i.test(userAgent)) return 'Linux';
	return undefined;
}

function normalizeBrowserBrand(brand: string): string {
	if (/Chrome/i.test(brand)) return 'Google Chrome';
	if (/Edge/i.test(brand)) return 'Microsoft Edge';
	return brand;
}

function getMediaQueryValue(query: string, value: string): string | undefined {
	return window.matchMedia(query).matches ? value : undefined;
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

function filterRows(rows: Array<[string, string | undefined]>): Array<[string, string]> {
	return rows.filter(([, value]) => Boolean(value)) as Array<[string, string]>;
}

function formatPair(name?: string, value?: string): string | undefined {
	if (!name) return value;
	return value ? `${name} ${value}` : name;
}

function formatCoordinates(latitude?: string, longitude?: string): string | undefined {
	if (!latitude || !longitude) return undefined;
	return `${latitude}, ${longitude}`;
}

function formatBoolean(value: boolean | undefined): string | undefined {
	if (value === undefined) return undefined;
	return value ? '是' : '否';
}

function formatNumber(value: number | undefined): string | undefined {
	if (value === undefined) return undefined;
	return String(value);
}
