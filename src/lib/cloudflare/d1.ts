export interface ShareRecord {
	id: string;
	tool: string;
	content: string;
	created_at: string;
	expires_at: string | null;
}

export interface CreateShareInput {
	tool: string;
	content: string;
	expiresAt?: string | null;
}

export async function createShare(db: D1Database, input: CreateShareInput): Promise<ShareRecord> {
	const record: ShareRecord = {
		id: crypto.randomUUID(),
		tool: input.tool,
		content: input.content,
		created_at: new Date().toISOString(),
		expires_at: input.expiresAt ?? null,
	};

	await db
		.prepare(
			'INSERT INTO shares (id, tool, content, created_at, expires_at) VALUES (?, ?, ?, ?, ?)',
		)
		.bind(record.id, record.tool, record.content, record.created_at, record.expires_at)
		.run();

	return record;
}

export async function getShare(db: D1Database, id: string): Promise<ShareRecord | null> {
	const record = await db
		.prepare('SELECT id, tool, content, created_at, expires_at FROM shares WHERE id = ?')
		.bind(id)
		.first<ShareRecord>();

	return record ?? null;
}
