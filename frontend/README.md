# Auctions / Remates — React preview

A real Next.js App Router application using official shadcn/ui **Nova** components (Base UI foundation) and the b2fA Neutral/Geist preset. This is the preferred interactive preview. The older offline design package in `../auctions-v2-package` is frozen as read-only historical reference. All future app changes, tests, screenshots and new documentation belong in this `frontend/` directory; do not regenerate or update the old mockups or package.

## Run locally

From this directory (Node.js 20.9+):

```sh
npm ci
npm run dev
```

Open [Remates in Spanish](http://127.0.0.1:3000/es/properties) or [Auctions in English](http://127.0.0.1:3000/en/properties). The server binds to 127.0.0.1. If port 3000 is in use, stop that preview before starting another instance.

To run the optimized build:

```sh
npm run build
npm start
```

## Libraries actually used

- Next.js 16.4.6, React/React DOM 19.3.1, TypeScript and Tailwind CSS 4.
- Official shadcn 4.23.0 source-owned `base-nova` components under `components/ui`, including **Data Table** for every grid. The shared `components/ui/data-table.tsx` follows the official shadcn Data Table pattern with TanStack Table 9.3.1 over the Nova Table primitives; no v1 grid reuse or AG Grid.
- Base UI 1.9.0 primitives, Lucide React icons, Geist through `next/font/local`, class-variance-authority, clsx and tailwind-merge. The current official registry also imports its `cn` helper package.
- next-themes for light/dark/system, next-intl for `/es` and `/en` routes and messages, React Hook Form with Zod/resolvers, Sonner, Tailwind Typography and tw-animate-css.
- Leaflet/react-leaflet for the illustrative Properties map, dynamically loaded on the client.
- Clerk Next.js, UI/shadcn theme and es/en localization integration; credentials optional and absent by default.

`package-lock.json` records the resolved dependency graph. `components.json` selects Base UI/Nova for every future component installation. All stock components live directly in `components/ui`; the former isolated Sidebar copies were consolidated and Radix packages removed. Components use Base UI `render` composition and one root TooltipProvider. `qa/components.json` records source hashes. Generated component styles remain stock; application compositions preserve the agreed domain behavior. See `qa/base-ui-migration.md` for migration details.

## Working simulation

- 150 explicitly fictional records: 50 Properties, 50 Vehicles, 50 Other. No listing images.
- **Real server-side** grouped filtering, multi-sort and pagination through `POST /api/items/query`; clients receive the requested page rather than the whole catalog. Page sizes 5/10/25/50/100, nulls last, stable ID tie-breaker and exact decimal amount comparison. One currency is required for amount sorting/filtering.
- Filters are edited in a separate view. Save stores a validated user-owned draft; load restores a draft/context; Apply changes results; Cancel leaves the applied listing intact. AND/OR operators work at group and term levels.
- Per-demo-user/category visible columns persist in this browser. Column resizing and saved widths remain deferred. Grids use single-line rows and ellipsis truncation; list tags never wrap. The stock Table may itself use its documented nowrap defaults; single-line overflow constraints are applied by the application grid.
- Shared item view/edit screen, header tags, General info, Auction, Registry info, Notice, Registry, Properties-only Location, Images. Auction rounds, bases, optional calculated fictional participation costs, lot relationships and related item links are present.
- Notes, appraisal and market values are stored separately from immutable source data, under organization/item keys. Properties and Vehicles show optional government tax values.
- Original synthetic notice text is carried over intact from the earlier prototype. Source description/liens, parties/court/venue/office, reference/case, publication and extraction notes are read-only.
- Tags: 27 fictional team labels plus a solo label. Colored assignment uses approved stock Popover/Toggle composition with no checkmarks. Tags are created and edited in the same stock Dialog and shared form, with optional descriptions (up to 2,000 characters). Descriptions appear in a truncated Description column in the Tags list and remain absent from the assignment picker; no active field. Tags grid has no filters, pagination or column selector. Soft deletion preserves existing assignments.
- Images: JPEG/PNG/WebP, 10 MB each, 20 per item; browser object-URL previews and a Dialog viewer. No files are uploaded. Images survive tab changes during the current loaded app session and reset on reload; research and preferences persist in local storage.
- Overview, saved-filter alerts, organization settings, team-role simulation, plans and SYSADMIN operation previews. Demo profile menu switches users and roles. Every demo user operates within an organization.

## Persistence and security boundary

This is **not a production service**. Catalog/notice fixture routes are read-only and public to the local preview. Research, tags, roles and saved filters use `auctions-react-preview:v1` in this browser's local storage; image previews are memory-only. Demo role controls and organization separation demonstrate behavior, not security enforcement. Do not enter sensitive/private records or deploy this preview as an authenticated multi-tenant backend. The Java/Spring Boot, PostgreSQL, object storage, audited authorization and production contracts remain specified in the design package and are not implemented here.

All demo users can switch between the two fixed demo organizations. Demo 01 starts as MANAGER in the team and ADMIN in the solo organization; Demo 02 starts as USER. Saved filters/column choices stay tied to the selected demo user; notes and item tags use organization scope. This is independent from a real Clerk identity.

No bidding, payments, email delivery, invitations, ingestion jobs, legal verification or real registry lookup occurs. The app labels these boundaries. Subscription prices remain undecided. Notices and coordinates are fictional; participation cost examples are not country-law defaults.

## Optional service configuration

Copy `.env.example` to `.env.local` only if connecting your own approved services. Do not commit real keys.

Both `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` enable ClerkProvider, locale-specific Clerk UI/theme and middleware, with sign-in available at the profile control and `/es/auth`. No Clerk account/application is created automatically. Real Clerk sign-in is not a replacement for the unfinished backend organization/role mapping; demo research continues to use the selected preview context. Credentialed Clerk flows were not tested without keys.

Map tiles are **off by default**. Set both `NEXT_PUBLIC_MAP_TILE_URL` and `NEXT_PUBLIC_MAP_ATTRIBUTION` to an approved provider to enable them. Leaflet otherwise shows its map container and explicitly fictional demonstration points without external tile requests. No production geocoding or actual parcel coordinates are provided. Instance country is fixed to CR for these fixtures; there is no user/admin country selector. Another country needs an adapter and fixture/configuration work.

## Checks

```sh
npm run lint
npm run typecheck
npm test
npm run build
# With the local app running, include HTTP integration checks:
PREVIEW_TEST_URL=http://127.0.0.1:3000 npm test
```

12 domain tests, 3 Data Table tests, 3 Base UI integration tests, 2 sidebar permission tests, 4 tag-color tests, plus 4 opt-in live API/route tests (28 total). Production build and lint/type checks pass. Browser review covers page-size/page transitions, filter save/apply/load, user ownership, column persistence, multi-sort, organization research separation, tag create/edit/delete, draft-preserving assignment, locale/theme switching, actual Leaflet loading, mobile table overflow and mobile sidebar-sheet navigation. It is not a full accessibility audit or test of live Clerk/payments/database/ingestion.

## Source map

- `app/[locale]/[[...path]]/page.tsx`: localized screen routes.
- `components/ui/`: official shadcn Base UI Nova components and the shared DataTable composition.
- `components/item-grid.tsx`, `filter-editor.tsx`, `item-detail.tsx`, `tag-management.tsx`: application workflows.
- `lib/domain.ts`: schemas, grouping/sorting/paging, exact money and validation.
- `lib/catalog.ts`: server-only fixture adapter; replace with the future backend adapter.
- `lib/preview-store.tsx`: explicitly local demo persistence and scope simulation.
- `data/`: immutable fictional catalog and source notices; not public browser assets.
- `app/api/items/`: local Next Route Handlers, not the production Spring API.
- `messages/`: editable English/Spanish messages.
- `public/brand`, `public/fonts`: supplied logo and licensed self-hosted Geist.

No ZIP is generated. All project work stays under the canonical project directory.

Label/value presentation uses the official Field/FieldLabel/FieldTitle composition. Detail labels share the form-label typography; values use regular-weight foreground text. Form labels are associated with their inputs/select triggers. Current visual verification: qa/react-field-styles.png.

The sidebar is divided into Auctions, Data Extraction, Configuration and System (localized in Spanish). System is rendered only when the current demo user has SYSADMIN, independently of organization role; its direct page guard remains active. Data Extraction currently links to an explicit not-connected review-queue placeholder and does not grant operational permissions.

All data grids use the shared TanStack-backed DataTable renderer. Item sorting, pagination and filters remain authoritative on the server; the DataTable uses manual sorting/pagination and controlled per-user column visibility without client row models that would re-sort or re-paginate a returned page. Tags/rounds/team use their existing local data and behavior, with no new pagination/filter controls. Single-line clipping, colored non-wrapping tags and untitled action columns remain in force.

Sidebar reference layout: expandable sections with chevrons and nested links, organization dropdown in the header, account menu in the footer, and stock icon-only collapse/rail. The old proposal card was removed from navigation. Sections and SYSADMIN visibility are preserved.

Table actions are the rightmost column, pinned to the right during horizontal scrolling through the shared DataTable. The remaining data columns retain their order. Tables without actions gain no new controls.

## Container deployment

Docker setup targets Linux AMD64: [build and run instructions](deployment/README.md). Compose deploys the prebuilt `auctions-frontend:${FRONTEND_IMAGE_TAG}` image, loads runtime settings from `frontend-env`, and joins the existing external `traefik` network without publishing host ports. `.env.docker.example` supplies the required tag and `frontend-env.example` supplies the runtime template. Dockerfile uses the non-root standalone Next.js server and a Node-based /api/health check. The image has not been built locally because the Podman VM aborts on startup; standalone output has been tested independently.

The Create tag button opens the same dialog used by the edit icon, with matching fields, validation, Save/Cancel and close behavior. Direct /tags/new links open this create dialog over the list and return to /tags on completion or dismissal. Existing browser tags without a description remain compatible and open with an empty description. Save persists name, color and description together; Cancel leaves the tag unchanged. ADMIN/MANAGER permissions remain in force.

The shared tag form includes swatches in its color selector and an HTML color field accepting #RGB/#RRGGBB. Presets and the text field stay synchronized. Custom colors persist and render in every tag badge with contrasting foreground text; existing named preset colors keep their appearance.

### Territorial Divisions

Open `/en/territorial-divisions` or `/es/territorial-divisions` from Configuration. Everyone can browse the expandable Province → Canton → District hierarchy. Only the account menu's simulated SYSADMIN role enables add/edit/delete, independently of organization ADMIN/MANAGER. The same form supports creation and editing; parent selection uses full paths. Duplicate codes at the same level, duplicate sibling names, invalid parents, and deleting divisions with children are rejected. Name/code changes retain stable IDs; reparenting retains descendants.

`lib/territorial-divisions.ts` holds deployment-owned level configuration and catalog commands. `data/territorial-divisions-cr.json` is a complete **2024 snapshot**, extracted from the Instituto Geográfico Nacional / Registro Nacional [official territorial table](https://files.snitcr.go.cr/boletines/DTA-TABLA%20POR%20PROVINCIA-CANT%C3%93N-DISTRITO%202024.pdf) ([machine-readable original](https://files.snitcr.go.cr/boletines/DTA-TABLA%20POR%20PROVINCIA-CANT%C3%93N-DISTRITO%202024.xlsx)), retrieved 16 November 2026: 7 provinces, 84 cantons, 492 districts. Names/codes are source facts, separate from fictional auction fixtures. This is not asserted to be the latest legal catalog. No external service is called at runtime.

Catalog edits persist in this browser's shared instance catalog across demo users/organizations; existing local data is preserved. Production shared persistence, audit history, API authorization and property foreign keys are pending. A referenced-node guard is available in catalog commands; current fictional property locations remain source strings and are not yet linked to catalog IDs. Production property locations should reference stable leaf IDs with ancestor paths resolved from the catalog, retaining raw extracted location text separately. Reject deletion when referenced; don't cascade-delete property locations. A different deployment country replaces the configured level labels and seed catalog; users never choose a country or schema. The prototype does not implement a production administration API.

All territorial levels include **Area (km²)** and **Altitude (m above sea level)** in the tree and SYSADMIN form. Area is populated for all 583 seed entries from the same IGN 2024 table, rounded to its published two-decimal precision. No authoritative altitude values are present in that source, so altitude starts unknown (`null` / —) and may be entered manually. Unknown is distinct from zero; area must be positive and finite, while altitude accepts zero and negative elevations. Existing browser catalogs backfill only absent measurements and preserve explicit nulls and user edits.

`normalized_name` is generated from each division name by removing accents, converting to lowercase, and trimming/collapsing whitespace. SYSADMIN can inspect it as a read-only field in the shared new/edit detail form. It is excluded from all tree/list columns and regular-user forms. As with other prototype permissions, this is UI visibility rather than server-side data secrecy; production APIs must omit internal fields for non-SYSADMIN users.

### Bulk tags on item lists

Properties, Vehicles and Other provide **Add tag / Remove tag** menus for every member. Choosing a colored tag opens a confirmation dialog for **all items matching the current filters, across server pages**. The dialog states the action, tag and exact number of items whose assignments will change (excluding existing assignments when adding, or missing assignments when removing). Cancel/Escape makes no changes; only the confirmation action applies the update. The legend shows the total matching count (Applies to X items / Se aplica a X elementos). Matching IDs are loaded on menu open from all server pages before any assignment changes. Failed/incomplete/inconsistent loads never partially apply changes; leaving the listing context aborts pending loads. Add skips existing assignments; Remove offers tags assigned to any matching item, including those outside the displayed page. Other tags, unmatched items and other categories remain untouched. Deleted definitions are excluded. The existing individual tag picker remains available.

Assignments use the current organization's browser-local prototype state. This feature has no automatic rules, scheduled execution, or saved-filter changes. Production should send explicit item IDs to an authorized backend bulk-assignment operation that validates membership, item access and tag ownership atomically.

The list footer places Items per page and all paging controls below the table (or empty state). Item pagination centers the total matching item count (X items / X bienes) between the page-size selector and icon-only First, Previous, Next and Last controls. The direct page-number input has no spinner arrows and navigates on blur or Enter without a Go button. Invalid/blank drafts revert to the current page on commit; explicit navigation buttons take precedence over an uncommitted draft. Only whole page numbers in the current result range are accepted; the control is disabled while loading or when results are empty, and resets to the returned server page after navigation. It is shared by Properties, Vehicles and Other, with responsive wrapping.

The page-size selector uses a separate Items per page / Bienes por página label and numeric options 25, 50 and 100. Legacy browser selections of 5 or 10 display as 25 starting at page 1, and subsequent listing changes save a supported size.

### Compact sorting

The View options / Opciones de vista dialog uses a visible title and full-width Filters, Sort and Columns tabs. Sorting rules and column checkboxes are inline in their panels. Its badge shows the number of active sort criteria. The sorting panel contains field choices, one-click ascending/descending toggles and a per-rule menu to move up/down or remove a criterion. Add and Clear all remain available, with a maximum of five unique fields. Sorting edits remain draft until Apply, reset to page 1 and retain server sorting before pagination. Column-header sorting and Shift-click multi-sort remain available. No persistent sorting panel consumes listing space.

Auction listings are table-only: there is no List/Map toggle or listing map view. The property detail Location tab remains a separate feature.

### Filter dialog

View options displays sorting, column selection and the grouped filter editor in a responsive shadcn Dialog over the current listing. The filter body scrolls while Cancel, Saved filters and Apply remain in the footer. Apply commits the validated query and per-user/category visible columns together and closes; Cancel, Close and Escape discard filter, sort and column draft edits. Saved filters opens a menu listing the current user’s saved filters plus an inline name-and-save form for the current draft. Selecting a saved filter loads its draft and closes the menu; saving closes the menu without applying the draft. Existing `/properties/filters`, `/vehicles/filters`, `/other/filters` and `?load=` links open the same dialog over the relevant listing.

Filter operands: tag conditions accept multiple colored tags with Any of, All of, None of and Exactly (the exact assigned set). Dates support At, Before and After with a specific calendar date or today plus/minus integer days. Relative values remain dynamic in saved filters and use the Costa Rica instance timezone. All categories expose independent dates and base amounts for rounds 1–3, alongside the existing next-auction date/base. Amount comparisons require a selected currency; unavailable rounds do not match. The preview contract stores tag IDs in `tagIds` and date operand mode in `dateMode`; `value` contains a calendar date or signed day offset. Legacy contracts remain executable.

Currency controls are embedded in individual amount conditions (`term.currency`), so separate round conditions can use different currencies. There is no dialog-level currency selector. Legacy global currency remains accepted by the API. Listing amount sorting requires a filter expression that guarantees a single listing currency. Group deletion appears beside the group title.

Saved views / Vistas guardadas replace saved filters in the interface. New views save the complete query (filter groups and sorting) plus selected columns. Loading restores a draft; Apply commits it, Cancel discards it. Saved views remain user-owned. Existing saved-filter records and storage are preserved, with current column preferences used when an older record lacks columns.

Each View options tab has an independent reset button: Clear filters removes filter conditions, Clear sort removes sort criteria, and Reset columns restores default visible columns. Each preserves the other two sections and remains a draft until Apply. Saved views include all three sections.
