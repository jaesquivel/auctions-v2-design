# UX and UI design system

## Design intent

Use a calm research workspace with a deep green navigation rail, warm neutral page background, white content surfaces and a restrained amber evidence warning. The user-selected logo direction is the supplied monochrome gavel reference. The editable vector execution, Auctions typography and existing green palette remain proposed design choices; the displayed name has no version suffix or badge. The interface gives source evidence the same prominence as the base amount. Display no investment return, “verified title,” or countdown implying confirmed availability.

## Foundations

| Token | Value | Use |
| --- | --- | --- |
| color.brand.900 | #123D34 | Navigation and primary text on light surfaces |
| color.brand.700 | #1D6553 | Primary action and active controls |
| color.brand.050 | #EAF3EF | Selected and positive neutral background |
| color.canvas | #F5F6F2 | Page background |
| color.surface | #FFFFFF | Content |
| color.ink | #172C26 | Primary text |
| color.muted | #53665F | Secondary text |
| color.border | #D4DDD7 | Dividers and input edges |
| color.warning.ink | #7A4500 | Warning text |
| color.warning.bg | #FFF3D9 | Warning surface |
| color.danger | #A72E31 | Destructive actions and errors |
| type.family | system-ui, -apple-system, Segoe UI, sans-serif | Offline and multilingual support |
| type.scale | 12, 14, 16, 20, 24, 32, 40 px | 16 px minimum inputs on mobile |
| space.scale | 4, 8, 12, 16, 24, 32, 48 px | Layout rhythm |
| radius | 8 px controls, 14 px panels, 24 px feature surface | Avoid decorative over-rounding |
| shadow | 0 10px 30px rgba(18,61,52,.06) | Sparse elevation |

Editable [design tokens](../mockups/design-tokens.json) are the canonical values. Map semantic tokens into Tailwind theme variables, keeping warning/error/selected semantics separate from color names. The prototype uses plain CSS with the same token values for portability; it is not an installed Tailwind or Next.js application.

## Organization context

Every workspace belongs to an organization, even for a solo user. Display an organization name and membership role, never a Personal workspace option. Show a switcher only for multiple memberships; one membership uses a read-only organization label. The solo organization uses the same controls and permission rules as a team. Auction tag definitions/assignments, optional annotations and billing use organization context. Saved searches and their alert preferences are user-owned; a context is used only for authorized execution.

## Notice terminology

Use Notice in English and aviso in Spanish product copy, with Notice/notice identifiers in the domain, API and database. Original ingested legal source text is preserved verbatim; product terminology does not rewrite source evidence.

## List and detail images

List cards/rows are text-first: type, location, published base, schedule, source quality, current organization tags and Assign tags action. Do not render images, thumbnails, hero placeholders or conceptual property artwork in listings. Item detail uses accessible Overview and Images tabs. The Images tab includes an empty state, labeled member file picker and attachment previews with attribution/visibility. Treat member uploads as supplementary material, not source evidence. Tab state is local to the item and preserves the selected item identity.

## No saved-item controls

Do not render heart/bookmark controls, Save auction buttons, Saved navigation or an equivalent hidden saved-item state. Place an Assign tags control directly on cards and detail pages, show current organization tag labels, and expose tag filtering in discovery. Saved-search controls remain distinct and are labeled Save filters; their ownership follows the user across organization switches.

## Role and tag controls

Display the exact identifiers ADMIN, MANAGER and USER in both languages. ADMIN sees full organization settings, users and operational tags. MANAGER sees operational controls such as available tags. USER settings management is unavailable; normal research and existing-tag assignment are proposed baseline permissions. A tag picker selects stable organization tag IDs and does not implicitly create free-text definitions.

## System administration surface

Use a separate System destination and clearly distinguish its SYSADMIN grant from organization role controls. The prototype has independent organization-role and system-role previews for review purposes. System settings show the fixed country read-only and offer only allowlisted controls. A SYSADMIN grant does not change the selected organization role. Operations and review actions require the system grant; role-specific access-denied states remain keyboard accessible.

## Country context

Country is instance configuration, not an interactive control. Show the configured country as read-only context where useful. No country dropdown, administrator setting or runtime switching flow is permitted. Locale and workspace selectors remain independent. Province and other locality filters apply only within the configured country.

## Layout and responsive behavior

