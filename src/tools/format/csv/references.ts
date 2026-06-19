export const csvReference = [
	{
		title: 'CSV 语法',
		items: [
			{ syntax: ',', desc: '默认字段分隔符（可改为 ; 或 \\t）' },
			{ syntax: '"..."', desc: '字段包含逗号/换行时用双引号包裹' },
			{ syntax: '""', desc: '双引号字段内的双引号用两个双引号转义' },
			{ syntax: '\\n', desc: '字段内换行需用双引号包裹整个字段' },
		],
	},
	{
		title: '注意事项',
		items: [
			{ syntax: 'UTF-8', desc: '推荐编码，兼容中英文和特殊字符' },
			{ syntax: '表头行', desc: '第一行通常为列名，便于数据处理' },
			{ syntax: '类型推断', desc: 'CSV 无类型信息，数字/日期均为文本' },
			{ syntax: '大文件', desc: '超过 100MB 建议分块处理或用流式解析' },
		],
	},
];
