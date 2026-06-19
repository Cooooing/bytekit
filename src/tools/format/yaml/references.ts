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
];
