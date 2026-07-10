import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import { preloadToolComponent } from '../core/components';
import { getToolHref } from '../core/registry';
import type { ToolDefinition } from '../core/types';

type ToolLinkProps = Omit<ComponentPropsWithoutRef<'a'>, 'href'> & {
	tool: ToolDefinition;
};

const ToolLink = forwardRef<HTMLAnchorElement, ToolLinkProps>(function ToolLink({ tool, onFocus, onMouseEnter, ...props }, ref) {
	return (
		<a
			{...props}
			ref={ref}
			href={getToolHref(tool)}
			data-astro-prefetch="hover"
			onFocus={(event) => {
				preloadToolComponent(tool.id);
				onFocus?.(event);
			}}
			onMouseEnter={(event) => {
				preloadToolComponent(tool.id);
				onMouseEnter?.(event);
			}}
		/>
	);
});

export default ToolLink;
