export const htmlFormatReference = [
	{
		title: '格式化规则',
		items: [
			{ syntax: '缩进', desc: '2 空格缩进嵌套层级' },
			{ syntax: '<!DOCTYPE>', desc: '文档类型声明独占一行，不参与缩进层级' },
			{ syntax: '<div>...</div>', desc: '普通开始/结束标签按父子层级对齐' },
			{ syntax: '<br>', desc: 'br、img、input、meta、link 等 void 标签不增加缩进' },
			{ syntax: '<!-- -->', desc: '注释独占一行并跟随当前层级缩进' },
			{ syntax: '<script>', desc: 'script、style、pre、textarea 内部内容保持原始文本' },
		],
	},
	{
		title: '压缩优化',
		items: [
			{ syntax: '移除注释', desc: '删除所有 HTML 注释' },
			{ syntax: '合并空白', desc: '多个空格合并为一个' },
			{ syntax: '移除换行', desc: '删除所有换行符' },
			{ syntax: '> <', desc: '标签之间的空白会被压缩为紧邻标签' },
		],
	},
	{
		title: '注意事项',
		items: [
			{ syntax: 'HTML 容错', desc: 'HTML 格式化不做严格语法校验，浏览器可容错的片段会尽量格式化' },
			{ syntax: '属性顺序', desc: '格式化不会重排属性，避免改变原始语义' },
			{ syntax: '内联文本', desc: '标签间文本会保留为独立行，便于检查层级' },
		],
	},
];
