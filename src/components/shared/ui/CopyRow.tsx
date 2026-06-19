import { useState, useCallback, memo } from 'react';
import { useTheme } from '../../../themes/ThemeContext';

interface CopyRowProps {
	label: string;
	value: string;
}

const CopyRow = memo(function CopyRow({ label, value }: CopyRowProps) {
	const [copied, setCopied] = useState(false);
	const { Button } = useTheme();

	const handleCopy = useCallback(async () => {
		try {
			await navigator.clipboard.writeText(value);
			setCopied(true);
			setTimeout(() => setCopied(false), 1400);
		} catch {
			// ignore
		}
	}, [value]);

	return (
		<div className="copy-row">
			<span className="copy-row__label">{label}</span>
			<code className="copy-row__value">{value}</code>
			<Button variant="ghost" size="sm" onClick={handleCopy}>
				{copied ? '已复制' : '复制'}
			</Button>
		</div>
	);
});

export default CopyRow;
