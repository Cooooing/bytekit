import 'animal-island-ui/style';
import './styles.css';
import type { ThemeComponents } from '../types';

import Button from './components/Button';
import Badge from './components/Badge';
import CopyRow from './components/CopyRow';
import ReferencePanel from './components/ReferencePanel';
import CodeEditor from './components/CodeEditor';
import IoWorkbench from './layouts/IoWorkbench';
import GeneratorPanel from './layouts/GeneratorPanel';
import ToolSidebar from './components/ToolSidebar';
import ToolSearch from './components/ToolSearch';
import ThemeSelector from './components/ThemeSelector';

export default {
	Button,
	Badge,
	CopyRow,
	ReferencePanel,
	CodeEditor,
	IoWorkbench,
	GeneratorPanel,
	ToolSidebar,
	ToolSearch,
	ThemeSelector,
} satisfies ThemeComponents;
