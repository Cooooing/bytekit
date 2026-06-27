import { useCallback, useEffect, memo } from 'react';
import { useTheme } from '@themes/ThemeContext';
import { useClipboardCopy } from '@shared/hooks/useClipboardCopy';

interface CopyRowProps {
	label: string;
	value: string;
	density?: 'default' | 'compact' | 'long';
}

const CopyRow = memo(function CopyRow({ label, value, density = 'default' }: CopyRowProps) {
	const { notice, copyText, showNotice } = useClipboardCopy();
	const { Button } = useTheme();
	const isEmpty = value.length === 0;

	useEffect(() => {
		showNotice('');
	}, [showNotice, value]);

	const handleCopy = useCallback(async () => {
		if (!isEmpty) await copyText(value);
	}, [copyText, isEmpty, value]);

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
