export const jsonPathReference = [
	{
		title: 'JSONPath 语法',
		items: [
			{ syntax: '$', desc: '根对象' },
			{ syntax: '.property', desc: '子属性' },
			{ syntax: '[0]', desc: '数组索引' },
			{ syntax: '[*]', desc: '通配符（所有元素）' },
			{ syntax: '..', desc: '递归下降' },
		],
	},
	{
		title: '示例',
		items: [
			{ syntax: '$.store.book[0].title', desc: '第一本书的标题' },
			{ syntax: '$.store.book[*].author', desc: '所有书的作者' },
			{ syntax: '$.store.book[0:2]', desc: '前两本书' },
		],
	},
];
