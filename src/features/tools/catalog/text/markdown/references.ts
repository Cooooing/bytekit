export const markdownReference = [
	{
		title: '块级元素',
		items: [
			{ syntax: '# 标题', desc: '1-6 级标题，# 数量表示级别' },
			{ syntax: '> 引用', desc: '引用文本，可嵌套' },
			{ syntax: '- 列表', desc: '无序列表，用 - * + 开头' },
			{ syntax: '1. 列表', desc: '有序列表，数字+点号开头' },
			{ syntax: '``` 代码块', desc: '三个反引号围栏，可指定语言' },
			{ syntax: '| 表格 |', desc: '用 | 分隔列，第二行为分隔线' },
			{ syntax: '---', desc: '三个以上短横线生成分割线' },
		],
	},
	{
		title: '行内元素',
		items: [
			{ syntax: '**粗体**', desc: '双星号包裹' },
			{ syntax: '*斜体*', desc: '单星号包裹' },
			{ syntax: '~~删除线~~', desc: '双波浪号包裹' },
			{ syntax: '`代码`', desc: '反引号包裹行内代码' },
			{ syntax: '[文本](URL)', desc: '超链接' },
			{ syntax: '![alt](URL)', desc: '图片引用' },
		],
	},
];
