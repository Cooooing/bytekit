import type { ToolDefinition } from '../../types';

export const definition: ToolDefinition = {
	id: 'cron',
	href: 'tools/developer/cron',
	name: 'Cron 表达式解析',
	shortName: 'Cron',
	description: '解析 Cron 表达式，显示自然语言描述和下次执行时间。',
	category: 'developer',
	keywords: ['cron', 'schedule', '定时', '任务', '计划', 'crontab', 'timer', 'expression'],
};
