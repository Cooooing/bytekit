import type { ToolDefinition } from '../../types';

export const definition: ToolDefinition = {
	id: 'spreadsheet-preview',
	href: 'tools/file/spreadsheet-preview',
	name: '表格预览器',
	shortName: '表格预览',
	description: '本地查看 XLS、XLSX、ODS 和 CSV 表格数据，不执行宏。',
	category: 'file',
	keywords: ['xls', 'xlsx', 'xlsm', 'xlsb', 'ods', 'csv', 'excel', '表格', '预览'],
};
