# Nova preset b2fA — current visual baseline

Confirmed by the user on 13 November 2026: make the whole application look like [shadcn preset b2fA](https://ui.shadcn.com/create?preset=b2fA). This supersedes the generic stock approximation and earlier Studio palettes as the current appearance target.

## Observed configuration

| Setting | Preset value |
| --- | --- |
| Style | Nova |
| Base color / Theme / Chart color | Neutral / Neutral / Neutral |
| Font / Heading font | Geist / Geist |
| Icons | Lucide |
| Radius | Default, 0.625rem (10 px at 16 px root) |
| Menu | Default / Solid |
| Menu accent | Subtle |

The live preset's exported theme tokens are captured unchanged in mockups/preset-b2fA-source.css. mockups/preset-b2fA.css namespaces those tokens to avoid colliding with the older prototype's variable names and maps them to all shared surfaces. mockups/preset-b2fA.json records provenance and measured component dimensions. mockups/design-tokens.json now represents the current theme; design-tokens-legacy.json preserves the earlier values as history.

## Applied mockup treatment

Geist Latin and Latin Extended variable fonts are self-hosted with their SIL Open Font License; the browser does not contact Google Fonts. Colors use the exported light/dark OKLCH values. Dark pages use background 0.145 and card surfaces 0.205 rather than making cards indistinguishable from the canvas. Cards use 14 px corners; default desktop buttons and selects use 32 px height and 10 px corners. Tabs use the Nova muted container and rounded selected state. Navigation, tables, filters, research forms, registry/notice panels, dialogs, menus, plan/team/settings pages, feedback states and image/map controls share the theme. Touch/coarse-pointer targets remain at least 44 px. Original notice text is not restyled into a translation or rewritten.

The current prototype remains offline HTML/CSS/JavaScript: this is a visual implementation of the requested preset, not installation of official React components. Production must use official shadcn components matching the pinned Nova preset rather than recreating generic primitives. The preview currently defaults to Base UI, but a visual-preset request does not by itself change the previously approved Radix foundation. Any required primitive-library change remains a separate user decision. No dependency switch is made here.

## Behaviors and pending exception

Retain server-pagination requirements (simulated locally), selectable sizes, multi-sort and per-user visible columns. Resizing, persisted widths and forced single-line truncation stay deferred. Category navigation, bilingual labels, item tabs and role boundaries remain in effect. Colored tags remain meaningful data, not a return to a colored page palette. The existing check-free tag picker remains the pending interaction exception; the standard alternative still awaits a decision. This preset approval does not silently authorize checkmarks or replace that interaction.

## Verification

Prototype regression checks passed: 1,212. Browser review covered Properties, Vehicles, Other, Tags, organization settings, plans, team, alerts, overview, filters, saved-filter dialog and property detail tabs. Verified local Geist loaded; an ordinary desktop button measured 32 px with 10 px radius. Dark body/card computed colors match exported values. At 390 × 844, document width remained 390 px and the 760 px table scrolled inside a 356 px container. Temporary viewport override reset. This is visual/DOM review, not a WCAG certification or production test.

- [Desktop light preview](../qa/nova-desktop-light.png)
- [Desktop dark preview](../qa/nova-desktop-dark.png)
- [Item detail dark preview](../qa/nova-item-dark.png)
- [Mobile dark preview](../qa/nova-mobile-dark.png)

## Source

[Official preset configuration and live preview](https://ui.shadcn.com/create?preset=b2fA), inspected 13 November 2026. The reference's sample financial/music content is not part of this auction app. No example auction data or legal claims were imported from that preview.


## React preview delivered — 13 November 2026

The current preferred preview is the real Next.js app in [frontend](../../frontend/README.md), using official shadcn Radix Nova components and actual Table grids. The original offline HTML remains a reference. See [React implementation, verification and limits](16-react-preview.md). Server-side fixture pagination/filtering/sorting is now implemented in Next Route Handlers; production Spring/PostgreSQL and tenant authorization remain future work. The user approved the stock Popover/Toggle tag-picker composition with colored tags and no checkmarks. Browser persistence is a simulation, not an authorization boundary. Earlier pending tag-picker/vanilla-only statements are superseded.
