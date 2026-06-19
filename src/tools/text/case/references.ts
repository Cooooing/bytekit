export const caseReference = [
	{
		title: '命名格式',
		items: [
			{ syntax: 'camelCase', desc: '首字母小写，后续大写：helloWorld' },
			{ syntax: 'PascalCase', desc: '每个单词首字母大写：HelloWorld' },
			{ syntax: 'snake_case', desc: '全小写，下划线分隔：hello_world' },
			{ syntax: 'kebab-case', desc: '全小写，短横线分隔：hello-world' },
			{ syntax: 'CONSTANT_CASE', desc: '全大写，下划线分隔：HELLO_WORLD' },
			{ syntax: 'dot.case', desc: '全小写，点号分隔：hello.world' },
		],
	},
	{
		title: '使用场景',
		items: [
			{ syntax: 'camelCase', desc: 'JavaScript 变量、函数名' },
			{ syntax: 'PascalCase', desc: '类名、React 组件名' },
			{ syntax: 'snake_case', desc: 'Python 变量、数据库字段、文件名' },
			{ syntax: 'kebab-case', desc: 'CSS 类名、URL slug、HTML 属性' },
			{ syntax: 'CONSTANT_CASE', desc: '环境变量、常量定义' },
		],
	},
];