Desktop at 1280–1600 px: 224 px rail, 72 px topbar, 32 px content padding, max content width 1440 px. Discovery uses a 256 px filter column and a two-column result grid; map uses a compact result rail and dominant map. At 768–1100 px the rail becomes compact navigation, filters move into a disclosure, and results use two columns only if each remains at least 280 px wide. Below 768 px the page becomes one column with a compact top navigation; asset facts wrap into two columns then one below 360 px. Detail actions remain in normal flow and never obscure content. Tables become labeled member cards where practical. The prototype supports 320 px upward, including 390 px mobile and 1440 px desktop review targets.

## Components and interaction contracts

| Component | Anatomy | Interaction and accessibility |
| --- | --- | --- |
| Asset card | Fictional identity, category, locality, base currency, next event, quality flag, save | Whole-card title is a link; save is a separate labeled button; no nested interactive controls |
| Filter | Persistent label, unit/currency, value, help/error | Explicit Apply commits draft; Reset clears all; mobile disclosure retains draft; fieldsets group related inputs |
| Evidence field | Label, normalized value, original text excerpt, source page, confidence and reviewer state | Source anchor is keyboard reachable; unreviewed value includes text warning |
| Status badge | Icon or label plus color | Never color alone; use “Reviewed extraction,” not “Verified property” |
| Money | ISO currency plus locale number | Decimal strings preserved in API; no float round trip; null shows “Not reported” |
| Event timeline | Ordinal, source-derived date and time, timezone, status and evidence | Show passed-date unknown outcome separately from concluded |
| Private tag | Workspace icon/text and tag | Visually distinct from public category; delete action has an accessible name |
| Toast | Status sentence, optional undo | role=status; no forced focus; keep errors near originating field as well |
| Dialog | Title, explanation, controls and close | Focus moves in, Escape closes, focus returns; native dialog preferred |
| Map pin | Price and precision label | Equivalent list available; keyboard selection; no exact pin for unknown location |

Loading skeletons are aria-hidden and accompanied by one status message. Empty states describe how to change filters. Source failures preserve available records and show last successful check. A 403 names the missing capability in plain language; a 404 avoids revealing another tenant’s private object. A conflict asks the reviewer to reload rather than silently overwriting work.

## Accessibility and content

Target WCAG 2.2 AA. Verify text contrast at 4.5:1 and large text at 3:1; active input edges and focus indicators need non-text contrast. Touch targets are at least 44 by 44 px in the proposed mobile design. Keep browser focus rings; respect reduced motion. Tab order follows reading order. Dialogs and menus have deterministic keyboard behavior. Original notice text is selectable and wraps; provide text alternatives to source PDFs when feasible. Screen-reader user testing and a formal accessibility audit remain implementation gates.

## Bilingual copy

Keep product messages in es.json and en.json; key names are stable and stored outside components. Locale affects UI, formatting and document language attributes, not identifiers or source language. Numbers use es-CR/en-CR presentation with explicit CRC/USD labels. Event display is America/Costa_Rica unless the jurisdiction adapter provides another zone; show timezone when a user’s zone differs. An English “notice” label may include “published auction notice” for comprehension.

| Key | Spanish | English |
| --- | --- | --- |
| discovery.title | Encuentre su próxima oportunidad | Find your next opportunity |
| money.base | Base publicada | Published base |
| evidence.reviewed | Extracción revisada | Reviewed extraction |
| evidence.pending | Requiere revisión | Needs review |
| location.approximate | Ubicación aproximada | Approximate location |
| data.missing | No indicado en la fuente | Not reported in source |
| source.stale | La fuente requiere una nueva consulta | Source needs a new check |
| date.passed | Fecha programada pasada; resultado desconocido | Scheduled date passed; outcome unknown |
| legal.notice | Consulte el aviso y el expediente antes de decidir | Consult the notice and case file before deciding |
| demo.banner | Demostración con datos ficticios | Demonstration with fictional data |

The interactive prototype covers its principal navigation, screens and controls in both languages. Spanish synthetic notice text remains Spanish in English mode and is explicitly labeled as original-language demonstration text. A production translation workflow requires professional review of source-related terminology.

## Primary auction listing navigation

Use Properties / Vehicles / Other (Propiedades / Vehículos / Otros) consistently as first-level destinations. The selected section has visible emphasis and aria-current, and its name is the page heading. Mobile keeps all three available without opening an administrative menu. Shared text-first rows show title, compatible subtype, reported location, published base, schedule, quality and organization tags; never show image thumbnails. Show property area only in Properties. Item detail, Notice and Images use shared components with category-appropriate copy. Do not use tag colors to identify categories.

