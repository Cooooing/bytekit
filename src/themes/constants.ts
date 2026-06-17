// ── Theme persistence constants ──

/** localStorage key for the component theme ID (e.g. 'default', 'animal-island'). Used by ThemeManager and ThemeSelector. */
export const THEME_KEY = 'bytekit-theme-id';

/**
 * localStorage key for the visual light/dark mode toggle.
 * This is separate from THEME_KEY — THEME_KEY controls which component set
 * is loaded (default vs animal-island), while THEME_KEY_VISUAL controls
 * light vs dark appearance within that component set.
 * Managed by ThemeToggle (src/components/shell/ThemeToggle.tsx).
 */
export const THEME_KEY_VISUAL = 'bytekit-theme';

/** Read the persisted component theme ID, returning 'default' on server or when unavailable. */
export function readThemeId(): string {
	if (typeof window === 'undefined') return 'default';
	try {
		return localStorage.getItem(THEME_KEY) || 'default';
	} catch {
		return 'default';
	}
}
