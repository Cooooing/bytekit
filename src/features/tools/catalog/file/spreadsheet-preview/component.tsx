import { Copy, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import LocalFilePicker from '@features/tools/shared/LocalFilePicker';
import { needsLargeFileConfirmation, type LocalPreviewFile } from '@features/tools/shared/localFilePreview';
import { useToolRefPanel } from '@features/tools/shared/RefPanelContext';
import { useAppMessage } from '@shared/ui/AppMessage';
import { useTheme } from '@themes/ThemeContext';
import { detectCsvDelimiter, normalizeRows, type CsvDelimiter } from './functions';
import { spreadsheetPreviewReference } from './references';

interface SheetData { name: string; rows: string[][]; }

export default function SpreadsheetPreviewTool() {
	const { Button } = useTheme();
	const message = useAppMessage();
	const [files, setFiles] = useState<LocalPreviewFile[]>([]);
	const [activeId, setActiveId] = useState<string>();
	const active = files.find((item) => item.id === activeId);
	const [sheets, setSheets] = useState<SheetData[]>([]);
	const [sheetIndex, setSheetIndex] = useState(0);
	const [query, setQuery] = useState('');
	const [encoding, setEncoding] = useState('utf-8');
	const [delimiter, setDelimiter] = useState<CsvDelimiter | 'auto'>('auto');
	const [scrollTop, setScrollTop] = useState(0);

	useToolRefPanel('表格预览参考', spreadsheetPreviewReference);

	function updateFile(id: string, partial: Partial<LocalPreviewFile>) {
		setFiles((current) => current.map((item) => item.id === id ? { ...item, ...partial } : item));
	}

	function addFiles(incoming: LocalPreviewFile[]) {
		const ready = incoming.filter((item) => !needsLargeFileConfirmation(item.file) || window.confirm(`${item.file.name} 超过 100 MB，解析可能占用较多内存，是否继续？`));
		if (!ready.length) return;
		setFiles((current) => [...current, ...ready]);
		setActiveId((current) => current ?? ready[0].id);
	}

	useEffect(() => {
		setSheets([]); setSheetIndex(0); setQuery('');
		if (!active) return;
		let cancelled = false;
		updateFile(active.id, { status: 'loading', error: undefined });
		(async () => {
			try {
				const XLSX = await import('xlsx');
				const workbook = active.extension === 'csv'
					? XLSX.read(new TextDecoder(encoding).decode(await active.file.arrayBuffer()), { type: 'string', raw: true, FS: delimiter === 'auto' ? detectCsvDelimiter(await active.file.text()) : delimiter })
					: XLSX.read(await active.file.arrayBuffer(), { type: 'array', raw: true, cellFormula: true });
				const nextSheets = workbook.SheetNames.map((name) => ({ name, rows: normalizeRows(XLSX.utils.sheet_to_json(workbook.Sheets[name], { header: 1, defval: '' }) as unknown[][]) }));
				if (cancelled) return;
				setSheets(nextSheets);
				updateFile(active.id, { status: 'ready' });
			} catch (error) {
				if (cancelled) return;
				const detail = error instanceof Error ? error.message : '文件解析失败。';
				updateFile(active.id, { status: 'error', error: detail });
				message.error(`无法预览 ${active.file.name}：${detail}`);
			}
		})();
		return () => { cancelled = true; };
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [active?.id, encoding, delimiter]);

	const selectedSheet = sheets[sheetIndex];
	const filteredRows = useMemo(() => {
		if (!selectedSheet) return [];
		if (!query.trim()) return selectedSheet.rows;
		const term = query.trim().toLocaleLowerCase();
		return selectedSheet.rows.filter((row) => row.some((cell) => cell.toLocaleLowerCase().includes(term)));
	}, [query, selectedSheet]);
	const rowHeight = 37;
	const visibleStart = Math.max(0, Math.floor(scrollTop / rowHeight) - 8);
	const visibleEnd = Math.min(Math.max(0, filteredRows.length - 1), visibleStart + 32);
	const visibleRows = filteredRows.slice(visibleStart + 1, visibleEnd + 1);

	async function copyCell(value: string) {
		try { await navigator.clipboard.writeText(value); message.success('已复制单元格内容。'); }
		catch { message.error('复制失败。'); }
	}

	return (
		<section className="file-preview-workbench" aria-label="表格预览器">
			<LocalFilePicker family="spreadsheet" files={files} activeId={activeId} onAdd={addFiles} onSelect={setActiveId} onRemove={(id) => setFiles((current) => {
				const next = current.filter((item) => item.id !== id);
				if (activeId === id) setActiveId(next[0]?.id);
				return next;
			})} onClear={() => { setFiles([]); setActiveId(undefined); }} />
			<div className="file-preview-workbench__main">
				<header className="file-preview-workbench__toolbar file-preview-workbench__toolbar--spreadsheet">
					<div><strong>{active?.file.name ?? '选择表格开始预览'}</strong>{selectedSheet ? <span>{selectedSheet.rows.length} 行 · {selectedSheet.rows[0]?.length ?? 0} 列</span> : null}</div>
					<div className="file-preview-workbench__controls">
						{active?.extension === 'csv' ? <><select value={encoding} onChange={(event) => setEncoding(event.target.value)} aria-label="CSV 编码"><option value="utf-8">UTF-8</option><option value="gb18030">GB18030</option></select><select value={delimiter} onChange={(event) => setDelimiter(event.target.value as CsvDelimiter | 'auto')} aria-label="CSV 分隔符"><option value="auto">自动分隔</option><option value=",">逗号</option><option value=";">分号</option><option value="\t">制表符</option><option value="|">竖线</option></select></> : null}
						<label className="file-preview-workbench__search"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索单元格" aria-label="搜索单元格" /></label>
					</div>
				</header>
				{selectedSheet ? <>
					<div className="spreadsheet-preview__tabs">{sheets.map((sheet, index) => <Button key={sheet.name} variant={sheetIndex === index ? 'primary' : 'secondary'} size="sm" onClick={() => { setSheetIndex(index); setScrollTop(0); }}>{sheet.name}</Button>)}</div>
					<div className="spreadsheet-preview" onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}><table><thead><tr>{(filteredRows[0] ?? []).map((cell, index) => <th key={index}>{cell || `列 ${index + 1}`}</th>)}</tr></thead><tbody>{visibleStart ? <tr aria-hidden="true"><td colSpan={filteredRows[0]?.length ?? 1} style={{ height: visibleStart * rowHeight, padding: 0, border: 0 }} /></tr> : null}{visibleRows.map((row, rowIndex) => <tr key={visibleStart + rowIndex}>{row.map((cell, cellIndex) => <td key={cellIndex}><button type="button" title="复制单元格" onClick={() => void copyCell(cell)}>{cell}<Copy size={12} aria-hidden="true" /></button></td>)}</tr>)}{visibleEnd < filteredRows.length - 1 ? <tr aria-hidden="true"><td colSpan={filteredRows[0]?.length ?? 1} style={{ height: (filteredRows.length - 1 - visibleEnd) * rowHeight, padding: 0, border: 0 }} /></tr> : null}</tbody></table></div>
				</> : <div className="file-preview-workbench__empty"><Search size={28} /><strong>选择或拖入表格</strong><span>支持 XLS、XLSX、XLSM、XLSB、ODS 与 CSV，本地解析，不执行宏。</span></div>}
			</div>
		</section>
	);
}
