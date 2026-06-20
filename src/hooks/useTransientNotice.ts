import { useCallback, useEffect, useState } from 'react';

export function useTransientNotice(duration = 1400) {
	const [notice, setNotice] = useState('');

	useEffect(() => {
		if (!notice) return;
		const timer = window.setTimeout(() => setNotice(''), duration);
		return () => window.clearTimeout(timer);
	}, [duration, notice]);

	const showNotice = useCallback((message: string) => {
		setNotice(message);
	}, []);

	return [notice, showNotice] as const;
}
