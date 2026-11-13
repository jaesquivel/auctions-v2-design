# Standard shadcn component review

## Confirmed direction

Use stock shadcn appearance for the app and tables. Retain light/dark/system mode. Do not apply Studio colors, compact density, darkened table headers or a local underline-tabs variant. Earlier previews remain historical references, not the stock implementation. Standard appearance does not itself remove functional requirements.

## Standard tag alternative to try

[Open the official Multiple combobox live example](https://ui.shadcn.com/docs/components/radix/combobox#multiple).

The official example allows selecting several values and presents them as removable chips in an input with a dropdown. Try selecting several items, typing to narrow the choices, removing a chip, and navigating by keyboard. Framework names in the official demo stand in for tag names; they are not auction data. Filtering this choice list is local tag lookup, not a new auction search feature.

[See the official multiple-selection composition and source](https://ui.shadcn.com/docs/components/radix/combobox#multiple-selection).

| Aspect | Previous item-tag picker | Standard combobox alternative |
| --- | --- | --- |
| Trigger | Click the displayed tags or empty tag area | Chips/input control with dropdown |
| Selected values | Colored labels | Default neutral removable chips |
| Many choices | Scrollable list | Type to narrow the options and scroll |
| Selection feedback | Colored pressed buttons, no checkmarks | Official default item selection indicators and chip styling; inspect in live example |
| Applying changes | Immediate | Can bind value changes immediately; saving remains application logic |
| Extra Apply button | None | Not needed for controlled value changes |
| Tag colors | Required in existing design | Color treatment would need a separate approved adaptation |
| Relationship to item table | Tags remain first column | Table display/truncation still needs composition; combobox is an editor, not the whole cell |

The standard alternative is presented for review, not adopted yet. In particular, neutral chips and default selection indicators may conflict with the previous colored/no-checkmark requirements. The official current combobox documentation links to a Base UI API even under its Radix URL. A demo URL is not approval to change the application's previously selected Radix foundation. Verify the pinned component's primitive dependency before installing it; propose any dependency change explicitly. A Radix Popover + Command composition is another possible implementation, but adding bespoke multi-selection or removing its indicators also requires review.

## Table appearance versus application behavior

[Open the official stock Table example](https://ui.shadcn.com/docs/components/radix/table).

Use its default surface, spacing, separators and typography. The standalone Table presents rows; it does not automatically implement application pagination, sorting or persistence. The official Data Table recipe is a separate composition; do not install another table engine merely to copy its look.

| Requirement | Proposed treatment with stock appearance | Decision status |
| --- | --- | --- |
| Server-side pagination and selectable page size | Stock Pagination/Select controls with server requests | Confirmed retained |
| Multi-column sorting | Stock Button/Dropdown Menu controls; sorting sent to backend | Confirmed retained |
| Per-user visible columns | Stock Dropdown Menu selection; saved per user | Confirmed retained |
| Tags grid exceptions | Fixed columns, no filter/pagination/column selector | Retain; no new appearance override needed |
| Untitled actions column and ghost icon buttons | Use standard supported Button variants and table composition | Retain |
| Single-line records and tag truncation | Needs layout constraints beyond default table content | Deferred for first implementation |
| Column-edge resizing and saved widths | Custom behavior, resize hit areas and width state | Deferred for first implementation |
| 36 px rows/headers and darkened header | Replaced by stock component presentation | Custom appearance declined |

Confirmed first implementation: stock appearance plus existing domain behaviors for server pagination/page sizes, multi-sort and saved visible columns. Resizing, persisted widths and enforced one-line/truncation styling are deferred by the user for the first implementation. Do not remove those earlier requirements from the product backlog.

## Tabs and theme

[Open the official Tabs example](https://ui.shadcn.com/docs/components/radix/tabs).

Use the standard appearance provided by the pinned component, including its default selected-state treatment. A bespoke underline variant and Studio palettes are not approved. Item tab order, bilingual labels and Properties-only Location remain unchanged.

## Verification and implementation boundary

These are official live React examples, not look-alike components recreated in the offline prototype. No runtime migration is claimed. The design package records the confirmed stock direction and the remaining tag-picker decision. Before implementation, select a pinned compatible official release and record its default style/primitive basis. Verify the installed components visually and with keyboard tests. Source notice text, role authorization and all unrelated data requirements remain unchanged.


## Confirmed stock-table behavior — 12 November 2026

Retain server-side pagination, selectable page sizes, multi-column sorting and user-saved visible columns using standard shadcn controls. Defer column-edge resizing, persisted widths and enforced single-line truncation for the first implementation. Default table layout may wrap content; do not impose the prior compact heights, darker header or ellipsis rules. These deferred adaptations remain backlog items requiring a later explicit decision, not first-release acceptance conditions. Ignore historical saved width preferences in the new stock frontend; visible-column preferences remain supported. Tags keeps its fixed columns and no filter/pagination/column selector. The existing custom offline prototype remains a historical behavior reference, not the migrated stock frontend. No tag-picker alternative has been approved yet.


## Stock-style interactive mockup update — 12 November 2026

The interactive HTML mockup now visually reflects the stock neutral shadcn direction. A separate mockups/stock.css layer updates the shell, panels, forms, buttons, menus, tables and tabs in light/dark/system modes. Legacy palette choices are removed from the current selector and old palette preferences are ignored. The old styles remain as source history, not the current default. Column resizing and saved-width application are removed; tables use natural wrapping rather than forced one-line ellipsis. All assigned list tags are displayed without an overflow count. Pagination, selectable page size, multi-sort and user-saved visible columns remain; pagination is still a local simulation. The existing colored tag picker is intentionally retained as a pending exception until a standard replacement is chosen.

This is a visual approximation in the existing HTML/CSS/JS prototype, not installation of official React components. It does not establish an exact version-pinned shadcn implementation. This supersedes earlier statements that the current mockup remains unchanged or purely historical. The source-owned React component migration is still future implementation work.


## Current appearance: Nova b2fA — 13 November 2026

The user selected the exact [shadcn b2fA preset](https://ui.shadcn.com/create?preset=b2fA): Nova, Neutral colors, Geist headings/body, Lucide, default 10 px base radius, default/solid menus and subtle menu accent. This now governs all app screens and supersedes previous generic-stock/Studio appearance guidance. The offline mockups apply the exported light/dark tokens with locally served Geist fonts. See [current visual specification](15-nova-preset.md). Existing approved grid behaviors and deferred resizing/widths/truncation remain unchanged. The check-free colored tag picker remains pending replacement, and Radix remains the specified frontend primitive foundation; no React dependency migration is claimed.


## React preview delivered — 13 November 2026

The current preferred preview is the real Next.js app in [frontend](../../frontend/README.md), using official shadcn Radix Nova components and actual Table grids. The original offline HTML remains a reference. See [React implementation, verification and limits](16-react-preview.md). Server-side fixture pagination/filtering/sorting is now implemented in Next Route Handlers; production Spring/PostgreSQL and tenant authorization remain future work. The user approved the stock Popover/Toggle tag-picker composition with colored tags and no checkmarks. Browser persistence is a simulation, not an authorization boundary. Earlier pending tag-picker/vanilla-only statements are superseded.
