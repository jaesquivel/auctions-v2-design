# Responsive mockup guide

Open [the prototype](../mockups/index.html) directly in a current browser. It is local, offline, dependency-free and editable as HTML, CSS and JavaScript. It demonstrates a proposed interface rather than production behavior. The [package index](../index.html) also links to every document and engineering artifact.

## Review sequence

1. Open Properties, Vehicles or Other. Change ES/EN; country stays fixed for the instance.
2. Choose Open filters. The separate view contains the grouped editor, Save filters and My saved filters with Retrieve actions.
3. Add groups/terms and choose AND/OR within and between groups. Save a valid named draft without applying it.
4. Cancel and return preserves the previous listing/context. Reopen, Retrieve the saved definition, review its restored category/organization and Apply and view results.
5. Switch list/map with the same applied expression. Assign organization tags directly; no Saved-auction collection exists. Rows contain no images.
6. Inspect item detail, member Images and original Notice evidence. All examples are fictional, image previews are local and external integrations are unconnected.
7. Switch organizations; definitions stay user-owned. Alerts exposes pause/delete and links to the filter view. Unavailable contexts prevent retrieval.
8. Inspect ADMIN/MANAGER/USER organization controls and the separate SYSADMIN system grant; country is never selectable.
9. Resize to mobile. The separate view stacks editor and saved definitions; there is no inline sidebar or mobile drawer. Data resets on reload.

## What is implemented in the prototype

Responsive views: overview, discovery list/map, separate filter editor with save/retrieve, asset, Notice, Images, alerts, team, plans, review, organization settings, system settings and sign-in layout. Responsive variants are the same editable screens at 1440 and 390 px, with additional checks at 320 px. Native inputs, buttons and dialogs allow inspection and keyboard navigation. Fictional example identifiers use DEMO prefixes. Auction lists show no images. The Images tab accepts member-selected local files for demonstration; previews are browser-local and reset on reload. No real upload, storage or processing service is connected.

Functional demonstration behavior includes navigation, language switching, filter application/reset, list/map switching, direct per-auction tag assignment and organization tag filters, user-owned saved-search creation/pause/delete across organization switches, role preview, team versus single-member organization views, controlled tag assignment, local organization tag management, separate SYSADMIN preview, local system settings and fictional ingestion runs, source-state previews and a local extraction correction. Authentication, provider maps, billing, email, durable storage, true authorization, PDF fetching and production ingestion are intentionally represented as integration boundaries. Role preview changes visible controls and is not a security implementation.

## Editing

Update mockups/app.js for content and behavior; styles.css for responsive layout; design-tokens.json for the proposed token export. Copy dictionaries live in app.js for this prototype and should become versioned locale files in Next.js. The fixtures in data/demo-listings.json are the shared synthetic input. Because the prototype opens via file URLs, it embeds the same data rather than fetching it; the package checker verifies both copies agree.

The qa folder records actual validation performed and any remaining limits. Screenshots, when present, are review snapshots of the same prototype. They do not replace the editable source.

## Three auction listings

Open Properties, Vehicles or Other in the first three navigation positions. Each listing has its own heading, result set and subtype choices. Clear keeps the active listing; changing listing resets filters and returns to list view. Vehicles and Other omit property-area controls and row facts. The prototype starts in Properties; direct URLs use ?screen=discover&category=vehicles and ?screen=discover&category=other. English navigation uses Properties / Vehicles / Other. New DEMO-V and DEMO-O records are wholly fictional, as are all property fixtures. Saved searches include category; tagging, Notice and Images work for every item type.

## Gavel logo

The reference-based gavel appears in the desktop navigation, mobile home link, sign-in concept, browser favicon and package/document headers. Select the app logo to return to the default Properties listing. Inspect the [brand preview](../brand/index.html) for light/dark symbols and editable horizontal wordmarks.

## Filter-only discovery

Use Filters and Apply filters for all matching. Text or reference is an optional term within the same grouped filter form. There is no independent search bar or button. The same applied criteria drive list/map results. Save filters stores the validated editor draft under the current user; changing organization does not change ownership. Draft edits can be saved without applying them. Open filters navigates to the same separate view on mobile.

## Grouped AND/OR walkthrough

In Properties, add a group. Set its first field to Province and value San José. Add another Province term for Alajuela and set Combine terms to Any (OR). Add a second group with Type = House and Extraction quality = Reviewed, leaving that group at All (AND). Combine groups at All (AND) and apply: only fictional DEMO-A01 matches. Change only Combine groups to Any (OR): results stay unchanged until Apply, after which DEMO-A01, DEMO-A02 and DEMO-A04 match. Save filters preserves both groups and all operators. All data remains fictional.

Use explicit Not reported to include missing base/area; do not use an empty value. Base terms require their own currency. Vehicles/Other omit area from the field list. No-group Apply restores the category catalog. Existing flat-filter examples earlier in this guide are superseded by the group builder; there is still no separate Search action.

