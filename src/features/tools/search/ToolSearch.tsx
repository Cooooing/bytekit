import { Search } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type MiniSearch from 'minisearch';
import type { SearchResult } from 'minisearch';
import { getCategoryById, getToolIdFromPathname, isToolPath, tools } from '../core/registry';

interface ToolSearchProps {
	variant?: 'header' | 'hero' | 'sidebar';
}

interface SearchDocument {
	id: string;
	name: string;
	shortName: string;
	description: string;
	keywords: string;
	category: string;
	pinyin: string;
	href: string;
}

type PinyinArrayFn = typeof import('pinyin-pro').pinyin;
type ToolSearchIndex = MiniSearch<SearchDocument>;
type ToolSearchResult = SearchResult & Pick<SearchDocument, 'id' | 'name' | 'description' | 'category' | 'href'>;

let depsPromise: Promise<{ MiniSearch: typeof MiniSearch; pinyin: PinyinArrayFn }> | null = null;
let searchIndexPromise: Promise<ToolSearchIndex> | null = null;

function loadSearchDeps() {
	if (!depsPromise) {
		depsPromise = Promise.all([
			import('minisearch'),
			import('pinyin-pro'),
		]).then(([miniSearchModule, pinyinModule]) => ({
			MiniSearch: miniSearchModule.default,
			pinyin: pinyinModule.pinyin,
		}));
	}
	return depsPromise;
}

function toPinyinSearchText(pinyinFn: PinyinArrayFn, value: string) {
	const chineseSegments = value.match(/[㐀-鿿]+/g) ?? [];
	const pinyinTokens = chineseSegments.flatMap((segment) => {
		const full = pinyinFn(segment, { toneType: 'none', type: 'array' });
		const initials = pinyinFn(segment, { pattern: 'first', toneType: 'none', type: 'array' });
		return [full.join(' '), full.join(''), initials.join('')];
	});
	return pinyinTokens.filter(Boolean).join(' ');
}

function buildDocuments(pinyinFn: PinyinArrayFn): SearchDocument[] {
	return tools.map((tool) => {
		const category = getCategoryById(tool.category)?.name ?? '';
		const keywords = tool.keywords.join(' ');
		const searchSource = [tool.name, tool.shortName, tool.description, keywords, category].join(' ');
		return {
			id: tool.id,
			name: tool.name,
			shortName: tool.shortName,
			description: tool.description,
			keywords,
			category,
			pinyin: toPinyinSearchText(pinyinFn, searchSource),
			href: tool.href,
		};
	});
}

async function getSearchIndex() {
	if (!searchIndexPromise) {
		searchIndexPromise = loadSearchDeps().then(({ MiniSearch, pinyin }) => {
			const index = new MiniSearch({
				fields: ['name', 'shortName', 'keywords', 'pinyin', 'description', 'category'],
				storeFields: ['id', 'name', 'description', 'category', 'href'],
				searchOptions: {
					boost: { name: 5, shortName: 4, keywords: 3, pinyin: 1 },
					prefix: true,
					fuzzy: 0.2,
				},
			});
			index.addAll(buildDocuments(pinyin));
			return index;
		});
	}
	return searchIndexPromise;
}

