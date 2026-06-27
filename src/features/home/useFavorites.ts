import { useEffect, useState } from 'react';

const FAVORITES_KEY = 'bytekit:favorites:v1';

function readFavorites() {
	if (typeof window === 'undefined') return [];

	try {
		const rawValue = window.localStorage.getItem(FAVORITES_KEY);
		const parsedValue = rawValue ? JSON.parse(rawValue) : [];
		return Array.isArray(parsedValue) ? parsedValue.filter((item): item is string => typeof item === 'string') : [];
	} catch {
		return [];
	}
}

export function useFavorites() {
	const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

	useEffect(() => {
		setFavoriteIds(readFavorites());
	}, []);

	useEffect(() => {
		window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(favoriteIds));
	}, [favoriteIds]);

	function toggleFavorite(toolId: string) {
		setFavoriteIds((currentIds) => {
			if (currentIds.includes(toolId)) {
				return currentIds.filter((id) => id !== toolId);
			}

			return [...currentIds, toolId];
		});
	}

	return {
		favoriteIds,
		isFavorite: (toolId: string) => favoriteIds.includes(toolId),
		toggleFavorite,
	};
}
