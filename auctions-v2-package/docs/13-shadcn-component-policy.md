# shadcn/ui component coverage and customization decisions

Status: shadcn/ui-first policy confirmed by the user on 12 November 2026. The adaptations below are historical proposals; see the user decisions at the end for their current status. No React application is currently installed in this repository; the preview remains the offline prototype.

## Scope and priority

Use official shadcn/ui source-owned components with the previously approved Radix foundation for all applicable UI. Application screens compose these components instead of creating competing buttons, menus, inputs, tables or modal systems. Keep lucide-react icons, Clerk authentication, Leaflet maps, next-intl, next-themes and react-hook-form/Zod. shadcn/ui does not replace those services or domain logic.

Default supported props and variants, translated labels, data binding and normal layout composition do not require repeated approval. Ask before changing a component's styling, interaction or implementation to retain a previous look or behavior. A new custom component where no suitable official component exists also requires a concrete proposal. Record the affected component, default behavior/look, requested difference, reason, accessibility impact and user's decision. No response means pending, not approved. Do not migrate an affected feature while its decision is pending. Do not apply a blanket approval to later unrelated customizations.

## Coverage across the application

| UI surface | Official components to use | Application responsibility / approval boundary |
| --- | --- | --- |
| Desktop shell and mobile navigation | Sidebar, Sheet, Separator, Button, Tooltip | Existing routes, category navigation and role visibility; bespoke Studio rail styling pending |
| Page panels and information sections | Card, Separator, Breadcrumb | Content hierarchy and responsive composition |
| Toolbar and row actions | Button with supported ghost/icon variants, Tooltip | Lucide icons and accessible translated names; retain untitled controls column |
| Item listings and Tags list | Table, Button, Badge, Dropdown Menu, Pagination, Select | New domain grid controller; compact/resizing adaptations pending; Tags omits pagination, filters and column selector |
| Column visibility and sorting menus | Dropdown Menu and its supported item types | Saved user preferences and server-side multi-sort; no new table engine automatically introduced |
| Filter editor and saved filter controls | Card, Field, Input, Select, Button, Separator, Dialog | AND/OR groups, validation and user-owned saved definitions remain app logic |
| Item tabs | Tabs | Underline appearance pending; category-specific tabs unchanged |
| General information and research forms | Field, Label, Input, Textarea, Select, Button | react-hook-form/Zod; exact money validation; specialized field wrappers require review if needed |
| Dates | Input; Calendar/Popover where a picker is needed | Locale/timezone conversion stays app logic; no unreviewed picker behavior change |
| Item tags and assignment popup | Badge, Popover, Scroll Area, Toggle Group/Toggle | Colored check-free multi-selection and selected-state appearance pending |
| Tag CRUD | Table, Input, Select, Button, Alert Dialog | Inline edit/delete, create form, permissions; no active field |
| Organization/users/settings | Card, Field, Input, Select, Switch, Button, Dialog, Alert Dialog | ADMIN/MANAGER/USER authorization; Clerk membership services |
| System operations and extraction review | Same form primitives, Table, Alert, Alert Dialog | SYSADMIN enforcement, source evidence, audited operations |
| Saved filters, alerts and subscription plans | Card, Switch, Button, Dialog, Alert Dialog | User ownership versus organization billing; no invented payment functionality |
| Source notice and registry information | Card, Separator, Scroll Area, Alert | Original text and evidence preserved; registry integration availability explicit |
| Images and attachment actions | Card, Aspect Ratio, Input, Button, Dialog | File validation and uploads; proposed image viewer composed from Dialog, no custom lightbox without review |
| Map container and controls | Card, Button, Tooltip, Sheet as applicable | Leaflet/react-leaflet renders geography; no fake shadcn map replacement |
| Loading, empty and error states | Skeleton, Spinner, Empty, Alert, Button | Honest application status and retry logic |
| Toasts | Sonner | Localized feedback and accessible announcements |
| Theme/language controls | Dropdown Menu, Select, Radio Group as appropriate | Light/dark/system and locale state; existing palette styling pending |
| Authentication and profile | Clerk UI | Keep Clerk-supported auth UI; compose shell with shadcn; do not rebuild security-sensitive auth forms |

## Original customization proposals — superseded by decisions below

### C-SH01 — Compact data grids

Start with shadcn Table, Button, Dropdown Menu, Select and Pagination. Add the application's existing grid controller (not a new grid library): server-side pagination, selectable page size, multi-sort, persisted column selection and widths. Proposed adaptations: 36 px desktop data/header cells, 32 px row controls, darker header background, single-line ellipsis, action column fitting its icons, invisible boundary resize targets with keyboard support and reset. Coarse-pointer targets remain 44 px and cells 48 px. Tags keeps its fixed-column/no-filter/no-pagination exceptions. Official Table alone does not supply this domain behavior. Do not substitute the Resizable panel component for table-column sizing or silently install TanStack Table based on the Data Table recipe.

Decision needed: approve these Table-based adaptations, or use default shadcn table presentation and discuss which prior grid requirements should change.

### C-SH02 — Colored tag picker

Start with Popover, Scroll Area, Toggle Group/Toggle and Badge. Proposed adaptation: wrap the multiple-select choices as colored tag buttons, no checkmarks/checkboxes, no dark selected border, subtle selected background, immediate persistence and no Apply/Assign Tags action. Preserve focus, accessible selected state and keyboard operation. Multiple colored badges remain truncated in the item row and clickable in the item header.

Decision needed: approve this composition and styling, or review a standard shadcn multi-select presentation before changing the existing requirements.

### C-SH03 — Studio styling and item tabs