## Reference-based gavel identity

Confirmed C18: base the system logo on the user-supplied monochrome gavel image. Use a single symbol with separated rounded head caps, a diagonal handle and a two-level block. The black/white split in the reference demonstrates contrast variants; it is not part of the logo. The supplied replacement SVG is used directly for the gavel paths; active logo variants are [previewable here](../brand/index.html), with [editable assets and usage guidance](../brand/README.md).

Use white on the dark desktop rail and documentation headers, black on the sign-in surface and mobile home link, and the green tile favicon in browser tabs. Keep a clear accessible Home name on navigation links; decorative symbol images have empty alt text when the accessible name or wordmark already identifies them. Home leads to the default Properties listing. Apply the same identity to Properties, Vehicles and Other; it has no category or legal-verification meaning. Proposed minimum UI mark size is 28 px, with a smaller browser favicon exception. Maintain proportions and clear space.

### Replacement SVG

The user-supplied replacement SVG supersedes the earlier hand-drawn approximation. Preserve its six right-hand gavel paths; adapt only scale, position and black/white fill. The original split-screen artwork is retained as [source SVG](../brand/source-gavel.svg); UI marks exclude its backgrounds and duplicate left mark. All existing logo placements now use this geometry.

## One filter surface

Remove the standalone search bar and Search button. Put all matching controls in the separate filter view, with Apply and view results as the submit action. Optional text/reference input uses a normal labeled filter field, not a hero search treatment. UI uses Save filters / Guardar filtros and My filters and alerts / Mis filtros y alertas. Saved definitions remain user-owned; the SavedSearch contract name is internal terminology, not a second discovery workflow.

## Group builder controls

Each group has a visible numbered legend, its own Combine terms selector, numbered term cards, Add term and Remove group. Terms have unique accessible Field, Condition and Value labels; money terms also have Currency. A separate Combine groups selector controls the outer expression. Use localized All (AND) / Any (OR) wording while retaining the operator abbreviation. No color-only distinction or implicit precedence. Keep field controls stacked on narrow layouts and let the page scroll. The applied expression summary remains separate from the editable draft. Removing a term can leave an empty group to correct or remove; Apply rejects it.

## Dedicated filter view

Use Open filters / Abrir filtros on every listing and map. Keep the listing focused on items and the applied summary. The filter screen has a clear title, category/organization context, Cancel and Save filters controls, the grouped form with Apply and view results, and My saved filters with Retrieve buttons. Desktop places editor and saved definitions side by side; mobile stacks them. Long expressions and titles wrap. The builder remains visible on mobile without a disclosure. Save and Retrieve controls belong to this screen rather than results. Save validates the draft; Retrieve loads a detached draft. Label these effects explicitly to avoid confusing saving with applying.

## Confirmed localized app name

Use Auctions in English and Remates in Spanish, with no v2 or other version suffix in the product name. Switch navigation/sign-in wordmarks, browser title, accessible Home label and footer together with locale. Spanish wordmark SVGs are remates-dark.svg and remates-light.svg; English variants retain auctions-dark.svg and auctions-light.svg. The same supplied gavel geometry is shared. Documentation/package revision numbers are separate from the product name.

## Pagination controls

Place a labeled Items per page selector, visible range, page count and Previous/Next navigation above the item rows. Use an accessible pagination navigation landmark and live range status. Disable unavailable boundary actions; zero results show No pages and range 0–0 of 0. Mobile stacks the size/range/navigation without horizontal overflow. Page-size values are numbers, not an unbounded All option. Controls are part of listing navigation, not the separate filter editor. Keep the applied-filter summary independent of page metadata.

## Item table and prioritized sorting

Confirmed: use column-based tables for auction listings and allow sorting on one or more values. Common columns are item/reference, reported location, subtype, published base, next event and organization tags; Properties also has area. No listing imagery is introduced. On mobile, the single-line table scrolls horizontally and the same sorting controls stay available.

Click a sortable column header for a primary ascending/descending sort. Add sort appends a priority; users can select its field/direction or remove it. Numbered header indicators show priority. Sort happens on the server before item pagination, with nulls last and item ID as the final deterministic tie-breaker. Changing sort resets page 1 and preserves size. Distinct fields only, maximum five priorities proposed. Amount ordering requires a single-currency scope; never compare raw CRC/USD amounts. Area is property-only. Sort is request/presentation state outside the saved expression; saving sort preferences with definitions remains unconfirmed.

