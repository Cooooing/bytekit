export type MockScalarKind = 'string' | 'integer' | 'unsignedInteger' | 'float' | 'boolean' | 'bytes' | 'int64' | 'uint64';

interface MockValueOptions {
	fieldName: string;
	kind: MockScalarKind;
	random?: boolean;
}

export function createMockValue({ fieldName, kind, random = false }: MockValueOptions): unknown {
	switch (kind) {
		case 'string':
			return mockString(fieldName, random);
		case 'integer':
			return mockInteger(fieldName, random, false);
		case 'unsignedInteger':
			return mockInteger(fieldName, random, true);
		case 'float':
			return random ? Number((Math.random() * 1000).toFixed(2)) : 12.34;
		case 'boolean':
			return random ? Math.random() >= 0.5 : true;
		case 'bytes':
			return random ? base64Encode(`bytekit-${randomInt(1000, 9999)}`) : 'Ynl0ZWtpdA==';
		case 'int64':
			return random ? String(randomInt(1000000000000, 9999999999999)) : '1234567890123';
		case 'uint64':
			return random ? String(randomInt(1000000000000, 9999999999999)) : '1234567890123';
	}
}

function mockString(fieldName: string, random: boolean): string {
	const name = normalizeFieldName(fieldName);
	const suffix = random ? String(randomInt(1000, 9999)) : '001';

	if (matches(name, ['email', 'mail'])) return `user${suffix}@example.com`;
	if (matches(name, ['phone', 'mobile', 'telephone', 'tel'])) return random ? `138${String(randomInt(10000000, 99999999))}` : '13800138000';
	if (matches(name, ['url', 'uri', 'link', 'website'])) return `https://example.com/${suffix}`;
	if (matches(name, ['first_name'])) return random ? `名字${suffix}` : '名字001';
	if (matches(name, ['last_name'])) return random ? `姓氏${suffix}` : '姓氏001';
	if (matches(name, ['nickname', 'username', 'user_name', 'name'])) return random ? `测试用户${suffix}` : '测试用户001';
	if (matches(name, ['title', 'subject'])) return random ? `测试标题${suffix}` : '测试标题001';
	if (matches(name, ['city'])) return randomChoice(['北京', '上海', '广州', '深圳', '杭州'], random);
	if (matches(name, ['province', 'state'])) return randomChoice(['北京', '上海', '广东', '浙江', '江苏'], random);
	if (matches(name, ['country'])) return random ? '中国' : '中国';
	if (matches(name, ['address', 'street'])) return random ? `测试路 ${randomInt(1, 999)} 号` : '测试路 100 号';
	if (matches(name, ['zip', 'zipcode', 'postal_code'])) return random ? String(randomInt(100000, 999999)) : '100000';
	if (matches(name, ['uuid'])) return random ? `00000000-0000-4000-8000-${randomInt(100000000000, 999999999999)}` : '00000000-0000-4000-8000-000000000001';
	if (matches(name, ['id']) || name.endsWith('_id') || name.endsWith('id')) return `id_${suffix}`;
	if (matches(name, ['created_at', 'updated_at', 'deleted_at', 'timestamp', 'time', 'date'])) {
		return random ? `2026-01-${String(randomInt(1, 28)).padStart(2, '0')}T${String(randomInt(0, 23)).padStart(2, '0')}:00:00Z` : '2026-01-01T00:00:00Z';
	}
	if (/(^|_)ip($|_)|ip_address/.test(name)) return random ? `192.168.${randomInt(0, 255)}.${randomInt(1, 254)}` : '192.168.1.1';
	if (matches(name, ['status', 'state'])) return randomChoice(['active', 'pending', 'disabled'], random);
	if (matches(name, ['type', 'category'])) return randomChoice(['default', 'standard', 'custom'], random);
	if (matches(name, ['description', 'desc', 'remark', 'comment', 'content'])) return random ? `测试内容 ${suffix}` : '测试内容';

	return random ? `value_${suffix}` : '示例文本';
}

function mockInteger(fieldName: string, random: boolean, unsigned: boolean): number {
	const name = normalizeFieldName(fieldName);
	if (matches(name, ['age'])) return random ? randomInt(18, 80) : 28;
	if (matches(name, ['id']) || name.endsWith('_id') || name.endsWith('id')) return random ? randomInt(1000, 9999) : 1001;
	if (matches(name, ['year'])) return random ? randomInt(2020, 2030) : 2026;
	if (matches(name, ['month'])) return random ? randomInt(1, 12) : 1;
	if (matches(name, ['day'])) return random ? randomInt(1, 28) : 1;
	if (matches(name, ['hour'])) return random ? randomInt(0, 23) : 12;
	if (matches(name, ['minute', 'second'])) return random ? randomInt(0, 59) : 30;
	if (matches(name, ['count', 'total', 'quantity', 'qty', 'size', 'num'])) return random ? randomInt(1, 100) : 10;
	if (matches(name, ['page', 'page_no', 'page_index'])) return random ? randomInt(1, 10) : 1;
	if (matches(name, ['limit', 'page_size'])) return random ? randomInt(10, 100) : 20;
	if (matches(name, ['score', 'rate', 'percent'])) return random ? randomInt(60, 100) : 90;
	if (matches(name, ['price', 'amount', 'balance', 'money'])) return random ? randomInt(100, 9999) : 1000;
	if (unsigned) return random ? randomInt(0, 1000) : 123;
	return random ? randomInt(-1000, 1000) : 123;
}

function normalizeFieldName(fieldName: string): string {
	return fieldName
		.replace(/([a-z0-9])([A-Z])/g, '$1_$2')
		.toLowerCase();
}

function matches(name: string, keys: string[]): boolean {
	return keys.some((key) => name === key || name.endsWith(`_${key}`) || name.includes(key));
}

function randomChoice(values: string[], random: boolean): string {
	if (!random) return values[0];
	return values[randomInt(0, values.length - 1)];
}

function randomInt(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function base64Encode(value: string): string {
	if (typeof globalThis.btoa === 'function') return globalThis.btoa(value);
	return 'Ynl0ZWtpdA==';
}
