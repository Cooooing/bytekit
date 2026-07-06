export const protoToJsonReference = [
	{
		title: '输入',
		items: [
			{ syntax: 'message', desc: '只要求包含可解析的 message。' },
			{ syntax: 'syntax / package', desc: '可以保留，也可以省略。工具只按 message 生成 JSON。' },
			{ syntax: '多个 message', desc: '出现多个 message 时可以在下拉框中选择。' },
		],
	},
	{
		title: '字段映射',
		items: [
			{ syntax: 'camelCase', desc: '默认输出 JSON 常用的小驼峰字段名。' },
			{ syntax: 'PascalCase', desc: '字段名首字母大写，例如 CronSpec。' },
			{ syntax: 'snake_case', desc: '字段名使用下划线形式，例如 cron_spec。' },
			{ syntax: '原始字段名', desc: '尽量保留 proto 字段原名。' },
			{ syntax: 'repeated', desc: '输出单元素数组。' },
			{ syntax: 'map', desc: '输出包含一个示例键的对象。' },
			{ syntax: 'oneof', desc: '默认选择 oneof 中的第一个字段。' },
			{ syntax: 'enum', desc: '默认选择第一个非 0 枚举值。' },
		],
	},
	{
		title: '输出',
		items: [
			{ syntax: 'JSON 样例', desc: '只输出格式化 JSON，不输出字段说明或随机配置。' },
			{ syntax: 'int64', desc: '64 位整数以字符串形式输出，避免精度丢失。' },
			{ syntax: 'bytes', desc: '按 Base64 字符串输出。' },
		],
	},
];
