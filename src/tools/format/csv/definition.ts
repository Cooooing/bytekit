import type { ToolDefinition, ToolCategory } from '../../types';

export const category: ToolCategory = {
	id: 'format',
	name: '格式转换',
	description: 'JSON ↔ CSV、JSON ↔ YAML 等格式互转。',
	icon: 'braces',
};

export const definition: ToolDefinition = {
	id: 'csv',
	href: 'tools/format/csv',
	name: 'JSON ↔ CSV',
	shortName: 'CSV',
	description: 'JSON 数组与 CSV 表格互转。',
	category: 'format',
	keywords: ['json', 'csv', 'table', '表格', '转换', 'convert'],
};
