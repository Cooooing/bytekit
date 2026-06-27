export const xmlReference = [
	{
		title: 'XML 基础',
		items: [
			{ syntax: '<?xml?>', desc: 'XML 声明独占一行，不参与缩进层级' },
			{ syntax: '<tag>', desc: '开始标签' },
			{ syntax: '</tag>', desc: '结束标签' },
			{ syntax: '<tag/>', desc: '自闭合标签' },
			{ syntax: '<tag attr="val">', desc: '带属性的标签' },
			{ syntax: '<![CDATA[]]>', desc: 'CDATA 内容保持原样，适合保留特殊字符文本' },
			{ syntax: '<!-- -->', desc: 'XML 注释独占一行并跟随当前缩进' },
		],
	},
	{
		title: '格式规则',
		items: [
			{ syntax: '缩进', desc: '2 空格缩进嵌套层级' },
			{ syntax: '成对标签', desc: '结束标签和对应开始标签对齐' },
			{ syntax: '文本节点', desc: '文本内容缩进到父标签下一层' },
			{ syntax: '校验', desc: '格式化和压缩前自动校验 XML 结构' },
			{ syntax: '压缩', desc: '移除所有空白和换行' },
		],
	},
	{
		title: '常见错误',
		items: [
			{ syntax: '<a><b></a>', desc: '标签嵌套顺序错误，会触发解析失败提示' },
			{ syntax: '<tag attr=value>', desc: 'XML 属性值必须使用引号包裹' },
			{ syntax: '&', desc: '文本中的 & 需要写成 &amp;，除非位于 CDATA 中' },
		],
	},
];
