export const jsonToProtoReference = [
	{
		title: '输入',
		items: [
			{ syntax: 'JSON 对象', desc: '生成一个根 message。' },
			{ syntax: 'JSON 对象数组', desc: '合并所有对象字段，缺失字段会推断为 optional。' },
			{ syntax: 'camelCase', desc: '字段名会转换为 proto 常用的 snake_case。' },
		],
	},
	{
		title: '类型推断',
		items: [
			{ syntax: 'string / boolean', desc: '分别生成 string 和 bool。' },
			{ syntax: 'integer', desc: '32 位范围内生成 int32，超出范围生成 int64。' },
			{ syntax: 'number', desc: '带小数的数字生成 double。' },
			{ syntax: 'array', desc: '生成 repeated 字段，空数组按 repeated string 处理。' },
			{ syntax: 'object', desc: '固定生成嵌套 message，不推断 map。' },
			{ syntax: 'null', desc: '字段标记为 optional；无法从其他样例推断时按 string 处理。' },
		],
	},
	{
		title: '输出',
		items: [
			{ syntax: 'message', desc: '只输出 message 代码，不包含 syntax、package 或 import。' },
			{ syntax: '字段编号', desc: '按字段出现顺序从 1 开始生成。' },
		],
	},
];
