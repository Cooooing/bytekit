export const timestampReference = [
	{
		title: '时间格式',
		items: [
			{ syntax: 'Unix 秒', desc: '1970-01-01 起的秒数，10 位数字' },
			{ syntax: 'Unix 毫秒', desc: '13 位数字' },
			{ syntax: 'ISO 8601', desc: '2024-01-15T08:30:00.000Z' },
			{ syntax: 'RFC 2822', desc: 'Mon, 15 Jan 2024 08:30:00 GMT' },
		],
	},
	{
		title: '常见时间戳',
		items: [
			{ syntax: '0', desc: '1970-01-01 00:00:00 UTC' },
			{ syntax: '1000000000', desc: '2001-09-09 01:46:40 UTC' },
			{ syntax: '1700000000', desc: '2023-11-14 22:13:20 UTC' },
		],
	},
];
