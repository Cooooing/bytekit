export const cronReference = [
	{
		title: 'Cron 格式',
		items: [
			{ syntax: '* * * * *', desc: 'Unix：分 时 日 月 周' },
			{ syntax: '* * * * * *', desc: 'Quartz/Spring：秒 分 时 日 月 周' },
			{ syntax: '* * * * * * *', desc: 'Quartz：秒 分 时 日 月 周 年' },
			{ syntax: '*', desc: '所有值' },
			{ syntax: '*/5', desc: '每隔 5 个单位' },
			{ syntax: '1-5', desc: '范围 1 到 5' },
			{ syntax: '1,3,5', desc: '指定值 1、3、5' },
		],
	},
	{
		title: '特殊字符',
		items: [
			{ syntax: '?', desc: '不指定（Quartz/Spring，仅用于日和周字段）' },
			{ syntax: 'L', desc: '最后一天（仅限日字段）' },
			{ syntax: '15W', desc: '离每月 15 日最近的工作日（仅限日字段）' },
			{ syntax: 'MON#2', desc: '每月第二个星期一' },
			{ syntax: 'FRIL', desc: '每月最后一个星期五' },
		],
	},
	{
		title: '示例',
		items: [
			{ syntax: '0 * * * *', desc: '每小时执行' },
			{ syntax: '0 9 * * 1-5', desc: '工作日每天 9:00' },
			{ syntax: '0 0 9 ? * MON-FRI', desc: '工作日每天 9:00:00' },
			{ syntax: '0 0 9 LW * ?', desc: '每月最后一个工作日 9:00:00' },
			{ syntax: '*/15 * * * *', desc: '每 15 分钟' },
			{ syntax: '0 0 1 * *', desc: '每月 1 号 0:00' },
			{ syntax: '30 8 * * 1', desc: '每周一 8:30' },
		],
	},
];
