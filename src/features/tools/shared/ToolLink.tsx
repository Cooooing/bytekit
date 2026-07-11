import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import { preloadToolResources } from '../core/components';
import { getToolHref } from '../core/registry';
import { allowsPassivePreload } from '../core/preload-policy';
import type { ToolDefinition } from '../core/types';

type ToolLinkProps = Omit<ComponentPropsWithoutRef<'a'>, 'href'> & {
	tool: ToolDefinition;
};

const ToolLink = forwardRef<HTMLAnchorElement, ToolLinkProps>(function ToolLink({ tool, onFocus, onMouseEnter, onPointerDown, onTouchStart, ...props }, ref) {
	const canPassivelyPreload = typeof navigator !== 'undefined' && allowsPassivePreload(navigator.connection);
	const preload = () => preloadToolResources(tool.id);

	return (
		<a
			{...props}
			ref={ref}
			href={getToolHref(tool)}
			data-astro-prefetch={canPassivelyPreload ? 'hover' : undefined}
			onFocus={(event) => {
				if (canPassivelyPreload) preload();
				onFocus?.(event);
			}}
			onMouseEnter={(event) => {
				if (canPassivelyPreload) preload();
				onMouseEnter?.(event);
			}}
			onPointerDown={(event) => {
				preload();
				onPointerDown?.(event);
			}}
			onTouchStart={(event) => {
				preload();
				onTouchStart?.(event);
			}}
		/>
	);
});

export default ToolLink;
