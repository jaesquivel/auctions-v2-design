# Auctions / Remates design project

The canonical project directory is `/Users/jesquivel/Documents/development/projects/auctions-v2-design`.

Make all future project modifications in this directory. Create all new project files here or in its subdirectories. Do not use the former directory `/Users/jesquivel/Documents/ChatGPT/Auctions v2 app design and mockups` for project work.

The documentation and editable prototype are in `auctions-v2-package/`. Its `index.html` is the deliverables index. Keep all deliverables directly in the project directory. Do not create or refresh ZIP archives unless the user explicitly requests one again.

## Confirmed country scope

The software supports multiple countries, but every instance is configured at deployment time for exactly one country. Never add user or application administrator country selection. Country metadata is read-only; locale, currency and within-country location controls are separate.

## Confirmed organization model

Every user belongs to at least one organization, including a one-person organization. Never add a personal workspace or user-owned subscription mode. Auction tag definitions/assignments, annotations, organization permissions and billing are organization-scoped. Saved searches are user-owned; organization context is execution scope only. Proposed onboarding joins an invited organization or creates a solo organization with the user as ADMIN.

## Confirmed organization roles

Exactly ADMIN, MANAGER and USER. ADMIN edits full organization settings including users. MANAGER edits operational settings such as available organization tags. Do not add a fourth Owner role. Proposed solo onboarding assigns ADMIN. Other capabilities must be marked proposed unless confirmed.

## Confirmed system role

SYSADMIN allows system configuration and operational tasks. Model it separately from organization roles ADMIN/MANAGER/USER. SYSADMIN users still belong to an organization. No runtime country selection is permitted. Exact system capabilities and no automatic tenant-data bypass are proposed policies; do not let organization administration grant SYSADMIN.

## Confirmed direct tags and search ownership

No Saved/favorite/bookmarked auction items, save buttons, saved-item collections or prerequisite save state. Users assign available tags directly to auction items and use discovery tag filters. Saved searches remain supported and belong to the user, not the organization. Organization ADMIN and SYSADMIN do not override search ownership. Context membership/entitlements are revalidated for execution.

## Confirmed auction images

Do not display images in auction list rows. Item detail has an Images tab where organization members attach images directly, without a save/tag prerequisite. Member-image visibility and deletion policies remain proposed; keep attachments distinct from official notice evidence.

## Confirmed terminology

Use Notice for the product/domain concept, API routes/types and database names. Spanish product copy uses aviso. Preserve original legal source wording in ingested evidence.

## Confirmed primary listings

Auction items are the main focus. Provide three distinct primary listings: Properties, Vehicles, Other (Propiedades, Vehículos, Otros). Categories are separate from subtype and organization tags. Shared Notice/detail/research workflows apply across categories. Default landing, subtype taxonomies and classification rules are proposed decisions.

## Confirmed logo direction

Base the system logo on the user-supplied monochrome gavel reference. Use the editable assets in auctions-v2-package/brand consistently on home, navigation, sign-in, favicon and documentation. Keep it category-neutral. Vector geometry and typography are proposed execution choices.

The supplied replacement SVG supersedes the initial drawn gavel. brand/source-gavel.svg preserves the original; active variants use its six right-hand gavel paths with only scaling, translation and monochrome fill changes.

## Confirmed filter-only discovery

All matching is performed from one filter definition. No independent search bar, Search button or second discovery workflow. Optional text/reference is a criterion inside the same filter form. Saved searches remain user-owned saved filter definitions; user-facing actions say Save filters / Guardar filtros.

## Confirmed grouped filter semantics

Filter terms form groups. Each group independently combines its terms with AND or OR; the outer expression combines groups with AND or OR. Saved filters preserve the complete structure. Category/country/organization access are mandatory constraints outside the expression. Two-level depth and limits of 10 groups, 20 terms per group and 100 total terms are proposed.

## Confirmed separate filter view

All filter controls are in a separate view opened by a listing button. Save and Retrieve live in that view. No inline builder or Save/Retrieve controls on listings. Proposed Save stores a validated draft as a named copy, Retrieve loads a detached draft/context, Apply returns to results and Cancel restores the pre-editor listing/context.

## Confirmed app name

Auctions in English; Remates in Spanish. No v2 suffix or adjacent version badge in the displayed identity. Localize wordmarks, browser titles, Home labels and footers. Preserve the existing technical project directory names.

## Confirmed item pagination

Item listings use server-side pagination with selectable page size. Proposed one-based pages, size 25 by default and choices 5/10/25/50/100. Pagination is not a saved-filter term; scope/criteria/size changes reset page 1, while Cancel/detail return preserve it. The offline adapter only simulates server responses; production must not load all matching items for client pagination.

## Confirmed item tables and sorting

