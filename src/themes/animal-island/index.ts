import 'animal-island-ui/style';
import './styles.css';
import type { ThemeComponents } from '../types';

import Button from './components/Button';
import AppShell from './components/AppShell';
import ToolSidebar from './components/ToolSidebar';
import ToolSearch from './components/ToolSearch';
import ThemeSelector from './components/ThemeSelector';

export default {
	Button,
	AppShell,
	ToolSidebar,
	ToolSearch,
	ThemeSelector,
} satisfies ThemeComponents;
