import type { ToolCategory, ToolDefinition } from '../../types';

export const category: ToolCategory = {
	id: 'file',
	name: '文件工具',
	description: '在浏览器本地查看文档和表格文件。',
	icon: 'FolderOpen',
};

export const definition: ToolDefinition = {
	id: 'document-preview',
	href: 'tools/file/document-preview',
	name: '文档预览器',
	shortName: '文档预览',
	description: '本地预览 PDF、DOCX、PPTX 与 EPUB 文档，不上传文件。',
	category: 'file',
	keywords: ['pdf', 'docx', 'pptx', 'epub', '文档', '预览', '本地文件'],
};
