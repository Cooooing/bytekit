import type { ButtonHTMLAttributes, ReactNode } from 'react';

// ─── UI Component Types ───

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'sm' | 'md';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: ButtonVariant;
	size?: ButtonSize;
	children: ReactNode;
}

export type BadgeTone = 'neutral' | 'success' | 'danger' | 'warning' | 'info';

export interface BadgeProps {
	tone?: BadgeTone;
	children: ReactNode;
	className?: string;
}

export interface CopyRowProps {
	label: string;
	value: string;
}

export interface ReferenceItem {
	syntax: string;
	desc: string;
}

export interface ReferenceSection {
	title: string;
	items: ReferenceItem[];
}

export interface ReferencePanelProps {
	title: string;
	sections: ReferenceSection[];
}

// ─── Editor Types ───

export type CodeEditorLanguage = 'text' | 'json' | 'javascript' | 'html' | 'css';
export type CodeEditorStatus = 'neutral' | 'success' | 'error';
export type CodeEditorMessageTone = 'neutral' | 'error';

export interface CodeEditorProps {
	title: string;
	value: string;
	onChange?: (value: string) => void;
	language?: CodeEditorLanguage;
	status?: CodeEditorStatus;
	statusText?: string;
	message?: string;
	messageTone?: CodeEditorMessageTone;
	error?: string;
	minHeight?: 'default' | 'compact' | string;
	className?: string;
}

// ─── Layout Types ───

export interface IoWorkbenchProps {
	input: ReactNode;
	actions: ReactNode;
	output: ReactNode;
	ariaLabel: string;
}

export interface GeneratorPanelProps {
	controls: ReactNode;
	result: ReactNode;
	actions?: ReactNode;
	ariaLabel: string;
}

// ─── Shell Types ───

export interface ToolSidebarProps {
	activeToolId: string;
	onSelectTool: (toolId: string) => void;
}

export interface ToolSearchProps {
	variant?: 'header' | 'sidebar';
}

// ─── Theme Registry ───

export interface ThemeComponents {
	Button: React.ComponentType<ButtonProps>;
	Badge: React.ComponentType<BadgeProps>;
	CopyRow: React.ComponentType<CopyRowProps>;
	ReferencePanel: React.ComponentType<ReferencePanelProps>;
	CodeEditor: React.ComponentType<CodeEditorProps>;
	IoWorkbench: React.ComponentType<IoWorkbenchProps>;
	GeneratorPanel: React.ComponentType<GeneratorPanelProps>;
	ToolSidebar: React.ComponentType<ToolSidebarProps>;
	ToolSearch: React.ComponentType<ToolSearchProps>;
	ThemeSelector: React.ComponentType;
}

export interface ThemeDefinition {
	id: string;
	name: string;
	description: string;
	components: () => Promise<{ default: ThemeComponents }>;
}