Use official components for panels, navigation and controls, with shared Studio/Studio Warm Blue colors and neutral navigation. Proposed adaptations: existing palette tokens and compact spacing, plus underline Tabs instead of filled button-like tabs wherever that requires a local variant. Preserve light/dark/system behavior, selected/focus contrast and reduced-motion preferences. Prefer any suitable built-in variant available in the pinned release before introducing a local variant.

Decision needed: approve these visual adaptations, or adopt the stock shadcn appearance and decide which earlier Studio details to retire.

## Implementation sequence and acceptance

1. Resolve the above three decisions. Keep unapproved visual/behavior differences documented.
2. Initialize the React/Next frontend with compatible pinned versions and official shadcn components; verify the chosen release's supported variants. Retain the approved Radix basis instead of silently switching primitive libraries.
3. Implement shell, controls, dialogs and form primitives first, followed by shared grids, filters, item tabs, tags, images, organization/system screens and feedback states.
4. For each control, verify official component usage or an explicitly documented exception. Reject duplicate custom primitives in review. Verify keyboard/focus behavior, dialogs, translated labels, responsive density and theme contrast.
5. Run domain regression checks for pagination/sorting/filter ownership, tag behavior, item tabs, permissions and source immutability. Do not describe the old prototype's passing tests as React migration validation.

No runtime migration or new library installation is performed by this document. A future implementation must not claim shadcn usage based solely on look-alike HTML/CSS.

## Official references

- [Component catalog](https://ui.shadcn.com/docs/components)
- [Radix Table](https://ui.shadcn.com/docs/components/radix/table)
- [Radix Tabs](https://ui.shadcn.com/docs/components/radix/tabs)
- [Radix Toggle Group](https://ui.shadcn.com/docs/components/radix/toggle-group)

Documentation checked 12 November 2026. Verify APIs/variants against the pinned implementation release.


## User decisions — stock appearance, 12 November 2026

This section supersedes the earlier pending visual proposals.

- C-SH01: use stock shadcn table appearance. Custom compact density and darker headers are not approved. Review the application behaviors separately; choosing stock appearance does not remove server pagination, saved columns or multi-sort by implication. Column resizing remains pending.
- C-SH02: show a standard tag-selection alternative before choosing. The colored custom Toggle/Popover proposal is not approved. Existing no-checkmark and colored-tag requirements are not silently revoked.
- C-SH03: use stock shadcn appearance across the app. Studio/Studio Warm Blue styling and a local underline-tabs variant are not the implementation baseline. Use the chosen official default component styles and tabs, with built-in light/dark/system support. Historical palette mockups remain references only.

See [standard component review](14-standard-component-review.md) for live official examples, behavior comparisons and remaining decisions. The current offline prototype still represents the earlier custom design; it is not evidence that stock React components have been installed. Changes to the runtime follow resolution of component conflicts and a separately verifiable frontend implementation.


## Confirmed stock-table behavior — 12 November 2026

Retain server-side pagination, selectable page sizes, multi-column sorting and user-saved visible columns using standard shadcn controls. Defer column-edge resizing, persisted widths and enforced single-line truncation for the first implementation. Default table layout may wrap content; do not impose the prior compact heights, darker header or ellipsis rules. These deferred adaptations remain backlog items requiring a later explicit decision, not first-release acceptance conditions. Ignore historical saved width preferences in the new stock frontend; visible-column preferences remain supported. Tags keeps its fixed columns and no filter/pagination/column selector. The existing custom offline prototype remains a historical behavior reference, not the migrated stock frontend. No tag-picker alternative has been approved yet.


## Stock-style interactive mockup update — 12 November 2026

The interactive HTML mockup now visually reflects the stock neutral shadcn direction. A separate mockups/stock.css layer updates the shell, panels, forms, buttons, menus, tables and tabs in light/dark/system modes. Legacy palette choices are removed from the current selector and old palette preferences are ignored. The old styles remain as source history, not the current default. Column resizing and saved-width application are removed; tables use natural wrapping rather than forced one-line ellipsis. All assigned list tags are displayed without an overflow count. Pagination, selectable page size, multi-sort and user-saved visible columns remain; pagination is still a local simulation. The existing colored tag picker is intentionally retained as a pending exception until a standard replacement is chosen.

This is a visual approximation in the existing HTML/CSS/JS prototype, not installation of official React components. It does not establish an exact version-pinned shadcn implementation. This supersedes earlier statements that the current mockup remains unchanged or purely historical. The source-owned React component migration is still future implementation work.


## Current appearance: Nova b2fA — 13 November 2026

The user selected the exact [shadcn b2fA preset](https://ui.shadcn.com/create?preset=b2fA): Nova, Neutral colors, Geist headings/body, Lucide, default 10 px base radius, default/solid menus and subtle menu accent. This now governs all app screens and supersedes previous generic-stock/Studio appearance guidance. The offline mockups apply the exported light/dark tokens with locally served Geist fonts. See [current visual specification](15-nova-preset.md). Existing approved grid behaviors and deferred resizing/widths/truncation remain unchanged. The check-free colored tag picker remains pending replacement, and Radix remains the specified frontend primitive foundation; no React dependency migration is claimed.


## React preview delivered — 13 November 2026

The current preferred preview is the real Next.js app in [frontend](../../frontend/README.md), using official shadcn Radix Nova components and actual Table grids. The original offline HTML remains a reference. See [React implementation, verification and limits](16-react-preview.md). Server-side fixture pagination/filtering/sorting is now implemented in Next Route Handlers; production Spring/PostgreSQL and tenant authorization remain future work. The user approved the stock Popover/Toggle tag-picker composition with colored tags and no checkmarks. Browser persistence is a simulation, not an authorization boundary. Earlier pending tag-picker/vanilla-only statements are superseded.
