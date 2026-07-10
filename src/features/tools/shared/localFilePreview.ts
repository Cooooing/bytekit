export type PreviewFamily = 'document' | 'spreadsheet';
export type PreviewStatus = 'pending' | 'loading' | 'ready' | 'error';

const extensions: Record<PreviewFamily, readonly string[]> = {
	document: ['pdf', 'docx', 'pptx', 'epub'],
	spreadsheet: ['xls', 'xlsx', 'xlsm', 'xlsb', 'ods', 'csv'],
};

export interface LocalPreviewFile {
	id: string;
	file: File;
	extension: string;
	status: PreviewStatus;
	error?: string;
}

export function fileExtension(name: string) {
	const index = name.lastIndexOf('.');
	return index < 1 ? '' : name.slice(index + 1).toLowerCase();
}

export function acceptsFile(file: File, family: PreviewFamily) {
	return extensions[family].includes(fileExtension(file.name));
}

export function acceptedExtensions(family: PreviewFamily) {
	return extensions[family].map((extension) => `.${extension}`).join(',');
}

export function formatFileSize(size: number) {
	if (size < 1024) return `${size} B`;
	if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
	return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function createPreviewFiles(files: FileList | File[], family: PreviewFamily): { accepted: LocalPreviewFile[]; rejected: File[] } {
	const accepted: LocalPreviewFile[] = [];
	const rejected: File[] = [];
	for (const file of Array.from(files)) {
		if (!acceptsFile(file, family)) {
			rejected.push(file);
			continue;
		}
		accepted.push({
			id: `${file.name}:${file.size}:${file.lastModified}:${crypto.randomUUID()}`,
			file,
			extension: fileExtension(file.name),
			status: 'pending',
		});
	}
	return { accepted, rejected };
}

export function needsLargeFileConfirmation(file: File) {
	return file.size > 100 * 1024 * 1024;
}
