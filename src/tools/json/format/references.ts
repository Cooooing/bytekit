export const jsonReference = [
	{
		title: 'JSON 语法',
		items: [
			{ syntax: '{ }', desc: '对象，键值对用逗号分隔' },
			{ syntax: '[ ]', desc: '数组，值用逗号分隔' },
			{ syntax: '"str"', desc: '字符串必须用双引号' },
			{ syntax: 'null', desc: '空值' },
			{ syntax: 'true/false', desc: '布尔值' },
			{ syntax: '//注释', desc: 'JSON 不支持注释（会被拒绝）' },
		],
	},
	{
		title: '常见错误',
		items: [
			{ syntax: '单引号', desc: "JSON 只允许双引号，'key' 无效" },
			{ syntax: '尾逗号', desc: '{"a":1,} 是无效 JSON' },
			{ syntax: '注释', desc: '标准 JSON 不允许注释' },
			{ syntax: '无引号键', desc: '{key:"val"} 必须写成 {"key":"val"}' },
		],
	},
];
