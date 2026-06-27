import { Star } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useFavorites } from './useFavorites';
import { getToolsByCategory, toolCategories, tools, type ToolCategoryId, type ToolDefinition } from '@features/tools/core/registry';

type ActiveTab = 'all' | 'favorites' | ToolCategoryId;

const TEXT = {
	tabsLabel: '工具分类标签',
	all: '全部',
	favorites: '收藏',
	favoriteSection: '收藏',
	toolCountSuffix: '个工具',
	emptyFavorites: '暂无收藏工具',
};

function getVisibleSections(activeTab: ActiveTab, favoriteIds: string[]) {
	if (activeTab === 'favorites') {
		const favoriteTools = tools.filter((tool) => favoriteIds.includes(tool.id));
		return favoriteTools.length > 0 ? [{ id: 'favorites', name: TEXT.favoriteSection, tools: favoriteTools }] : [];
	}

	return toolCategories
		.map((category) => {
			const categoryTools = getToolsByCategory(category.id);
			const visibleTools = activeTab === 'all' ? categoryTools : categoryTools.filter((tool) => tool.category === activeTab);

			return { id: category.id, name: category.name, tools: visibleTools };
		})
		.filter((section) => section.tools.length > 0);
}

function FavoriteButton({ active, toolName, onClick }: { active: boolean; toolName: string; onClick: () => void }) {
	const buttonClassName = active
		? 'home-tool-card__favorite-button home-tool-card__favorite-button--active'
		: 'home-tool-card__favorite-button';
	const label = (active ? '取消收藏 ' : '收藏 ') + toolName;

	return (
		<button className={buttonClassName} type="button" onClick={onClick} aria-pressed={active} aria-label={label}>
			<Star size={17} strokeWidth={1.9} aria-hidden="true" />
		</button>
	);
}

function ToolCard({ tool, isFavorite, onToggleFavorite }: { tool: ToolDefinition; isFavorite: boolean; onToggleFavorite: () => void }) {
	return (
		<article className="home-tool-card">
			<FavoriteButton active={isFavorite} toolName={tool.name} onClick={onToggleFavorite} />
			<a className="home-tool-card__link" href={tool.href}>
				<h3 className="home-tool-card__name">{tool.name}</h3>
				<p className="home-tool-card__desc">{tool.description}</p>
			</a>
		</article>
	);
}

export default function HomeToolCatalog() {
	const [activeTab, setActiveTab] = useState<ActiveTab>('all');
	const { favoriteIds, isFavorite, toggleFavorite } = useFavorites();
	const sections = useMemo(() => getVisibleSections(activeTab, favoriteIds), [activeTab, favoriteIds]);

	return (
		<div className="home-catalog">
			<nav className="home-tabs" aria-label={TEXT.tabsLabel}>
				<button className={activeTab === 'all' ? 'home-tabs__item home-tabs__item--active' : 'home-tabs__item'} type="button" onClick={() => setActiveTab('all')}>
					{TEXT.all}
				</button>
				<button className={activeTab === 'favorites' ? 'home-tabs__item home-tabs__item--active' : 'home-tabs__item'} type="button" onClick={() => setActiveTab('favorites')}>
					<Star size={15} strokeWidth={2} aria-hidden="true" />
					{TEXT.favorites}
				</button>
				{toolCategories.map((category) => (
					<button
						key={category.id}
						className={activeTab === category.id ? 'home-tabs__item home-tabs__item--active' : 'home-tabs__item'}
						type="button"
						onClick={() => setActiveTab(category.id)}
					>
						{category.name}
					</button>
				))}
			</nav>

			{sections.length > 0 ? (
				<div id="tools" className="home-tool-sections">
					{sections.map((section) => {
						const headingId = 'category-' + section.id;

						return (
							<section id={section.id} className="home-tool-section" aria-labelledby={headingId} key={section.id}>
								<header className="home-tool-section__head">
									<h2 id={headingId} className="home-tool-section__title">{section.name}</h2>
									<span className="home-tool-section__count">{section.tools.length} {TEXT.toolCountSuffix}</span>
								</header>
								<div className="home-tool-grid">
									{section.tools.map((tool) => (
										<ToolCard
											key={tool.id}
											tool={tool}
											isFavorite={isFavorite(tool.id)}
											onToggleFavorite={() => toggleFavorite(tool.id)}
										/>
									))}
								</div>
							</section>
						);
					})}
				</div>
			) : (
				<div className="home-empty-state">{TEXT.emptyFavorites}</div>
			)}
		</div>
	);
}
