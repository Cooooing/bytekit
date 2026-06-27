export const uuidReference = [
	{
		title: 'UUID 版本',
		items: [
			{ syntax: 'v1', desc: '基于时间戳和 MAC 地址，可追溯生成时间' },
			{ syntax: 'v3', desc: '基于 MD5 哈希，同一命名空间+名称产生相同 UUID' },
			{ syntax: 'v4', desc: '完全随机，最常用，无隐私泄露风险' },
			{ syntax: 'v5', desc: '基于 SHA-1 哈希，比 v3 更安全' },
		],
	},
	{
		title: '格式说明',
		items: [
			{ syntax: '8-4-4-4-12', desc: '标准格式：8位-4位-4位-4位-12位十六进制' },
			{ syntax: '版本位', desc: '第 13 位字符表示版本（如 v4 为 "4"）' },
			{ syntax: '变体位', desc: '第 17 位字符表示变体（RFC 4122 为 "8"-"b"）' },
			{ syntax: '总长度', desc: '36 个字符（含连字符），128 位信息' },
		],
	},
];
