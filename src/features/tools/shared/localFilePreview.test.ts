import { describe, expect, it } from 'vitest';
import { acceptedExtensions, acceptsFile, fileExtension, formatFileSize, needsLargeFileConfirmation } from './localFilePreview';

describe('local file preview helpers', () => {
	it('recognizes the supported document and spreadsheet extensions', () => {
		expect(acceptsFile(new File(['x'], 'report.PDF'), 'document')).toBe(true);
		expect(acceptsFile(new File(['x'], 'legacy.doc'), 'document')).toBe(false);
		expect(acceptsFile(new File(['x'], 'table.xlsb'), 'spreadsheet')).toBe(true);
		expect(acceptsFile(new File(['x'], 'slides.pptx'), 'spreadsheet')).toBe(false);
	});

	it('formats metadata and identifies large files', () => {
		expect(fileExtension('archive.final.XLSX')).toBe('xlsx');
		expect(formatFileSize(1024 * 1024)).toBe('1.0 MB');
		expect(needsLargeFileConfirmation(new File([new Uint8Array(1)], 'small.pdf'))).toBe(false);
		expect(acceptedExtensions('document')).toContain('.pdf');
	});
});
