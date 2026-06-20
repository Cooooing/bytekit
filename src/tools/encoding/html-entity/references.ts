export const htmlEntityReference = [
	{
		title: '常用实体',
		items: [
			{ syntax: '&amp;', desc: '& 符号' },
			{ syntax: '&lt;', desc: '< 小于号' },
			{ syntax: '&gt;', desc: '> 大于号' },
			{ syntax: '&quot;', desc: '" 双引号' },
			{ syntax: '&#39;', desc: "' 单引号" },
		],
	},
	{
		title: '使用场景',
		items: [
			{ syntax: 'XSS 防护', desc: '用户输入显示在 HTML 中时必须转义' },
			{ syntax: '模板渲染', desc: '服务端模板输出 HTML 内容' },
			{ syntax: 'HTML 实体解码', desc: '解析 HTML 实体还原原始文本' },
		],
	},
];
