export const base64Reference = [
	{
		title: 'Base64 说明',
		items: [
			{ syntax: '编码', desc: '将二进制数据转为 64 个可打印 ASCII 字符' },
			{ syntax: '字符集', desc: 'A-Z a-z 0-9 + / (填充用 =)' },
			{ syntax: '膨胀率', desc: '编码后体积增大约 33%' },
			{ syntax: '用途', desc: '邮件附件、Data URL、HTTP Basic Auth' },
		],
	},
	{
		title: '变体',
		items: [
			{ syntax: '标准', desc: '使用 + / 和 = 填充' },
			{ syntax: 'URL-safe', desc: '用 - _ 代替 + /，无填充' },
			{ syntax: 'MIME', desc: '每 76 字符换行' },
		],
	},
];
