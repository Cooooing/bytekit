export function toCamelCase(input: string): string {
	return input
		.replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : '')
		.replace(/^[A-Z]/, (c) => c.toLowerCase());
}

export function toSnakeCase(input: string): string {
	return input
		.replace(/([A-Z])/g, '_$1')
		.replace(/[-\s]+/g, '_')
		.replace(/^_/, '')
		.toLowerCase();
}

export function toKebabCase(input: string): string {
	return input
		.replace(/([A-Z])/g, '-$1')
		.replace(/[_\s]+/g, '-')
		.replace(/^-/, '')
		.toLowerCase();
}

export function toPascalCase(input: string): string {
	return input
		.replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : '')
		.replace(/^[a-z]/, (c) => c.toUpperCase());
}

export function toUpperCase(input: string): string {
	return input.toUpperCase();
}

export function toLowerCase(input: string): string {
	return input.toLowerCase();
}
