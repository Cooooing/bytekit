export const xmlReference = [
	{
		title: 'XML 基础',
		items: [
			{ syntax: '<tag>', desc: '开始标签' },
			{ syntax: '</tag>', desc: '结束标签' },
			{ syntax: '<tag/>', desc: '自闭合标签' },
			{ syntax: '<tag attr="val">', desc: '带属性的标签' },
			{ syntax: '<?xml version="1.0"?>', desc: 'XML 声明' },
		],
	},
	{
		title: '格式规则',
		items: [
			{ syntax: '缩进', desc: '2 空格缩进嵌套层级' },
			{ syntax: '换行', desc: '每个标签独占一行' },
			{ syntax: '压缩', desc: '移除所有空白和换行' },
		],
	},
];
