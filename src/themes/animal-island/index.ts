import 'animal-island-ui/style';
import './styles.css';
import type { ThemeComponents } from '../types';

import Button from './components/Button';
import ToolSidebar from './components/ToolSidebar';
import ToolSearch from './components/ToolSearch';
import ThemeSelector from '../../components/shared/ui/ThemeSelector';

export default {
	Button,
	ToolSidebar,
	ToolSearch,
	ThemeSelector,
} satisfies ThemeComponents;