GET item listing endpoints accept sort as a JSON array of {field,direction} in priority order. Backend validates allowlisted fields/directions, compatible category and single-currency scope and binds/allowlists ordering rather than interpolating user SQL. Counts are unaffected by sort. Cache/request identity includes sort. The offline adapter demonstrates sorting before slicing; actual server ordering and stable database pagination remain production integration gates.

Acceptance: verify multi-value precedence, both directions, equal values/ID ties, null placement, page reset, currency/category constraints, accessible header controls and mobile labels. Use the mockup Add sort control rather than requiring a keyboard modifier.

## Single-line item records

Confirmed: each auction record occupies one line. Reference and item title have separate columns; cell text never wraps. Tags and Notice buttons are grouped in the rightmost Actions column. Long titles/locations may ellipsize visually with full text available through the title attribute and item detail. No stacked reference, badges or inline notice links remain in the item cell. This supersedes compact multiline mobile rows: narrow screens scroll the table horizontally, retaining one-line records and a right-aligned action column. Sorting and server pagination behavior stay unchanged.

Verify row/cell heights, no wrapping, rightmost action placement, keyboard access to the scroll region and buttons, accessible column headers and no page-level horizontal overflow at 320–1440 px.

## Icon-only item controls

The rightmost untitled column contains Open item (eye), Tags (tag) and Notice (document) icon buttons. No visible Actions title or button text is shown. Each has a localized tooltip and accessible label including the record reference, a 44 px target and decorative SVG hidden from assistive technology. These UI icons are not auction imagery. All records stay on one line, including mobile horizontal scrolling. Verify all three actions, keyboard focus, localized labels and empty visible header.

## Colored organization tags in listings

Confirmed: assigned tags have colors and appear in the list view. Show their labels as colored badges in a Tags column before the untitled icon controls. Keep one-line records; multiple badges scroll horizontally within the cell, with keyboard focus and readable labels. Color never replaces label text or implies legal/verification status. Unassigned items show an em dash. Assignments and colors remain organization-scoped.

Proposed palette: gray, blue, green, amber, red and purple, with predefined readable foreground/background pairs and gray fallback. ADMIN/MANAGER choose the definition's color when creating or updating it; USER assigns existing definitions. A color change keeps the stable tag ID and updates all its badges, not filter matching or item identity. Tag DTO includes color; create defaults to gray, patch validates the allowlist and expected version. Existing definitions require a gray backfill in production. No migration/database execution is claimed.

## Multiple-tag truncation examples

The fictional first and second property rows each have two assigned organization tags. List badges stay on one line and truncate long labels with ellipses. Show at most two badges plus a +N count for further assignments; full labels remain in tooltips/accessibility text and the Tags dialog. This replaces scrolling inside the tag cell, without deleting or altering assignments.

## Frameless listing buttons

Item-table buttons have no border, fill or shadow. Icon actions keep their 44 px hit targets, localized tooltips and accessible labels. Hover changes icon color and keyboard focus retains a visible outline; that temporary focus indicator is distinct from a persistent button frame. Other application controls are unchanged.

## Theme preference

Confirmed choices: Light, Dark and System (default). A global theme selector is available in the app header; System follows the device color scheme, including changes while open. Proposed persistence is browser-local across reloads, independent of organization and saved filters. Dark surfaces, fields, tables, dialogs and text use theme tokens; tag palettes preserve readable label pairs. Focus outlines remain visible and listing icon buttons remain frameless. Verify explicit modes, reload persistence, System fallback, mobile wrapping and separate filter/editor views. Full accessibility/contrast audit remains a production acceptance gate.

## Color scheme exploration

Use the global Color scheme selector to compare Forest, Ocean, Slate and Terracotta. Each palette changes navigation, primary actions, selected surfaces and canvas colors and has light/dark token variants. Palette and appearance mode are independent browser-local preferences; System follows device appearance. Forest remains the existing default. These are exploratory design options, not a newly confirmed final brand palette. Semantic tag colors remain stable across schemes. Listing buttons remain frameless with visible focus outlines.

## Warm blue alternative

Added Warm blue / Azul cálido as a fifth exploratory palette. It uses an indigo-leaning blue with warm ivory light surfaces and softly violet-tinted dark surfaces. Light, Dark and System remain independent choices, with browser-local persistence and direct comparison links. The existing palettes remain available; no final scheme is selected.

## Navy based on #001B66

