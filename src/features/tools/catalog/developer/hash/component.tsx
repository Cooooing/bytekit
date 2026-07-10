import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import CopyRow from '@features/tools/shared/CopyRow';
import GeneratorPanel from '@features/tools/shared/GeneratorPanel';
import { useToolRefPanel } from '@features/tools/shared/RefPanelContext';
import { useToolStorage } from '@features/tools/shared/useToolStorage';
import { useDebouncedValue } from '@shared/hooks/useDebouncedValue';
import { useAppMessage } from '@shared/ui/AppMessage';
import { useTheme } from '@themes/ThemeContext';
import {
	compareExpectedHash,
	computeHashes,
	DEFAULT_HASH_ALGORITHMS,
	HASH_ALGORITHMS,
	type HashAlgorithm,
} from './functions';
import { hashReference } from './references';

type HashMode = 'text' | 'file';
type FileHashStatus = 'idle' | 'queued' | 'computing' | 'ready' | 'cancelled' | 'error';

interface HashToolState {
	input: string;
	mode?: HashMode;
	algorithms?: HashAlgorithm[];
	expectedHash?: string;
}

interface HashFileItem {
	id: string;
	file: File;
	selected: boolean;
	status: FileHashStatus;
	progress: number;
	processedBytes: number;
	hashes: Partial<Record<HashAlgorithm, string>>;
	error?: string;
}

type HashViewState =
	| { status: 'idle'; hashes: Partial<Record<HashAlgorithm, string>> }
	| { status: 'loading'; hashes: Partial<Record<HashAlgorithm, string>> }
	| { status: 'ready'; hashes: Partial<Record<HashAlgorithm, string>> };

type WorkerResponse =
	| { type: 'progress'; id: string; processedBytes: number; totalBytes: number }
	| { type: 'done'; id: string; hashes: Record<HashAlgorithm, string> }
	| { type: 'cancelled'; id: string }
	| { type: 'error'; id: string; error: string };

interface ActiveTask {
	id: string;
	worker: Worker;
	resolve: (status: FileHashStatus) => void;
}

