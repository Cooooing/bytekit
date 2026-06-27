export const jsEscapeReference = [
	{
		title: '转义字符',
		items: [
			{ syntax: '\\n', desc: '换行符' },
			{ syntax: '\\t', desc: '制表符' },
			{ syntax: '\\r', desc: '回车符' },
			{ syntax: '\\\\', desc: '反斜杠' },
			{ syntax: '\\"', desc: '双引号' },
			{ syntax: "\\'", desc: '单引号' },
			{ syntax: '\\0', desc: '空字符' },
		],
	},
	{
		title: 'Unicode 转义',
		items: [
			{ syntax: '\\x41', desc: '十六进制转义（A）' },
			{ syntax: '\\u0041', desc: 'Unicode 转义（A）' },
		],
	},
];
