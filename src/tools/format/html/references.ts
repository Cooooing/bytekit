export const htmlFormatReference = [
	{
		title: '格式化规则',
		items: [
			{ syntax: '缩进', desc: '2 空格缩进嵌套层级' },
			{ syntax: '自闭合', desc: 'br, img, input 等不缩进下一行' },
			{ syntax: '注释', desc: '保留 HTML 注释' },
		],
	},
	{
		title: '压缩优化',
		items: [
			{ syntax: '移除注释', desc: '删除所有 HTML 注释' },
			{ syntax: '合并空白', desc: '多个空格合并为一个' },
			{ syntax: '移除换行', desc: '删除所有换行符' },
		],
	},
];
