import { useCallback, useEffect, memo } from 'react';
import { useTheme } from '../../../themes/ThemeContext';
import { useTransientNotice } from '../../../hooks/useTransientNotice';

interface CopyRowProps {
	label: string;
	value: string;
	density?: 'default' | 'compact' | 'long';
}

const CopyRow = memo(function CopyRow({ label, value, density = 'default' }: CopyRowProps) {
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
		<div className={`copy-row copy-row--${density}`}>
			<span className="copy-row__label">{label}</span>
			<code className="copy-row__value" title={value}>{value}</code>
			<span className="copy-row__action">
				{notice ? <span className="copy-feedback copy-row__notice" role="status" aria-live="polite">{notice}</span> : null}
				<Button variant="ghost" size="sm" disabled={isEmpty} onClick={handleCopy}>
					复制
				</Button>
			</span>
		</div>
	);
});

export default CopyRow;
