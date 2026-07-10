import { createHashers, FILE_HASH_CHUNK_SIZE, type HashAlgorithm } from './functions';

type WorkerRequest =
	| { type: 'hash-file'; id: string; file: File; algorithms: HashAlgorithm[] }
	| { type: 'cancel'; id: string };

type WorkerResponse =
	| { type: 'progress'; id: string; processedBytes: number; totalBytes: number }
	| { type: 'done'; id: string; hashes: Record<HashAlgorithm, string> }
	| { type: 'cancelled'; id: string }
	| { type: 'error'; id: string; error: string };

const cancelledTasks = new Set<string>();

self.onmessage = (event: MessageEvent<WorkerRequest>) => {
	const request = event.data;
	if (request.type === 'cancel') {
		cancelledTasks.add(request.id);
		return;
	}
	void hashFile(request);
};

async function hashFile(request: Extract<WorkerRequest, { type: 'hash-file' }>) {
	const { id, file, algorithms } = request;
	cancelledTasks.delete(id);

	try {
		const hashers = await createHashers(algorithms);
		let processedBytes = 0;

		for (let offset = 0; offset < file.size; offset += FILE_HASH_CHUNK_SIZE) {
			if (cancelledTasks.has(id)) {
				cancelledTasks.delete(id);
				postMessage({ type: 'cancelled', id } satisfies WorkerResponse);
				return;
			}

			const chunk = new Uint8Array(await file.slice(offset, offset + FILE_HASH_CHUNK_SIZE).arrayBuffer());
			hashers.forEach(({ hasher }) => hasher.update(chunk));
			processedBytes += chunk.byteLength;
			postMessage({ type: 'progress', id, processedBytes, totalBytes: file.size } satisfies WorkerResponse);
		}

		const hashes = Object.fromEntries(hashers.map(({ algorithm, hasher }) => [algorithm, hasher.digest('hex')]));
		postMessage({ type: 'done', id, hashes: hashes as Record<HashAlgorithm, string> } satisfies WorkerResponse);
	} catch (error) {
		postMessage({
			type: 'error',
			id,
			error: error instanceof Error ? error.message : '文件 Hash 计算失败。',
		} satisfies WorkerResponse);
	}
}