## Separate filter view walkthrough

Choose Open filters from Properties, Vehicles or Other. The builder now appears on its own screen, alongside My saved filters. Add/edit groups, then use Save filters to name and store the valid draft without applying it. Saved definitions appear with their category and organization. Retrieve restores one into the editor; review the restored context and choose Apply and view results. Cancel and return leaves the previous applied criteria/results and organization intact. Clear affects only the draft.

Direct preview: ?screen=filters&category=properties. The preceding grouped example is still valid, but begin by opening this separate view and use Apply and view results. Reopen the view to edit operators, save, or retrieve. The prototype keeps saved definitions in memory until reload. There is no standalone Search action, inline sidebar or mobile filter drawer. Save creates a new named copy; overwrite/update is not demonstrated.

## Localized app name

Toggle ES/EN: navigation/sign-in wordmarks, browser title, accessible Home labels and footer show Remates / Auctions respectively. No v2 badge is displayed. The brand preview includes editable wordmarks for both languages.

## Item pagination preview

On Properties choose 5 in Remates por página / Items per page. The six fictional examples span two pages: page 1 shows five and page 2 shows DEMO-A06 only. Next is disabled on the last page; Previous is disabled on the first. Changing size resets page 1. Open an item and return to preserve its page. Open Filters and Cancel to retain page; Apply a filter to reset it. Vehicles and Other use the same controls but currently have only two fictional items each.

The editable offline prototype simulates the server response over local fictional fixtures; it does not implement a live Spring endpoint. Production must request a bounded server page and never load all matching items for client slicing. Direct preview: ?screen=discover&pageSize=5&page=2. Saved filter definitions omit page/pageSize; the map query is independent of item pages.

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

## Listing column menu

Open Columns / Columnas beside the sort controls. Check or uncheck columns, including First round, Second round and Third round, then close the menu. Changes apply immediately and persist per demonstration user/category in this browser across reloads. Reset columns restores defaults. One data column remains selected. The account-backed application will save these preferences per authenticated user; the offline prototype does not synchronize devices.

### Specific round-date columns (current behavior)

Confirmed: the Columns menu offers First round / Primera ronda, Second round / Segunda ronda, and Third round / Tercera ronda as three independent date columns, replacing the combined Other rounds choice. Each column always shows its corresponding event date, even if that round is also the Next Auction. Unknown dates use the not-reported fallback. Preferences remain user-owned and category-specific; all three date columns are optional and hidden by default. Existing prototype selections containing the legacy `otherRounds` key expand to `round1`, `round2`, `round3`, retaining the user's other choices. Earlier references to a combined Other rounds column are superseded by this section.

### Leading listing columns

Confirmed order: Tags first; for Properties, Registration number / Número de finca second; for Vehicles, Plate / Placa second; Location follows. Other has Tags then Location, as no category-specific registration identifier was requested. Item and the remaining selectable columns follow. These identifiers are distinct from the internal item Reference. Column visibility remains user-owned. Prototype data includes clearly fictional `registrationNumber` and `plate` values prefixed DEMO; unknown identifiers use the existing not-reported fallback. Existing browser preferences that display Reference also receive the appropriate category identifier. Production must populate identifiers from normalized notice evidence, not synthesize them.

### Round times and base offers

Confirmed: the Columns menu also offers independent Time / Hora and Base offer / Oferta base columns for each of the First, Second and Third rounds. They sit beside that round's optional date column; each can be selected separately and persists with the user's category preferences. These six optional columns are hidden by default. Time uses the event's configured country timezone (Costa Rica in this prototype), not the viewer's browser timezone. Missing event times or base offers show Not reported. Each fixture event now includes `time`, `timezone` and `baseOffer: {amount, currency}`; base offers retain their currency and do not imply currency conversion. Synthetic amounts are illustrative and do not encode statutory reductions. Production must extract and validate each round's time and base offer from notice evidence, never infer them from another round. Single-line rows and horizontal scrolling remain.

## Organization tag management

ADMIN and MANAGER can open Available tags / Etiquetas disponibles from the sidebar, or Manage tags from Settings. Routes: `?screen=tags` (list), `?screen=tag-new` (create); View and Edit open `tag-detail` and `tag-edit` for a selected organization definition. The list shows colored labels, active status, assigned-item counts, and View/Edit/Delete menus. Forms validate unique names up to 40 characters, allowlisted colors and active/inactive status. Cancel returns without applying edits. Delete requires confirmation and archives the definition; history and saved-filter references remain. USER receives an access-denied screen and no maintenance menu; assigning available tags to items remains permitted. Empty lists and missing/foreign tag IDs have explicit states.

This is editable, offline demonstration CRUD: organization definitions reset on reload; no backend persistence is connected. Screenshots: [list](../qa/tags-list.jpg), [create](../qa/tags-create.jpg), [detail](../qa/tags-detail.jpg), [edit](../qa/tags-edit.jpg), [delete confirmation](../qa/tags-delete.jpg).
