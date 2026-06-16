export const regexReference = [
	{
		title: '基础语法',
		items: [
			{ syntax: '.', desc: '任意字符' },
			{ syntax: '\\d', desc: '数字 [0-9]' },
			{ syntax: '\\w', desc: '单词字符 [a-zA-Z0-9_]' },
			{ syntax: '\\s', desc: '空白字符' },
			{ syntax: '[abc]', desc: '字符集，匹配 a 或 b 或 c' },
			{ syntax: '[^abc]', desc: '否定字符集' },
			{ syntax: '^', desc: '行首' },
			{ syntax: '$', desc: '行尾' },
		],
	},
	{
		title: '量词',
		items: [
			{ syntax: '*', desc: '0 次或多次' },
			{ syntax: '+', desc: '1 次或多次' },
			{ syntax: '?', desc: '0 次或 1 次' },
			{ syntax: '{n}', desc: '恰好 n 次' },
			{ syntax: '{n,}', desc: '至少 n 次' },
			{ syntax: '{n,m}', desc: 'n 到 m 次' },
		],
	},
	{
		title: '分组与引用',
		items: [
			{ syntax: '(abc)', desc: '捕获分组' },
			{ syntax: '(?:abc)', desc: '非捕获分组' },
			{ syntax: '(?<name>)', desc: '命名分组' },
			{ syntax: '\\1', desc: '反向引用第 1 组' },
			{ syntax: 'a|b', desc: '或运算' },
		],
	},
	{
		title: '前瞻与后顾',
		items: [
			{ syntax: '(?=...)', desc: '正向前瞻' },
			{ syntax: '(?!...)', desc: '负向前瞻' },
			{ syntax: '(?<=...)', desc: '正向后顾' },
			{ syntax: '(?<!...)', desc: '负向后顾' },
		],
	},
];