Use column-headed, single-line item tables with horizontal scrolling on mobile. Support prioritized sorting on multiple values; server sorts before paging, nulls last with ID tie-breaker. Amount sort requires one currency. Keep direct tags and no images.

## Confirmed single-line records

Item tables use one line per record at all widths. Separate reference/title columns; Tags and Notice buttons belong in the rightmost Actions column. Mobile scrolls horizontally rather than stacking cells.

## Confirmed item action icons

Use icon-only Open item, Tags and Notice controls in the rightmost column. Remove the visible Actions heading. Keep localized tooltips and accessible labels. UI icons do not count as auction images.

## Confirmed colored tags

Show assigned colored tag labels in the list view, before the rightmost icon controls. Keep single-line records. Palette and ADMIN/MANAGER color editing are proposed operational settings; labels remain readable independently of color.

List tag badges truncate to fit a single line. Demonstrate multiple assignments; show up to two badges with +N for additional tags, retaining full labels in tooltips and the Tags dialog.

Item-list buttons are frameless: no persistent border, background or shadow; retain accessible focus outlines and hit areas.

Theme choices are Light, Dark and System/default. System follows device preference; explicit selection is stored browser-locally and does not change organization or saved filters.

Color exploration: offer Forest, Ocean, Slate and Terracotta independently from Light/Dark/System. Palettes are proposed alternatives, not a selected final brand change.

Warm blue / Azul cálido is an additional exploratory color scheme with coordinated light and dark tokens; retain all other palette choices.

Navy / Azul marino is an additional exploratory palette anchored exactly on #001B66. Keep coordinated light/dark variants and all existing schemes.

Navy / Azul marino is an additional palette anchored on exact #001B66 navigation, with coordinated light/dark variants. Retain other palettes.

Listing columns: use a Columns / Columnas selection menu instead of a dedicated other-round toggle. Save the visible-column selection per user. Prototype browser persistence is per user and category; production account persistence remains specified. Other round dates are an optional column.

Round-date column update: offer First round, Second round and Third round separately in the user-owned Columns menu. Replace the combined Other rounds option; each column maps to that exact round's date, including when also shown as Next Auction.

Listing order: Tags first, Registration number for Properties or Plate for Vehicles second, followed by Location. Distinguish registry/plate identifiers from internal item reference. Other starts Tags then Location. Keep user column visibility preferences.

Round columns also include separately selectable time and base offer for each of rounds 1–3. Save with per-user/category column preferences. Use actual event currency and configured timezone, unknown fallback, and clearly fictional demonstration values without legal reduction assumptions.

Visual reference: user likes https://www.beautifului.dev/. Refine Studio toward its neutral surfaces, quiet navigation, finely separated data grids and compact colored tags while keeping the auction workflows and brand.

Harbor / Puerto is an additional exploratory theme based on the user's Dribbble dashboard reference: deep teal rail, white surfaces, aqua identifiers and coral primary actions. Retain Studio and other schemes.

Preferred UI direction: user still prefers Warm blue / Azul cálido. Apply the dashboard reference's component styling (compact tables, subtle separators, rounded containers/navigation, quiet toolbars) to Warm blue rather than replacing its colors with teal/coral.

Current UI direction supersedes earlier exploration focus: concentrate on Studio. Studio Warm Blue is a separate color variant sharing Studio components and neutral navigation, with the Warm blue color family. Refine those two going forward.

Organization tag maintenance has list/detail/create/edit screens and confirmed soft-delete/archive. ADMIN/MANAGER only; USER may assign existing active tags. Preserve assigned-item and saved-filter history on deletion. Sidebar and Settings link to maintenance. Offline demonstration is not backend persistence.

Use lucide-react icons for all interface icons. Offline prototype embeds SVGs generated from the pinned official package; preserve the custom gavel logo as brand artwork. Keep accessible labels on icon buttons.

Tags have NO active field or active/inactive status. Edit/delete only from tag list; no View/detail/edit screens. Keep create form, inline list editing and confirmed soft deletion. ALL data grids follow the properties grid's styling and rules (single-line rows, truncation, sortable columns/multi-sort, pagination/selectable size, per-user columns, frameless icons, untitled action column).

Tags grid exception: NO filtering or pagination controls. Display all non-deleted organization tags together; retain common grid styling, sorting, column controls and list-only Edit/Delete. Auction item grids still paginate.

Tags grid also has NO column selector or column preferences. Always show name, assigned-item count, and untitled Edit/Delete controls. Keep sorting and shared grid styling; no filters/pagination.

Properties have organization-owned user-editable research fields: notes and appraisal amount/currency, extensible to other fields not yet specified. The Properties row uses a Pencil/edit action instead of Eye/view. Keep source notice data immutable and organization scope separate; other categories retain open action.
