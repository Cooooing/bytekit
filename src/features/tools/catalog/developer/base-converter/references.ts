export const baseConverterReference = [
	{
		title: '输入格式',
		items: [
			{ syntax: '0b1010', desc: '自动模式下识别为二进制。' },
			{ syntax: '0o12', desc: '自动模式下识别为八进制。' },
			{ syntax: '0xFF', desc: '自动模式下识别为十六进制。' },
			{ syntax: '255', desc: '自动模式下按十进制解析。' },
			{ syntax: '-1_024', desc: '支持负数和下划线分隔符。' },
		],
	},
	{
		title: '进制范围',
		items: [
			{ syntax: '2-36', desc: '自定义源进制和目标进制支持 2 到 36。' },
			{ syntax: 'A-Z', desc: '10 以上的数位使用英文字母，不区分大小写。' },
			{ syntax: '多行输入', desc: '每行一个数值，适合批量转换。' },
		],
	},
	{
		title: '示例',
		items: [
			{ syntax: '0b1010', desc: '十进制结果为 10。' },
			{ syntax: '0xFF', desc: '十进制结果为 255。' },
			{ syntax: 'ZZ / 36 进制', desc: '十进制结果为 1295。' },
		],
	},
];
