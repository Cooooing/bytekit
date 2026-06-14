export interface StoredObject {
	key: string;
	size: number;
	contentType: string;
}

export async function putFile(bucket: R2Bucket, file: File): Promise<StoredObject> {
	const key = `${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}-${file.name}`;
	const contentType = file.type || 'application/octet-stream';

	await bucket.put(key, file.stream(), {
		httpMetadata: {
			contentType,
		},
	});

	return {
		key,
		size: file.size,
		contentType,
	};
}

export async function getFile(bucket: R2Bucket, key: string): Promise<R2ObjectBody | null> {
	return bucket.get(key);
}
