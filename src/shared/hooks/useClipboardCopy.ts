import { useCallback } from 'react';
import { useTransientNotice } from './useTransientNotice';

interface ClipboardCopyOptions {
	successText?: string;
	errorText?: string;
}

export function useClipboardCopy({ successText = '已复制', errorText = '复制失败' }: ClipboardCopyOptions = {}) {
	const [notice, showNotice] = useTransientNotice();

	const copyText = useCallback(async (value: string) => {
		if (!value) return false;
		try {
			await navigator.clipboard.writeText(value);
			showNotice(successText);
			return true;
		} catch {
			showNotice(errorText);
			return false;
		}
	}, [errorText, showNotice, successText]);

	return { notice, copyText, showNotice };
}
