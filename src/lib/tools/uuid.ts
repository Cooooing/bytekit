export function generateUuidV4(): string {
	return crypto.randomUUID();
}

export function generateBatch(count: number): string[] {
	return Array.from({ length: count }, () => crypto.randomUUID());
}
