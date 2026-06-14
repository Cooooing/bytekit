import MiniSearch from 'minisearch';
import { Search } from 'lucide-react';
import { pinyin } from 'pinyin-pro';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getCategoryById, tools } from '../../lib/toolRegistry';

interface ToolSearchProps {
	variant?: 'header' | 'hero' | 'sidebar';
}

function toPinyinSearchText(value: string) {
	const chineseSegments = value.match(/[㐀-鿿]+/g) ?? [];
	const pinyinTokens = chineseSegments.flatMap((segment) => {
		const full = pinyin(segment, { toneType: 'none', type: 'array' });
		const initials = pinyin(segment, { pattern: 'first', toneType: 'none', type: 'array' });

		return [full.join(' '), full.join(''), initials.join('')];
	});

	return pinyinTokens.filter(Boolean).join(' ');
}

const documents = tools.map((tool) => {
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
		pinyin: toPinyinSearchText(searchSource),
		href: tool.href,
	};
});

export default function ToolSearch({ variant = 'header' }: ToolSearchProps) {
	const [query, setQuery] = useState('');
	const [isFocused, setIsFocused] = useState(false);
	const [activeIndex, setActiveIndex] = useState(-1);
	const inputRef = useRef<HTMLInputElement>(null);
	const resultsRef = useRef<HTMLDivElement>(null);
	const queryRef = useRef(query);
	const isFocusedRef = useRef(isFocused);
	const activeIndexRef = useRef(activeIndex);
	const resultsLengthRef = useRef(0);

	// Keep refs in sync
	queryRef.current = query;
	isFocusedRef.current = isFocused;
	activeIndexRef.current = activeIndex;

	const miniSearch = useMemo(() => {
		const index = new MiniSearch({
			fields: ['name', 'shortName', 'keywords', 'pinyin', 'description', 'category'],
			storeFields: ['id', 'name', 'description', 'category', 'href'],
			searchOptions: {
				boost: { name: 5, shortName: 4, keywords: 3, pinyin: 1 },
				prefix: true,
				fuzzy: 0.2,
			},
		});
		index.addAll(documents);
		return index;
	}, []);

	const normalizedQuery = query.trim();
	const results = normalizedQuery
		? miniSearch.search(normalizedQuery).slice(0, 8)
		: [];
	const showResults = isFocused && normalizedQuery.length > 0;
	resultsLengthRef.current = results.length;

	// Reset activeIndex when search query changes
	useEffect(() => {
		setActiveIndex(-1);
	}, [normalizedQuery]);

	// Auto-select first result when results appear
	useEffect(() => {
		if (showResults && results.length > 0 && activeIndex === -1) {
			setActiveIndex(0);
		}
	}, [showResults, results.length]);

	const selectTool = useCallback((href: string) => {
		const match = href.match(/^\/tools\/([^/]+)/);
		const toolId = match?.[1];
		const currentToolPath = window.location.pathname.startsWith('/tools/');

		if (currentToolPath && toolId) {
			window.dispatchEvent(new CustomEvent('bytekit:select-tool', { detail: { toolId } }));
			return;
		}

		window.location.href = href;
	}, []);

	// Scroll active item into view
	useEffect(() => {
		if (activeIndex < 0 || !resultsRef.current) return;
		const items = resultsRef.current.querySelectorAll('[role="option"]');
		items[activeIndex]?.scrollIntoView({ block: 'nearest' });
	}, [activeIndex]);

	// Native keydown listener — bypasses React event delegation issues
	useEffect(() => {
		const input = inputRef.current;
		if (!input) return;

		function handleKeyDown(e: KeyboardEvent) {
			const hasResults = isFocusedRef.current && resultsLengthRef.current > 0;
			if (!hasResults) return;

			switch (e.key) {
				case 'ArrowDown': {
					e.preventDefault();
					setActiveIndex((prev) => (prev + 1) % resultsLengthRef.current);
					break;
				}
				case 'ArrowUp': {
					e.preventDefault();
					setActiveIndex((prev) => (prev <= 0 ? resultsLengthRef.current - 1 : prev - 1));
					break;
				}
				case 'Enter': {
					if (activeIndexRef.current >= 0 && activeIndexRef.current < resultsLengthRef.current) {
						e.preventDefault();
						// Get the href from results using current activeIndex
						const normalizedQ = queryRef.current.trim();
						if (normalizedQ) {
							const currentResults = miniSearch.search(normalizedQ).slice(0, 8);
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
	}, [miniSearch, selectTool]);

	// Global Cmd+K / Ctrl+K shortcut to focus search
	useEffect(() => {
		function handleGlobalKeyDown(e: KeyboardEvent) {
			if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
				e.preventDefault();
				inputRef.current?.focus();
				inputRef.current?.select();
			}
		}

		document.addEventListener('keydown', handleGlobalKeyDown);
		return () => document.removeEventListener('keydown', handleGlobalKeyDown);
	}, []);

	// Detect Mac for shortcut display
	const isMac = typeof navigator !== 'undefined' && (navigator.platform?.includes('Mac') || navigator.userAgentData?.platform === 'macOS');
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
					onFocus={() => setIsFocused(true)}
					onBlur={() => setTimeout(() => setIsFocused(false), 150)}
					placeholder={variant === 'hero' ? `搜索工具（${shortcutHint}）` : '搜索工具...'}
					aria-label="搜索工具"
					aria-expanded={showResults && results.length > 0}
					aria-controls={listId}
					aria-activedescendant={activeId}
					role="combobox"
					autoComplete="off"
				/>
				{!query ? <kbd className="tool-search__shortcut">{shortcutHint}</kbd> : null}
			</label>
			{showResults ? (
				<div ref={resultsRef} className="tool-search__results" id={listId} role="listbox">
					{results.length > 0 ? results.map((result, index) => (
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