export default function HashGenerator() {
	const { Button } = useTheme();
	const message = useAppMessage();
	const fileInputRef = useRef<HTMLInputElement | null>(null);
	const activeTaskRef = useRef<ActiveTask | null>(null);
	const filesRef = useRef<HashFileItem[]>([]);
	const [state, setState] = useToolStorage<HashToolState>('bytekit:tool:hash:v1', {
		input: 'Bytekit',
		mode: 'text',
		algorithms: DEFAULT_HASH_ALGORITHMS,
		expectedHash: '',
	});
	const mode = state.mode ?? 'text';
	const selectedAlgorithms = state.algorithms?.length ? state.algorithms : DEFAULT_HASH_ALGORITHMS;
	const expectedHash = state.expectedHash ?? '';
	const input = state.input ?? '';
	const debouncedInput = useDebouncedValue(input, 250);
	const [hashState, setHashState] = useState<HashViewState>({ status: 'idle', hashes: {} });
	const [files, setFiles] = useState<HashFileItem[]>([]);

	useEffect(() => {
		filesRef.current = files;
	}, [files]);

	useEffect(() => () => {
		activeTaskRef.current?.worker.terminate();
		activeTaskRef.current = null;
	}, []);

	useEffect(() => {
		if (mode !== 'text') return;
		if (!debouncedInput) {
			setHashState({ status: 'idle', hashes: {} });
			return;
		}

		let cancelled = false;
		setHashState((current) => ({ status: 'loading', hashes: current.hashes }));

		computeHashes(debouncedInput, selectedAlgorithms).then((result) => {
			if (cancelled) return;
			if (result.ok) setHashState({ status: 'ready', hashes: result.hashes });
			else {
				message.error(result.error);
				setHashState((current) => Object.keys(current.hashes).length > 0 ? { status: 'ready', hashes: current.hashes } : { status: 'idle', hashes: {} });
			}
		}).catch(() => {
			if (!cancelled) {
				message.error('Hash 计算失败。');
				setHashState((current) => Object.keys(current.hashes).length > 0 ? { status: 'ready', hashes: current.hashes } : { status: 'idle', hashes: {} });
			}
		});

		return () => {
			cancelled = true;
		};
	}, [debouncedInput, message, mode, selectedAlgorithms]);

	const isComputing = files.some((item) => item.status === 'queued' || item.status === 'computing');
	const selectedFileCount = files.filter((item) => item.selected).length;

	const setInput = useCallback((value: string) => {
		setState((current) => ({ ...current, input: value }));
	}, [setState]);

	const setMode = useCallback((nextMode: HashMode) => {
		setState((current) => ({ ...current, mode: nextMode }));
	}, [setState]);

	const setExpectedHash = useCallback((value: string) => {
		setState((current) => ({ ...current, expectedHash: value }));
	}, [setState]);

	const toggleAlgorithm = useCallback((algorithm: HashAlgorithm) => {
		setState((current) => {
			const currentAlgorithms = current.algorithms?.length ? current.algorithms : DEFAULT_HASH_ALGORITHMS;
			const exists = currentAlgorithms.includes(algorithm);
			if (exists && currentAlgorithms.length === 1) {
				message.info('至少保留一种算法。');
				return current;
			}
			const algorithms = exists
				? currentAlgorithms.filter((item) => item !== algorithm)
				: HASH_ALGORITHMS.filter((item) => [...currentAlgorithms, algorithm].includes(item));
			return { ...current, algorithms };
		});
	}, [message, setState]);

	const handleFilesSelected = useCallback((fileList: FileList | null) => {
		if (!fileList?.length) return;
		const nextItems = Array.from(fileList).map((file) => ({
			id: createFileId(file),
			file,
			selected: true,
			status: 'idle' as const,
			progress: 0,
			processedBytes: 0,
			hashes: {},
		}));
		setFiles((current) => [...current, ...nextItems]);
		if (fileInputRef.current) fileInputRef.current.value = '';
	}, []);

	const updateFile = useCallback((id: string, updater: (item: HashFileItem) => HashFileItem) => {
		setFiles((current) => current.map((item) => item.id === id ? updater(item) : item));
	}, []);

	const removeFile = useCallback((id: string) => {
		if (activeTaskRef.current?.id === id) {
			activeTaskRef.current.worker.terminate();
			activeTaskRef.current.resolve('cancelled');
			activeTaskRef.current = null;
		}
		setFiles((current) => current.filter((item) => item.id !== id));
	}, []);

	const cancelFile = useCallback((id: string) => {
		if (activeTaskRef.current?.id === id) {
			activeTaskRef.current.worker.terminate();
			activeTaskRef.current.resolve('cancelled');
			activeTaskRef.current = null;
		}
		updateFile(id, (item) => ({
			...item,
			status: 'cancelled',
			progress: item.status === 'ready' ? item.progress : 0,
			processedBytes: item.status === 'ready' ? item.processedBytes : 0,
		}));
	}, [updateFile]);

	const toggleFileSelection = useCallback((id: string) => {
		updateFile(id, (item) => ({ ...item, selected: !item.selected }));
	}, [updateFile]);

	const runFileHash = useCallback((id: string, algorithms: HashAlgorithm[]) => new Promise<FileHashStatus>((resolve) => {
		const item = filesRef.current.find((fileItem) => fileItem.id === id);
		if (!item) {
			resolve('error');
			return;
		}

		updateFile(id, (current) => ({
			...current,
			status: 'computing',
			progress: 0,
			processedBytes: 0,
			error: undefined,
			hashes: {},
		}));

		const worker = new Worker(new URL('./hashWorker.ts', import.meta.url), { type: 'module' });
		activeTaskRef.current = { id, worker, resolve };

		worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
			const response = event.data;
			if (response.id !== id) return;

			if (response.type === 'progress') {
				updateFile(id, (current) => ({
					...current,
					status: 'computing',
					progress: response.totalBytes > 0 ? response.processedBytes / response.totalBytes : 1,
					processedBytes: response.processedBytes,
				}));
				return;
			}

			worker.terminate();
			activeTaskRef.current = null;

			if (response.type === 'done') {
				updateFile(id, (current) => ({
					...current,
					status: 'ready',
					progress: 1,
					processedBytes: current.file.size,
					hashes: response.hashes,
				}));
				resolve('ready');
				return;
			}

			if (response.type === 'cancelled') {
				updateFile(id, (current) => ({ ...current, status: 'cancelled', progress: 0, processedBytes: 0 }));
				resolve('cancelled');
				return;
			}

			updateFile(id, (current) => ({ ...current, status: 'error', error: response.error }));
			message.error(response.error);
			resolve('error');
		};

		worker.onerror = () => {
			worker.terminate();
			activeTaskRef.current = null;
			updateFile(id, (current) => ({ ...current, status: 'error', error: '文件 Hash 计算失败。' }));
			message.error('文件 Hash 计算失败。');
			resolve('error');
		};

		worker.postMessage({ type: 'hash-file', id, file: item.file, algorithms });
	}), [message, updateFile]);

	const calculateFiles = useCallback(async (ids?: string[]) => {
		if (isComputing) return;
		if (selectedAlgorithms.length === 0) {
			message.error('请至少选择一种算法。');
			return;
		}

		const targets = filesRef.current.filter((item) => ids ? ids.includes(item.id) : item.selected);
		if (targets.length === 0) {
			message.info('请先选择要计算的文件。');
			return;
		}

		targets.forEach((target) => {
			updateFile(target.id, (item) => ({ ...item, status: 'queued', progress: 0, processedBytes: 0, error: undefined }));
		});

		for (const target of targets) {
			const latest = filesRef.current.find((item) => item.id === target.id);
			if (!latest || latest.status === 'cancelled') continue;
			await runFileHash(target.id, selectedAlgorithms);
		}
	}, [isComputing, message, runFileHash, selectedAlgorithms, updateFile]);

	const controls = useMemo(() => (
		<div className="tool-card tool-card--controls hash-tool">
			<div className="tool-card__section">
				<h2 className="tool-card__title">模式</h2>
				<div className="hash-mode-tabs" role="tablist" aria-label="Hash 计算模式">
					<button className={mode === 'text' ? 'hash-mode-tabs__item hash-mode-tabs__item--active' : 'hash-mode-tabs__item'} type="button" onClick={() => setMode('text')}>
						文本
					</button>
					<button className={mode === 'file' ? 'hash-mode-tabs__item hash-mode-tabs__item--active' : 'hash-mode-tabs__item'} type="button" onClick={() => setMode('file')}>
						文件
					</button>
				</div>
			</div>

			<div className="tool-card__section">
				<h2 className="tool-card__title">算法</h2>
				<div className="hash-algorithm-grid">
					{HASH_ALGORITHMS.map((algorithm) => (
						<label key={algorithm} className={selectedAlgorithms.includes(algorithm) ? 'regex-flag regex-flag--active' : 'regex-flag'}>
							<input
								type="checkbox"
								checked={selectedAlgorithms.includes(algorithm)}
								onChange={() => toggleAlgorithm(algorithm)}
								className="sr-only"
							/>
							<span className="regex-flag__code">{algorithm === 'CRC32' ? 'CRC' : algorithm.replace('SHA-', '')}</span>
							<span className="regex-flag__label">{algorithm}</span>
						</label>
					))}
				</div>
			</div>

			{mode === 'text' ? (
				<div className="tool-card__section">
					<h2 className="tool-card__title">输入内容</h2>
					<textarea
						value={input}
						onChange={(event) => setInput(event.target.value)}
						placeholder="输入要计算 Hash 的文本"
						aria-label="输入内容"
						rows={6}
						className="tool-textarea"
					/>
				</div>
			) : (
				<div className="tool-card__section">
					<h2 className="tool-card__title">文件</h2>
					<input ref={fileInputRef} type="file" multiple onChange={(event) => handleFilesSelected(event.target.files)} className="sr-only" />
					<div className="hash-file-actions">
						<Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>选择文件</Button>
						<Button variant="primary" size="sm" onClick={() => void calculateFiles()} disabled={files.length === 0 || selectedFileCount === 0 || isComputing}>
							计算选中文件
						</Button>
					</div>
					<p className="hash-muted">文件只在本地浏览器中分片计算，不上传。多文件按队列串行计算。</p>
				</div>
			)}

			<div className="tool-card__section">
				<h2 className="tool-card__title">校验值</h2>
				<input
					className="tool-textarea"
					value={expectedHash}
					onChange={(event) => setExpectedHash(event.target.value)}
					placeholder="粘贴期望 Hash，例如 sha256:..."
					aria-label="期望 Hash"
				/>
			</div>
		</div>
	), [Button, calculateFiles, expectedHash, files.length, handleFilesSelected, input, isComputing, mode, selectedAlgorithms, selectedFileCount, setExpectedHash, setInput, setMode, toggleAlgorithm]);

	const resultPanel = useMemo(() => (
		<div className="tool-card tool-card--result hash-result">
			<h2 className="tool-card__title">Hash 结果</h2>
			{mode === 'text' ? renderTextResult() : renderFileResult()}
		</div>
	), [expectedHash, files, hashState, isComputing, mode, selectedAlgorithms]);

	useToolRefPanel('Hash 计算与校验参考', hashReference);

	return <GeneratorPanel ariaLabel="Hash 计算与校验" controls={controls} result={resultPanel} />;

	function renderTextResult() {
		if (hashState.status === 'ready') {
			const compare = compareExpectedHash(expectedHash, hashState.hashes);
			return (
				<div className="hash-result__stack">
					<HashCompareBadge compare={compare} />
					<div className="hash-copy-list">
						{selectedAlgorithms.map((algorithm) => (
							<CopyRow key={algorithm} label={algorithm} value={hashState.hashes[algorithm] ?? ''} />
						))}
					</div>
				</div>
			);
		}

		if (hashState.status === 'loading') {
			return (
				<div className="hash-copy-list" aria-live="polite" aria-busy="true">
					{selectedAlgorithms.map((algorithm) => (
						<div key={algorithm} className="copy-row">
							<span className="copy-row__label">{algorithm}</span>
							<code className="copy-row__value">计算中...</code>
						</div>
					))}
				</div>
			);
		}

		return <div className="state-box">输入内容后自动计算。</div>;
	}

	function renderFileResult() {
		if (files.length === 0) return <div className="state-box">选择文件后显示计算队列。</div>;

		return (
			<div className="hash-file-list">
				{files.map((item) => (
					<div className="hash-file-card" key={item.id}>
						<div className="hash-file-card__head">
							<label className="inline-check">
								<input type="checkbox" checked={item.selected} onChange={() => toggleFileSelection(item.id)} disabled={isComputing} />
								<span>选择</span>
							</label>
							<div className="hash-file-card__meta">
								<strong title={item.file.name}>{item.file.name}</strong>
								<span>{formatBytes(item.file.size)} · {item.file.type || '未知类型'} · {formatDate(item.file.lastModified)}</span>
							</div>
							<div className="hash-file-card__actions">
								{item.status === 'queued' || item.status === 'computing' ? (
									<Button variant="ghost" size="sm" onClick={() => cancelFile(item.id)}>取消</Button>
								) : (
									<Button variant="secondary" size="sm" onClick={() => void calculateFiles([item.id])} disabled={isComputing}>计算</Button>
								)}
								<Button variant="ghost" size="sm" onClick={() => removeFile(item.id)} disabled={isComputing && item.status !== 'computing'}>移除</Button>
							</div>
						</div>

						<HashFileProgress item={item} />
						{item.status === 'ready' ? (
							<>
								<HashCompareBadge compare={compareExpectedHash(expectedHash, item.hashes)} />
								<div className="hash-copy-list">
									{selectedAlgorithms.map((algorithm) => (
										<CopyRow key={algorithm} label={algorithm} value={item.hashes[algorithm] ?? ''} />
									))}
								</div>
							</>
						) : null}
						{item.status === 'error' && item.error ? <p className="hash-error">{item.error}</p> : null}
					</div>
				))}
			</div>
		);
	}
}

