export type ToolCategoryId = 'encoding' | 'crypto' | 'json' | 'developer' | 'text' | 'format' | 'css';

export interface ToolCategory {
	id: ToolCategoryId;
	name: string;
	description: string;
	icon: string;
}

export interface ToolDefinition {
	id: string;
	href: string;
	name: string;
	shortName: string;
	description: string;
	category: ToolCategoryId;
	keywords: string[];
}
