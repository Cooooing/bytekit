export type IpNetworkMode = 'auto' | 'cidr' | 'mask' | 'batch';

export interface IpNetworkOptions {
	input: string;
	mode: IpNetworkMode;
}

export interface IpNetworkResult {
	mode: IpNetworkMode;
	rows: IpNetworkRow[];
}

export type IpNetworkCalculateResult =
	| { ok: true; result: IpNetworkResult }
	| { ok: false; error: string };

export type IpNetworkRow =
	| IpAddressRow
	| IpCidrRow
	| IpMaskRow
	| IpRangeRow
	| IpInvalidRow;

export interface IpAddressRow {
	ok: true;
	kind: 'ipv4' | 'ipv6';
	source: string;
	normalized: string;
	types: string[];
	decimal?: string;
	hex?: string;
	binary?: string;
}

export interface IpCidrRow {
	ok: true;
	kind: 'cidr';
	source: string;
	ip: string;
	prefix: number;
	network: string;
	broadcast: string;
	firstUsable: string;
	lastUsable: string;
	totalAddresses: string;
	usableHosts: string;
	subnetMask: string;
	wildcardMask: string;
	types: string[];
}

export interface IpMaskRow {
	ok: true;
	kind: 'mask';
	source: string;
	mask: string;
	prefix: number;
	wildcardMask: string;
	binary: string;
}

export interface IpRangeRow {
	ok: true;
	kind: 'range';
	source: string;
	start: string;
	end: string;
	totalAddresses: string;
}

export interface IpInvalidRow {
	ok: false;
	kind: 'invalid';
	source: string;
	error: string;
}

const MAX_ROWS = 200;
const IPV4_BITS = 32n;
const IPV4_SIZE = 1n << IPV4_BITS;

export function calculateIpNetwork(options: IpNetworkOptions): IpNetworkCalculateResult {
	const lines = options.input
		.split(/\r?\n/)
		.map((line) => line.trim())
		.filter(Boolean);

	if (lines.length === 0) return { ok: false, error: '请输入 IP、CIDR、掩码或地址范围。' };
	if (lines.length > MAX_ROWS) return { ok: false, error: `最多支持 ${MAX_ROWS} 行输入。` };

	const mode = options.mode === 'batch' ? 'auto' : options.mode;
	const rows = lines.map((line) => analyzeLine(line, mode));
	if (options.mode !== 'batch' && rows.length === 1 && !rows[0].ok) {
		return { ok: false, error: rows[0].error };
	}
	return { ok: true, result: { mode: options.mode, rows } };
}

function analyzeLine(input: string, mode: Exclude<IpNetworkMode, 'batch'>): IpNetworkRow {
	if (mode === 'cidr') return parseCidr(input);
	if (mode === 'mask') return parseMask(input);
	return parseAuto(input);
}

function parseAuto(input: string): IpNetworkRow {
	if (input.includes('/')) return parseCidr(input);
	if (input.includes('-')) return parseRange(input);

	const mask = parseMask(input);
	if (mask.ok) return mask;

	const ipv4 = parseIPv4(input);
	if (ipv4.ok) return toIPv4Row(input, ipv4.value);

	const ipv6 = parseIPv6(input);
	if (ipv6.ok) return {
		ok: true,
		kind: 'ipv6',
		source: input,
		normalized: formatIPv6(ipv6.parts),
		types: classifyIPv6(ipv6.parts),
	};

	return { ok: false, kind: 'invalid', source: input, error: '无法识别为合法 IP、CIDR、掩码或地址范围。' };
}

function parseCidr(input: string): IpNetworkRow {
	const [addressPart, prefixPart, extra] = input.split('/');
	if (!addressPart || !prefixPart || extra !== undefined) return invalid(input, 'CIDR 格式应为 IP/前缀长度。');

	const prefix = Number(prefixPart);
	if (!Number.isInteger(prefix)) return invalid(input, 'CIDR 前缀长度必须是整数。');

	const ipv4 = parseIPv4(addressPart.trim());
	if (ipv4.ok) {
		if (prefix < 0 || prefix > 32) return invalid(input, 'IPv4 CIDR 前缀长度必须在 0 到 32 之间。');
		return toCidrRow(input, ipv4.value, prefix);
	}

	const ipv6 = parseIPv6(addressPart.trim());
	if (ipv6.ok) {
		if (prefix < 0 || prefix > 128) return invalid(input, 'IPv6 CIDR 前缀长度必须在 0 到 128 之间。');
		return {
			ok: true,
			kind: 'ipv6',
			source: input,
			normalized: `${formatIPv6(ipv6.parts)}/${prefix}`,
			types: classifyIPv6(ipv6.parts),
		};
	}

	return invalid(input, 'CIDR 地址部分不是合法 IP。');
}