Added Navy / Azul marino as a sixth exploratory palette. The supplied #001B66 is used exactly for navigation in both modes and primary actions in light mode. Dark mode uses coordinated blue-black surfaces and lighter action/link tones for readability. Light/Dark/System, browser-local persistence and comparison links remain available. No existing palette is replaced.

## Navy / Azul marino

Added a sixth exploratory palette anchored on the requested #001B66. The exact anchor is retained for navigation in light and dark modes. Supporting surfaces, borders, text and action colors adapt to appearance; dark-mode actions use a lighter blue for distinction from the dark surface. Existing palettes and Light/Dark/System choices remain available, with browser-local persistence. Semantic tag colors remain unchanged.

## Studio / Estudio — proposed data-focused theme

Recommendation: neutral navigation, white/light-gray surfaces, graphite text and restrained blue accents. Compact 48 px row cells with 44 px action targets; tabular digits and right-aligned monetary columns; smaller headings, flat toolbars and 6 px control corners. Dark mode uses charcoal surfaces and lighter blue accents. Existing tag colors retain their meaning. This is a selectable alternative, not a confirmed replacement for the existing brand palettes.

Rationale informed by [Carbon data table guidelines](https://www.carbondesignsystem.com/building-blocks/core/components/data-table/guidelines): consistent row sizing and ample table width support dense records. The Studio styling is a local proposal, not a Carbon component integration. Select Studio / Estudio in the color selector or use the light/dark links on the theme comparison page.

### Beautiful UI reference — Studio refinement

User-selected inspiration: [Beautiful UI](https://www.beautifului.dev/), particularly Records Table and Sidebar Nav. Adapted direction: graphite dark surfaces with neutral light equivalents, fine vertical and horizontal table separators, compact colored tags, softly rounded table containers, restrained control shadows and quiet navigation selection. The app retains its own gavel brand, organization permissions and auction workflows. These are locally authored CSS refinements inspired by the reference; no component code or external font dependency was imported. Studio remains the selectable theme for this direction.

### Harbor / Puerto — dashboard reference exploration

Proposed alternative based on the [user-supplied dashboard image](https://cdn.dribbble.com/userupload/4484993/file/original-eea6318ae2bfd3406e57c05ff21eb666.png): deep teal navigation, white tables, pale aqua identifier cells, fine grid separators and coral primary actions. The compact table structure shares Studio's spacing refinements. A coordinated dark appearance uses deep teal surfaces. This adapts the visual direction to the existing auction workflows; the illustration's decorative background and floating contact panel are not part of this proposal. Original local CSS; no external assets or component code imported. Select Harbor / Puerto or use its theme-comparison links.

### Preferred direction: Warm blue with reference-inspired components

User clarification: retain Warm blue / Azul cálido; the dashboard reference guides component appearance rather than a palette replacement. Warm blue now uses the compact table treatment, thin grid separators, softly rounded table and menu containers, small tag badges, flatter sorting toolbar, rounded navigation selection and subtly tinted identifier cells. Existing indigo/ivory light colors and coordinated dark tokens are retained. Teal and coral belong only to the optional Harbor exploration. Studio and Harbor remain comparison alternatives.

### Current focus: Studio and Studio Warm Blue

User decision: concentrate refinement on Studio. Add Studio · Warm Blue / Estudio · Azul cálido as a color variant of Studio. Both use the same compact rows, fine grid, neutral sidebar, rounded containers and control styling. The variant uses warm ivory and indigo in light mode and coordinated indigo-tinted dark surfaces. It does not inherit Harbor's navigation silhouette or the earlier Warm blue exploration's saturated sidebar. Existing options remain for historical comparison. Select `studio-warm-blue` for this variant; theme mode remains an independent Light/Dark/System preference.

## Lucide icons

Confirmed: Lucide replaces previous interface icons throughout navigation, list actions, filters, sorting, pagination and tag CRUD. The gavel logo remains a separate brand asset; schematic map artwork is content, not an interface icon. Use named imports from `lucide-react` in the Next.js frontend. Prototype SVGs are generated with React server rendering from pinned `lucide-react` using `tools/icon-generator/build.cjs`; they are embedded in app.js so the offline prototype needs no CDN or React runtime. Icon size 18–20 px, stroke width 1.75, currentColor, decorative SVGs aria-hidden, and readable button labels retained. Native sort selects use localized direction words. Generator dependencies/lockfile and Lucide license are included. Run npm ci and npm run build inside tools/icon-generator to regenerate.