export default function ToolSearch({ variant = 'header' }: ToolSearchProps) {
	const [query, setQuery] = useState('');
	const [isFocused, setIsFocused] = useState(false);
	const [activeIndex, setActiveIndex] = useState(-1);
	const [searchReady, setSearchReady] = useState(false);
	const miniSearchRef = useRef<ToolSearchIndex | null>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const resultsRef = useRef<HTMLDivElement>(null);
	const queryRef = useRef(query);
	const isFocusedRef = useRef(isFocused);
	const activeIndexRef = useRef(activeIndex);
	const resultsLengthRef = useRef(0);

	queryRef.current = query;
	isFocusedRef.current = isFocused;
	activeIndexRef.current = activeIndex;

	const initSearch = useCallback(async () => {
		if (miniSearchRef.current) return;
		miniSearchRef.current = await getSearchIndex();
		setSearchReady(true);
	}, []);

	const normalizedQuery = query.trim();
	const results = useMemo(() => {
		if (!searchReady || !miniSearchRef.current || !normalizedQuery) return [];
		return miniSearchRef.current.search(normalizedQuery).slice(0, 8);
	}, [searchReady, normalizedQuery]);

	const showResults = isFocused && normalizedQuery.length > 0;
	resultsLengthRef.current = results.length;

	useEffect(() => {
		setActiveIndex(-1);
	}, [normalizedQuery]);

	useEffect(() => {
		if (showResults && results.length > 0 && activeIndex === -1) {
			setActiveIndex(0);
		}
	}, [showResults, results.length, activeIndex]);

	const selectTool = useCallback((href: string) => {
		const toolId = getToolIdFromPathname(href);
		if (isToolPath(window.location.pathname) && toolId) {
			window.dispatchEvent(new CustomEvent('bytekit:select-tool', { detail: { toolId } }));
			return;
		}
		window.location.href = import.meta.env.BASE_URL.replace(/\/?$/, '/') + href;
	}, []);

	useEffect(() => {
		if (activeIndex < 0 || !resultsRef.current) return;
		const items = resultsRef.current.querySelectorAll('[role="option"]');
		items[activeIndex]?.scrollIntoView({ block: 'nearest' });
	}, [activeIndex]);

	useEffect(() => {
		const input = inputRef.current;
		if (!input) return;
		function handleKeyDown(event: KeyboardEvent) {
			const hasResults = isFocusedRef.current && resultsLengthRef.current > 0;
			if (!hasResults) return;
			switch (event.key) {
				case 'ArrowDown': {
					event.preventDefault();
					setActiveIndex((prev) => (prev + 1) % resultsLengthRef.current);
					break;
				}
				case 'ArrowUp': {
					event.preventDefault();
					setActiveIndex((prev) => (prev <= 0 ? resultsLengthRef.current - 1 : prev - 1));
					break;
				}
				case 'Enter': {
					if (activeIndexRef.current >= 0 && activeIndexRef.current < resultsLengthRef.current) {
						event.preventDefault();
						const normalizedQ = queryRef.current.trim();
						if (normalizedQ && miniSearchRef.current) {
							const currentResults = miniSearchRef.current.search(normalizedQ).slice(0, 8);
							const selected = currentResults[activeIndexRef.current];
							if (selected) {
								selectTool(String(selected.href));
								setQuery('');
								setActiveIndex(-1);
								input.blur();
							}
						}
					}
					break;
				}
				case 'Escape': {
					setActiveIndex(-1);
					input.blur();
					break;
				}
			}
		}
		input.addEventListener('keydown', handleKeyDown);
		return () => input.removeEventListener('keydown', handleKeyDown);
	}, [selectTool]);

	useEffect(() => {
		if (variant !== 'header') return;
		function handleGlobalKeyDown(event: KeyboardEvent) {
			if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
				event.preventDefault();
				inputRef.current?.focus();
				inputRef.current?.select();
			}
		}
		document.addEventListener('keydown', handleGlobalKeyDown);
		return () => document.removeEventListener('keydown', handleGlobalKeyDown);
	}, [variant]);

	const nav = typeof navigator === 'undefined' ? null : navigator as Navigator & { userAgentData?: { platform?: string } };
	const isMac = nav ? nav.platform?.includes('Mac') || nav.userAgentData?.platform === 'macOS' : false;
	const shortcutHint = isMac ? '⌘K' : 'Ctrl+K';
	const listId = `tool-search-list-${variant}`;
	const activeId = activeIndex >= 0 && activeIndex < results.length
		? `tool-search-option-${results[activeIndex]?.id}`
		: undefined;

	return (
		<div className={`tool-search tool-search--${variant}`}>
			<label className="tool-search__field">
				<Search size={18} strokeWidth={2} aria-hidden="true" />
				<input
					ref={inputRef}
					type="text"
					value={query}
					onChange={(event) => setQuery(event.target.value)}
					onFocus={() => { initSearch(); setIsFocused(true); }}
					onBlur={() => setTimeout(() => setIsFocused(false), 150)}
					placeholder={variant === 'hero' ? `搜索工具（${shortcutHint}）` : '搜索工具...'}
					aria-label="搜索工具"
					aria-expanded={showResults}
					aria-controls={listId}
					aria-activedescendant={activeId}
					role="combobox"
					autoComplete="off"
				/>
				{!query ? <kbd className="tool-search__shortcut">{shortcutHint}</kbd> : null}
			</label>
			{showResults ? (
				<div ref={resultsRef} className="tool-search__results" id={listId} role="listbox">
					{results.length > 0 ? (results as ToolSearchResult[]).map((result, index) => (
						<button
							key={result.id}
							id={`tool-search-option-${result.id}`}
							className={`tool-search__result${index === activeIndex ? ' tool-search__result--active' : ''}`}
							type="button"
							role="option"
							aria-selected={index === activeIndex}
							onMouseDown={(event) => {
								event.preventDefault();
								selectTool(String(result.href));
								setQuery('');
							}}
						>
							<span className="tool-search__result-main">{String(result.name)}</span>
							<span className="tool-search__result-meta">{String(result.category)} · {String(result.description)}</span>
						</button>
					)) : <div className="tool-search__empty">没有匹配的工具</div>}
				</div>
			) : null}
		</div>
	);
}