function parseMask(input: string): IpMaskRow | IpInvalidRow {
	const ipv4 = parseIPv4(input);
	if (!ipv4.ok) return invalid(input, '掩码不是合法 IPv4 地址。');

	const bits = ipv4.value.toString(2).padStart(32, '0');
	const firstZero = bits.indexOf('0');
	const prefix = firstZero === -1 ? 32 : firstZero;
	if (bits.slice(prefix).includes('1')) return invalid(input, '子网掩码必须由连续的 1 和连续的 0 组成。');

	const wildcard = Number((IPV4_SIZE - 1n) ^ ipv4.value);
	return {
		ok: true,
		kind: 'mask',
		source: input,
		mask: formatIPv4(ipv4.value),
		prefix,
		wildcardMask: formatIPv4(BigInt(wildcard)),
		binary: bits.match(/.{1,8}/g)?.join('.') ?? bits,
	};
}

function parseRange(input: string): IpNetworkRow {
	const [startRaw, endRaw, extra] = input.split('-').map((part) => part.trim());
	if (!startRaw || !endRaw || extra !== undefined) return invalid(input, '地址范围格式应为 起始IP-结束IP。');

	const start = parseIPv4(startRaw);
	const end = parseIPv4(endRaw);
	if (!start.ok || !end.ok) return invalid(input, '地址范围仅支持 IPv4。');
	if (start.value > end.value) return invalid(input, '起始 IP 不能大于结束 IP。');

	return {
		ok: true,
		kind: 'range',
		source: input,
		start: formatIPv4(start.value),
		end: formatIPv4(end.value),
		totalAddresses: (end.value - start.value + 1n).toString(),
	};
}

function toIPv4Row(source: string, value: bigint): IpAddressRow {
	return {
		ok: true,
		kind: 'ipv4',
		source,
		normalized: formatIPv4(value),
		types: classifyIPv4(value),
		decimal: value.toString(),
		hex: `0x${value.toString(16).toUpperCase().padStart(8, '0')}`,
		binary: `0b${value.toString(2).padStart(32, '0')}`,
	};
}

function toCidrRow(source: string, ip: bigint, prefix: number): IpCidrRow {
	const hostBits = 32 - prefix;
	const mask = prefix === 0 ? 0n : ((IPV4_SIZE - 1n) << BigInt(hostBits)) & (IPV4_SIZE - 1n);
	const wildcard = (IPV4_SIZE - 1n) ^ mask;
	const network = ip & mask;
	const broadcast = network | wildcard;
	const total = 1n << BigInt(hostBits);
	const usable = getUsableRange(network, broadcast, prefix);

	return {
		ok: true,
		kind: 'cidr',
		source,
		ip: formatIPv4(ip),
		prefix,
		network: formatIPv4(network),
		broadcast: formatIPv4(broadcast),
		firstUsable: formatIPv4(usable.first),
		lastUsable: formatIPv4(usable.last),
		totalAddresses: total.toString(),
		usableHosts: usable.count.toString(),
		subnetMask: formatIPv4(mask),
		wildcardMask: formatIPv4(wildcard),
		types: classifyIPv4(network),
	};
}

function getUsableRange(network: bigint, broadcast: bigint, prefix: number): { first: bigint; last: bigint; count: bigint } {
	if (prefix === 32) return { first: network, last: network, count: 1n };
	if (prefix === 31) return { first: network, last: broadcast, count: 2n };
	return { first: network + 1n, last: broadcast - 1n, count: (broadcast - network + 1n) - 2n };
}

function parseIPv4(input: string): { ok: true; value: bigint } | { ok: false } {
	const parts = input.trim().split('.');
	if (parts.length !== 4) return { ok: false };

	let value = 0n;
	for (const part of parts) {
		if (!/^\d{1,3}$/.test(part)) return { ok: false };
		const octet = Number(part);
		if (octet < 0 || octet > 255) return { ok: false };
		value = (value << 8n) + BigInt(octet);
	}
	return { ok: true, value };
}

