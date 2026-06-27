export const yamlReference = [
	{
		title: 'YAML 语法',
		items: [
			{ syntax: 'key: value', desc: '键值对，冒号后必须有空格' },
			{ syntax: '- item', desc: '列表项，短横线+空格开头' },
			{ syntax: 'key:', desc: '嵌套：下一级缩进 2 个空格' },
			{ syntax: '| / >', desc: '多行字符串：| 保留换行，> 折叠为一行' },
			{ syntax: '& / *', desc: '锚点 & 定义，* 引用，用于复用' },
			{ syntax: '---', desc: '文档分隔符，同一文件可包含多个文档' },
			{ syntax: '# comment', desc: '注释从 # 开始，到行尾结束' },
			{ syntax: '"..."', desc: '双引号字符串支持转义字符' },
		],
	},
	{
		title: '常见用途',
		items: [
			{ syntax: 'Docker Compose', desc: 'docker-compose.yml 定义多容器应用' },
			{ syntax: 'GitHub Actions', desc: '.github/workflows/*.yml CI/CD 配置' },
			{ syntax: 'Kubernetes', desc: 'Deployment、Service 等资源定义' },
			{ syntax: '配置文件', desc: 'Ansible、Helm、各种框架的配置' },
		],
	},
	{
		title: '常见错误',
		items: [
			{ syntax: 'tab', desc: '不要使用制表符缩进，推荐统一 2 空格' },
			{ syntax: 'key:value', desc: '冒号后缺少空格会被解析为普通字符串' },
			{ syntax: '混合缩进', desc: '同一层级缩进必须保持一致' },
		],
	},
];
