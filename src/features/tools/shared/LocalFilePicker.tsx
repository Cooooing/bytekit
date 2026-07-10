import { FilePlus2, Trash2, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { useAppMessage } from '@shared/ui/AppMessage';
import { useTheme } from '@themes/ThemeContext';
import { acceptedExtensions, createPreviewFiles, formatFileSize, type LocalPreviewFile, type PreviewFamily } from './localFilePreview';

interface LocalFilePickerProps {
	family: PreviewFamily;
	files: LocalPreviewFile[];
	activeId?: string;
	onAdd: (files: LocalPreviewFile[]) => void;
	onSelect: (id: string) => void;
	onRemove: (id: string) => void;
	onClear: () => void;
}

export default function LocalFilePicker({ family, files, activeId, onAdd, onSelect, onRemove, onClear }: LocalFilePickerProps) {
	const { Button } = useTheme();
	const message = useAppMessage();
	const inputRef = useRef<HTMLInputElement>(null);
	const [dragging, setDragging] = useState(false);

	function addFiles(input: FileList | File[]) {
		const result = createPreviewFiles(input, family);
		if (result.rejected.length) {
			message.warning(`当前不支持 ${result.rejected.map((file) => file.name).join('、')}，请选择 ${acceptedExtensions(family)} 格式。`);
		}
		if (result.accepted.length) onAdd(result.accepted);
	}

	return (
		<aside className="local-file-picker" aria-label="本地文件列表">
			<input ref={inputRef} className="sr-only" type="file" accept={acceptedExtensions(family)} multiple onChange={(event) => {
				if (event.target.files) addFiles(event.target.files);
				event.currentTarget.value = '';
			}} />
		<div
			className={`local-file-picker__drop${dragging ? ' local-file-picker__drop--dragging' : ''}`}
			onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
			onDragLeave={() => setDragging(false)}
			onDrop={(event) => { event.preventDefault(); setDragging(false); addFiles(event.dataTransfer.files); }}
		>
			<FilePlus2 size={22} aria-hidden="true" />
			<strong>选择或拖入文件</strong>
			<span>{acceptedExtensions(family).replaceAll(',', ' ')}</span>
			<Button variant="secondary" size="sm" onClick={() => inputRef.current?.click()}>选择文件</Button>
		</div>
		<div className="local-file-picker__heading">
			<span>文件列表 {files.length ? `(${files.length})` : ''}</span>
			{files.length ? <button className="icon-button" type="button" aria-label="清空文件列表" title="清空文件列表" onClick={onClear}><Trash2 size={16} /></button> : null}
		</div>
		<div className="local-file-picker__list">
			{files.length ? files.map((item) => (
				<div key={item.id} className={`local-file-picker__item${item.id === activeId ? ' local-file-picker__item--active' : ''}`}>
					<button className="local-file-picker__select" type="button" onClick={() => onSelect(item.id)}>
						<span className="local-file-picker__name">{item.file.name}</span>
						<span>{item.extension.toUpperCase()} · {formatFileSize(item.file.size)} · {statusLabel(item.status)}</span>
					</button>
					<button className="icon-button" type="button" aria-label={`移除 ${item.file.name}`} title="移除文件" onClick={() => onRemove(item.id)}><X size={15} /></button>
				</div>
			)) : <p className="local-file-picker__empty">文件只会在当前页面内存中处理，不会上传或保存。</p>}
		</div>
		</aside>
	);
}

function statusLabel(status: LocalPreviewFile['status']) {
	if (status === 'loading') return '加载中';
	if (status === 'ready') return '已加载';
	if (status === 'error') return '失败';
	return '等待加载';
}