function HashFileProgress({ item }: { item: HashFileItem }) {
	if (item.status === 'idle') return <span className="ui-badge ui-badge--neutral">等待计算</span>;
	if (item.status === 'queued') return <span className="ui-badge ui-badge--info">队列中</span>;
	if (item.status === 'ready') return <span className="ui-badge ui-badge--success">已完成</span>;
	if (item.status === 'cancelled') return <span className="ui-badge ui-badge--warning">已取消</span>;
	if (item.status === 'error') return <span className="ui-badge ui-badge--danger">失败</span>;

	const percent = Math.round(item.progress * 100);
	return (
		<div className="hash-progress" aria-label={`计算进度 ${percent}%`}>
			<div className="hash-progress__bar">
				<span style={{ width: `${percent}%` }} />
			</div>
			<span>{percent}% · {formatBytes(item.processedBytes)} / {formatBytes(item.file.size)}</span>
		</div>
	);
}

function HashCompareBadge({ compare }: { compare: ReturnType<typeof compareExpectedHash> }) {
	if (compare.status === 'idle') return null;
	if (compare.status === 'matched') return <span className="ui-badge ui-badge--success">校验匹配</span>;
	if (compare.status === 'unknown-algorithm') return <span className="ui-badge ui-badge--warning">未选择对应算法</span>;
	return <span className="ui-badge ui-badge--danger">校验不匹配</span>;
}

function createFileId(file: File) {
	if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
	return `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(16).slice(2)}`;
}

function formatBytes(value: number) {
	if (value === 0) return '0 B';
	const units = ['B', 'KB', 'MB', 'GB', 'TB'];
	const index = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1);
	const size = value / 1024 ** index;
	return `${size >= 10 || index === 0 ? size.toFixed(0) : size.toFixed(1)} ${units[index]}`;
}

function formatDate(value: number) {
	if (!value) return '未知时间';
	return new Intl.DateTimeFormat('zh-CN', {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
	}).format(value);
}
