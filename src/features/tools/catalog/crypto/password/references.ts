export const passwordReference = [
	{
		title: '密码强度',
		items: [
			{ syntax: '熵值', desc: 'log₂(字符集^长度)，≥60 位为强密码' },
			{ syntax: '最小长度', desc: '≥12 字符（随机），≥16 字符（口令型）' },
			{ syntax: '字符集', desc: '大小写+数字+符号，≥72 字符集' },
			{ syntax: 'PIN 码', desc: '纯数字 4-6 位，仅用于低风险场景' },
		],
	},
	{
		title: '安全建议',
		items: [
			{ syntax: '避免常用', desc: '不使用 dictionary word、生日、姓名' },
			{ syntax: '唯一性', desc: '每个账户使用不同密码' },
			{ syntax: '密码管理器', desc: '用 1Password/Bitwarden 管理复杂密码' },
			{ syntax: '定期更换', desc: '发现泄露时立即更换，否则无需频繁更换' },
		],
	},
];
