# Bytekit UI/UX Design System

## Product Direction

Bytekit is a developer tool workspace. The interface must optimize direct work: input, operation, output, state, and repeat use. It must not look like a marketing landing page.

Design keywords:

- Precise: clear boundaries, predictable controls, readable states.
- Calm: low saturation, no decorative gradients, no visual noise.
- Dense but usable: compact spacing, stable toolbars, no crowded text.
- Extensible: themes and components must be reusable for future tools.

## Theme Architecture

Theme files:

```text
src/styles/themes/base.css
src/styles/themes/light.css
src/styles/themes/dark.css
```

Theme application:

```html
<html data-theme="light">
<html data-theme="dark">
```

Default behavior:

- First visit follows `prefers-color-scheme`.
- Manual toggle writes `localStorage("bytekit-theme")`.
- Future themes are added by new theme CSS files and `html[data-theme="..."]` blocks.

## Responsive Tokens

Layout and component sizes must use semantic tokens, not fixed pixel widths.

Important tokens:

```css
--size-page-max: 72rem;
--size-action-rail: clamp(9rem, 14vw, 13rem);
--editor-height-default: clamp(18rem, 46vh, 34rem);
--editor-height-compact: clamp(8rem, 22vh, 14rem);
--layout-page-inline: clamp(0.875rem, 2vw, 1.25rem);
--layout-grid-gap: clamp(0.75rem, 1.5vw, 1rem);
--layout-panel-padding: clamp(0.75rem, 1.2vw, 1rem);
```

Rules:

- Use `rem`, `clamp()`, `minmax()`, `%`, and `fr` for layout.
- Border width may remain `1px`.
- Editor height uses tokens, not hard-coded numbers.
- The action rail uses `--size-action-rail`.

## Color System

Semantic variables:

```css
--surface-page
--surface-panel
--surface-panel-muted
--surface-hover
--border-subtle
--border-strong
--text-primary
--text-secondary
--text-tertiary
--accent-primary
--accent-primary-hover
--accent-primary-soft
--semantic-danger
--semantic-danger-soft
--semantic-warning
--semantic-warning-soft
--semantic-info
--semantic-info-soft
--code-surface
--code-gutter
--code-border
--code-active-line
```

Light theme direction:

- Page: low-saturation gray green.
- Panel: white.
- Accent: teal green.
- Code editor: near-white surface and subtle gutter.

Dark theme direction:

- Page: deep green-gray, not pure black.
- Panel: slightly raised dark surface.
- Accent: bright teal for visibility.
- Code editor: dark green-gray with clear gutter and active line.

## Internal Component Library

Use internal components. Do not introduce an external UI library for normal controls.

Components:

```text
src/components/ui/Button.tsx
src/components/ui/Badge.tsx
src/components/ui/Panel.astro
src/components/layout/ToolWorkspace.astro
src/components/layout/ToolActions.astro
src/components/editor/CodeEditor.tsx
```

Button variants:

```ts
type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md";
```

Badge tones:

```ts
type BadgeTone = "neutral" | "success" | "danger" | "warning" | "info";
```

## Tool Layouts

Input-output tools use three blocks:

```text
Input editor | Action rail | Output editor
```

Affected tools:

- JSON
- JWT
- Base64

Password generator is single-column:

```text
Configuration panel
Generate action
Compact output editor
```

## CodeEditor Rules

CodeEditor must provide:

- Editable input and output.
- CodeMirror line numbers.
- Fold gutter where language supports it.
- Syntax highlighting.
- Copy, paste, clear actions.
- Status badge.
- Error message area.

Height values:

- `default`: `--editor-height-default`.
- `compact`: `--editor-height-compact`.
- Custom values must be CSS length strings.

## Responsive Rules

Desktop:

- Max content width: `--size-page-max`.
- Home tool grid: 4 columns.
- Input-output tools: 3 columns.

Tablet and mobile:

- At `64rem`, input-output tools become one column.
- Order remains input, actions, output.
- Header navigation can scroll horizontally.
- Editor toolbars may wrap but must not overlap.

## Acceptance Criteria

- `npm.cmd run build` passes.
- Light and dark themes are readable.
- Theme toggle persists choice.
- JSON, JWT, Base64 keep three-block workflow.
- Password remains single-column.
- API routes and Cloudflare bindings are unchanged.