function parseIPv6(input: string): { ok: true; parts: number[] } | { ok: false } {
	const trimmed = input.trim().toLowerCase();
	if (!trimmed || trimmed.includes(':::')) return { ok: false };

	const ipv4TailMatch = trimmed.match(/(.+:)(\d{1,3}(?:\.\d{1,3}){3})$/);
	let source = trimmed;
	let ipv4Parts: number[] = [];
	if (ipv4TailMatch) {
		const ipv4 = parseIPv4(ipv4TailMatch[2]);
		if (!ipv4.ok) return { ok: false };
		source = ipv4TailMatch[1] + [
			Number((ipv4.value >> 16n) & 0xffffn).toString(16),
			Number(ipv4.value & 0xffffn).toString(16),
		].join(':');
		ipv4Parts = [1, 1];
	}

	const hasCompress = source.includes('::');
	if (source.indexOf('::') !== source.lastIndexOf('::')) return { ok: false };

	const rawParts = hasCompress
		? source.split('::').flatMap((part, index) => {
			if (!part) return [];
			const values = part.split(':');
			return index === 0 ? values : values;
		})
		: source.split(':');

	if (rawParts.some((part) => !/^[\da-f]{1,4}$/.test(part))) return { ok: false };

	const missing = 8 - rawParts.length;
	if (hasCompress) {
		if (missing < 1) return { ok: false };
		const [left, right] = source.split('::');
		const leftParts = left ? left.split(':') : [];
		const rightParts = right ? right.split(':') : [];
		const expanded = [...leftParts, ...Array.from({ length: 8 - leftParts.length - rightParts.length }, () => '0'), ...rightParts];
		if (expanded.length !== 8) return { ok: false };
		return { ok: true, parts: expanded.map((part) => parseInt(part, 16)) };
	}

	if (rawParts.length !== 8 || ipv4Parts.length > 2) return { ok: false };
	return { ok: true, parts: rawParts.map((part) => parseInt(part, 16)) };
}

function formatIPv4(value: bigint): string {
	return [
		(value >> 24n) & 255n,
		(value >> 16n) & 255n,
		(value >> 8n) & 255n,
		value & 255n,
	].map(String).join('.');
}

function formatIPv6(parts: number[]): string {
	const normalized = parts.map((part) => part.toString(16));
	let bestStart = -1;
	let bestLength = 0;
	for (let i = 0; i < parts.length; i += 1) {
		if (parts[i] !== 0) continue;
		let end = i;
		while (end < parts.length && parts[end] === 0) end += 1;
		const length = end - i;
		if (length > bestLength && length > 1) {
			bestStart = i;
			bestLength = length;
		}
		i = end;
	}
	if (bestStart < 0) return normalized.join(':');
	const left = normalized.slice(0, bestStart).join(':');
	const right = normalized.slice(bestStart + bestLength).join(':');
	if (!left && !right) return '::';
	if (!left) return `::${right}`;
	if (!right) return `${left}::`;
	return `${left}::${right}`;
}

function classifyIPv4(value: bigint): string[] {
	const ranges: Array<[string, string]> = [
		['10.0.0.0/8', '私有地址'],
		['172.16.0.0/12', '私有地址'],
		['192.168.0.0/16', '私有地址'],
		['127.0.0.0/8', '回环地址'],
		['169.254.0.0/16', '链路本地地址'],
		['224.0.0.0/4', '组播地址'],
		['192.0.2.0/24', '文档示例地址'],
		['198.51.100.0/24', '文档示例地址'],
		['203.0.113.0/24', '文档示例地址'],
		['100.64.0.0/10', '运营商共享地址'],
		['198.18.0.0/15', '性能测试地址'],
		['0.0.0.0/8', '当前网络地址'],
		['240.0.0.0/4', '保留地址'],
	];
	const labels = ranges
		.filter(([cidr]) => containsIPv4(cidr, value))
		.map(([, label]) => label);
	if (value === 0xffffffffn) labels.push('广播地址');
	if (labels.length === 0) labels.push('公网地址');
	return Array.from(new Set(labels));
}

function classifyIPv6(parts: number[]): string[] {
	const value = partsToBigInt(parts);
	const labels: string[] = [];
	if (value === 1n) labels.push('回环地址');
	if ((value >> 120n) === 0xffn) labels.push('组播地址');
	if ((value >> 121n) === 0x7en) labels.push('唯一本地地址');
	if ((value >> 118n) === 0x3fan) labels.push('链路本地地址');
	if ((value >> 96n) === 0x20010db8n) labels.push('文档示例地址');
	if (value === 0n) labels.push('未指定地址');
	if (labels.length === 0) labels.push('全局单播地址');
	return labels;
}

function containsIPv4(cidr: string, value: bigint): boolean {
	const [address, prefixRaw] = cidr.split('/');
	const parsed = parseIPv4(address);
	if (!parsed.ok) return false;
	const prefix = Number(prefixRaw);
	const hostBits = 32 - prefix;
	const mask = prefix === 0 ? 0n : ((IPV4_SIZE - 1n) << BigInt(hostBits)) & (IPV4_SIZE - 1n);
	return (value & mask) === (parsed.value & mask);
}

function partsToBigInt(parts: number[]): bigint {
	return parts.reduce((value, part) => (value << 16n) + BigInt(part), 0n);
}

function invalid(source: string, error: string): IpInvalidRow {
	return { ok: false, kind: 'invalid', source, error };
}
