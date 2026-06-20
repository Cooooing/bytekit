import { useCallback, useEffect, memo } from 'react';
import { useTheme } from '../../../themes/ThemeContext';
import { useTransientNotice } from '../../../hooks/useTransientNotice';

interface CopyRowProps {
	label: string;
	value: string;
}

const CopyRow = memo(function CopyRow({ label, value }: CopyRowProps) {
	const [notice, showNotice] = useTransientNotice();
	const { Button } = useTheme();
	const isEmpty = value.length === 0;

	useEffect(() => {
		showNotice('');
	}, [showNotice, value]);

	const handleCopy = useCallback(async () => {
		if (isEmpty) return;
		try {
			await navigator.clipboard.writeText(value);
			showNotice('已复制');
		} catch {
			showNotice('复制失败');
		}
	}, [isEmpty, showNotice, value]);

	return (
		<div className="copy-row">
			<span className="copy-row__label">{label}</span>
			<code className="copy-row__value">{value}</code>
			{notice ? <span className="copy-row__notice" role="status" aria-live="polite">{notice}</span> : null}
			<Button variant="ghost" size="sm" disabled={isEmpty} onClick={handleCopy}>
				复制
			</Button>
		</div>
	);
});

export default CopyRow;
