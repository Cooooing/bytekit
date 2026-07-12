import { ChevronLeft, ChevronRight, Expand, Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import LocalFilePicker from '@features/tools/shared/LocalFilePicker';
import { needsLargeFileConfirmation, type LocalPreviewFile } from '@features/tools/shared/localFilePreview';
import { useToolRefPanel } from '@features/tools/shared/RefPanelContext';
import { useAppMessage } from '@shared/ui/AppMessage';
import { useTheme } from '@themes/ThemeContext';
import { documentPreviewReference } from './references';
import { readEpub, type EpubChapter } from './epub';

export default function DocumentPreviewTool() {
	const { Button } = useTheme();
	const message = useAppMessage();
	const [files, setFiles] = useState<LocalPreviewFile[]>([]);
	const [activeId, setActiveId] = useState<string>();
	const active = files.find((item) => item.id === activeId);
	const [page, setPage] = useState(1);
	const [pageCount, setPageCount] = useState(0);
	const [zoom, setZoom] = useState(1.15);
	const [slide, setSlide] = useState(0);
	const [slideCount, setSlideCount] = useState(0);
	const [chapters, setChapters] = useState<EpubChapter[]>([]);
	const [chapterIndex, setChapterIndex] = useState(0);
	const pdfCanvasRef = useRef<HTMLCanvasElement>(null);
	const docxRef = useRef<HTMLDivElement>(null);
	const pptxRef = useRef<HTMLDivElement>(null);
	const viewerRef = useRef<{ destroy?: () => void } | null>(null);

	useToolRefPanel('文档预览参考', documentPreviewReference);

	function updateFile(id: string, partial: Partial<LocalPreviewFile>) {
		setFiles((current) => current.map((item) => item.id === id ? { ...item, ...partial } : item));
	}

	function addFiles(incoming: LocalPreviewFile[]) {
		const ready = incoming.filter((item) => !needsLargeFileConfirmation(item.file) || window.confirm(`${item.file.name} 超过 100 MB，解析可能占用较多内存，是否继续？`));
		if (!ready.length) return;
		setFiles((current) => [...current, ...ready]);
		setActiveId((current) => current ?? ready[0].id);
	}

	function removeFile(id: string) {
		setFiles((current) => {
			const next = current.filter((item) => item.id !== id);
			if (activeId === id) setActiveId(next[0]?.id);
			return next;
		});
	}

	useEffect(() => {
		viewerRef.current?.destroy?.();
		viewerRef.current = null;
		setPage(1); setPageCount(0); setSlide(0); setSlideCount(0); setChapters([]); setChapterIndex(0);
		if (!active) return;
		let cancelled = false;
		updateFile(active.id, { status: 'loading', error: undefined });
		const fail = (error: unknown) => {
			if (cancelled) return;
			const detail = error instanceof Error ? error.message : '文件解析失败。';
			updateFile(active.id, { status: 'error', error: detail });
			message.error(`无法预览 ${active.file.name}：${detail}`);
		};

		(async () => {
			try {
				if (active.extension === 'docx') {
					const { renderAsync } = await import('docx-preview');
					if (!docxRef.current || cancelled) return;
					docxRef.current.replaceChildren();
					await renderAsync(active.file, docxRef.current, undefined, { inWrapper: true, breakPages: true, renderComments: false });
				}
				if (active.extension === 'pptx') {
					const { PptxViewer, RECOMMENDED_ZIP_LIMITS } = await import('@aiden0z/pptx-renderer/browser');
					if (!pptxRef.current || cancelled) return;
					pptxRef.current.replaceChildren();
					const viewer = await PptxViewer.open(await active.file.arrayBuffer(), pptxRef.current, { renderMode: 'slide', fitMode: 'contain', lazySlides: true, lazyMedia: true, zipLimits: RECOMMENDED_ZIP_LIMITS, pdfjs: false });
					if (cancelled) { viewer.destroy(); return; }
					viewerRef.current = viewer;
					setSlideCount(viewer.slideCount);
					await viewer.goToSlide(0);
				}
				if (active.extension === 'epub') {
					const nextChapters = await readEpub(active.file);
					if (cancelled) return;
					setChapters(nextChapters);
				}
				if (!cancelled && active.extension !== 'pdf') updateFile(active.id, { status: 'ready' });
			} catch (error) { fail(error); }
		})();
		return () => { cancelled = true; };
		// active id deliberately selects a new local file instance.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [active?.id]);

	useEffect(() => {
		if (!active || active.extension !== 'pdf') return;
		let cancelled = false;
		let pdfDocument: { destroy?: () => Promise<void> | void } | null = null;
		(async () => {
			try {
				const pdfjs = await import('pdfjs-dist/build/pdf.mjs');
				pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.mjs', import.meta.url).toString();
				const document = await pdfjs.getDocument({ data: new Uint8Array(await active.file.arrayBuffer()) }).promise;
				pdfDocument = document;
				if (cancelled) return;
				setPageCount(document.numPages);
				const pdfPage = await document.getPage(page);
				const viewport = pdfPage.getViewport({ scale: zoom });
				const canvas = pdfCanvasRef.current;
				if (!canvas || cancelled) return;
				canvas.width = Math.ceil(viewport.width); canvas.height = Math.ceil(viewport.height);
				await pdfPage.render({ canvasContext: canvas.getContext('2d')!, viewport }).promise;
				if (!cancelled) updateFile(active.id, { status: 'ready' });
			} catch (error) {
				if (!cancelled) {
					const detail = error instanceof Error ? error.message : '文件解析失败。';
					updateFile(active.id, { status: 'error', error: detail });
					message.error(`无法预览 ${active.file.name}：${detail}`);
				}
			} finally {
				if (pdfDocument?.destroy) await Promise.resolve(pdfDocument.destroy()).catch(() => undefined);
			}
		})();
		return () => { cancelled = true; };
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [active?.id, page, zoom]);

	function changeSlide(next: number) {
		if (!viewerRef.current || next < 0 || next >= slideCount) return;
		setSlide(next);
		void (viewerRef.current as { goToSlide: (index: number) => Promise<void> }).goToSlide(next);
	}

	return (
		<section className="file-preview-workbench" aria-label="文档预览器">
			<LocalFilePicker family="document" files={files} activeId={activeId} onAdd={addFiles} onSelect={setActiveId} onRemove={removeFile} onClear={() => { setFiles([]); setActiveId(undefined); }} />
			<div className="file-preview-workbench__main">
				<header className="file-preview-workbench__toolbar">
					<div><strong>{active?.file.name ?? '选择文档开始预览'}</strong>{active ? <span>{active.extension.toUpperCase()} · {active.file.size.toLocaleString()} B</span> : null}</div>
					{active?.extension === 'pdf' ? <div className="file-preview-workbench__controls"><Button variant="secondary" size="sm" onClick={() => setZoom((value) => Math.max(0.6, value - 0.15))}>缩小</Button><span>{Math.round(zoom * 100)}%</span><Button variant="secondary" size="sm" onClick={() => setZoom((value) => Math.min(2.5, value + 0.15))}>放大</Button><Button variant="secondary" size="sm" onClick={() => setPage((value) => Math.max(1, value - 1))}><ChevronLeft size={16} /></Button><span>{page} / {pageCount || '-'}</span><Button variant="secondary" size="sm" onClick={() => setPage((value) => Math.min(pageCount, value + 1))}><ChevronRight size={16} /></Button></div> : null}
					{active?.extension === 'pptx' ? <div className="file-preview-workbench__controls"><Button variant="secondary" size="sm" onClick={() => changeSlide(slide - 1)}><ChevronLeft size={16} /></Button><span>{slide + 1} / {slideCount || '-'}</span><Button variant="secondary" size="sm" onClick={() => changeSlide(slide + 1)}><ChevronRight size={16} /></Button><Button variant="secondary" size="sm" onClick={() => pptxRef.current?.requestFullscreen()}><Expand size={16} /> 全屏</Button></div> : null}
					{active?.extension === 'epub' ? <div className="file-preview-workbench__controls"><Button variant="secondary" size="sm" onClick={() => setChapterIndex((value) => Math.max(0, value - 1))}><ChevronLeft size={16} /> 上一章</Button><span>{chapterIndex + 1} / {chapters.length || '-'}</span><Button variant="secondary" size="sm" onClick={() => setChapterIndex((value) => Math.min(chapters.length - 1, value + 1))}>下一章 <ChevronRight size={16} /></Button></div> : null}
				</header>
				{active?.extension === 'pdf' ? <div className="document-preview document-preview--pdf"><canvas ref={pdfCanvasRef} aria-label="PDF 页面" /></div> : null}
				{active?.extension === 'docx' ? <div ref={docxRef} className="document-preview document-preview--docx" /> : null}
				{active?.extension === 'pptx' ? <div ref={pptxRef} className="document-preview document-preview--pptx" /> : null}
				{active?.extension === 'epub' ? <div className="document-preview document-preview--epub"><div className="epub-preview__chapters">{chapters.map((chapter, index) => <button key={chapter.id} type="button" className={chapterIndex === index ? 'epub-preview__chapter epub-preview__chapter--active' : 'epub-preview__chapter'} onClick={() => setChapterIndex(index)}>{chapter.title}</button>)}</div>{chapters[chapterIndex] ? <iframe title={chapters[chapterIndex].title} sandbox="" srcDoc={`<!doctype html><html><head><meta charset="utf-8"><style>body{max-width:46rem;margin:0 auto;padding:2rem;font:1rem/1.7 system-ui;color:#172033}img{max-width:100%;height:auto}table{max-width:100%;border-collapse:collapse}td,th{border:1px solid #cbd5e1;padding:.35rem}</style></head><body>${chapters[chapterIndex].content}</body></html>`} /> : <div className="state-box">正在读取 EPUB 章节...</div>}</div> : null}
				{!active ? <div className="file-preview-workbench__empty"><Search size={28} /><strong>选择或拖入文档</strong><span>支持 PDF、DOCX、PPTX 与 EPUB，本地解析，不上传文件。</span></div> : null}
			</div>
		</section>
	);
}
