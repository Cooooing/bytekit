export const cssReference = [
	{
		title: 'CSS 压缩规则',
		items: [
			{ syntax: '空白', desc: '移除多余空格、换行、缩进' },
			{ syntax: '注释', desc: '移除 /* ... */ 注释' },
			{ syntax: '分号', desc: '最后一个声明后的分号可省略' },
			{ syntax: '0 值', desc: '0px → 0（除角度和时间单位外）' },
		],
	},
	{
		title: '最佳实践',
		items: [
			{ syntax: '变量', desc: '使用 CSS 自定义属性 --var 管理主题' },
			{ syntax: '简写', desc: 'margin: 10px 20px 代替 margin-top 等' },
			{ syntax: '选择器', desc: '避免过深嵌套（>3层影响性能）' },
		],
	},
];
