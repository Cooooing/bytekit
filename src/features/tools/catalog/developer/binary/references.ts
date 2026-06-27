export const binaryReference = [
	{
		title: '输入格式',
		items: [
			{ syntax: '1010', desc: '无前缀时按二进制解析。' },
			{ syntax: '0b1010', desc: '二进制前缀。' },
			{ syntax: '0x0a', desc: '十六进制前缀。' },
			{ syntax: '0o12', desc: '八进制前缀。' },
			{ syntax: '10', desc: '仅包含 0 和 1 以外数字时按十进制解析。' },
		],
	},
	{
		title: '位宽规则',
		items: [
			{ syntax: '自动', desc: '使用输入中的最大位宽。' },
			{ syntax: '8 / 16 / 32 / 64', desc: '常见固定宽度。' },
			{ syntax: '自定义', desc: '用于补运算和循环移位。' },
			{ syntax: 'NOT / NAND / NOR / XNOR', desc: '按位宽取反。' },
		],
	},
	{
		title: '示例',
		items: [
			{ syntax: '1010 AND 1100', desc: '结果为 1000。' },
			{ syntax: '1010 OR 0101', desc: '结果为 1111。' },
			{ syntax: 'NOT 1010 / 8 位', desc: '结果为 11110101。' },
			{ syntax: '1001 ROL 1 / 4 位', desc: '结果为 0011。' },
		],
	},
];
