# Package validation report

Validated 6 November 2026. This report covers the local design prototype and editable specifications, not a deployed application.

## Checks performed

| Check | Result | Evidence |
| --- | --- | --- |
| JavaScript syntax | Passed | node --check mockups/app.js |
| Prototype behavior checks | 361 passed | tools/check-prototype.cjs: direct tags without save state, tag filters/removal, organization isolation, user-owned search access across contexts, foreign-owner denial including ADMIN/SYSADMIN, image type/size checks and organization visibility, roles/system permissions, source immutability, localization and screen renders |
| Responsive routes | 70 cases, no page-level horizontal overflow | Fourteen active routes at 320, 390, 768, 1024 and 1440 px; layout-checks.json |
| Images tab layouts | Five cases passed | image-tab-checks.json; member attachment control present, selected tab correct, no saved-item prerequisite |
| Organization role layouts | Fifteen cases passed | role-settings-checks.json; ADMIN identity/users, MANAGER tag definitions, USER settings denied |
| System role layouts | Ten cases passed | system-access-checks.json; SYSADMIN independent from organization role, country immutable |
| Country baseline | Ten earlier discovery/map cases remain valid | country-layout-checks.json; active route checks also retained fixed-country context |
| Image-free auction lists | Zero image/SVG media elements in auction rows and no Saved controls | Browser DOM checks before/after image attachment; all route records show zero Saved controls and zero row images |
| Direct tags in browser | Previously untagged DEMO-A02 tagged from its list row; selecting the tag narrowed results to one | No save action or bookmark state used |
| User-owned search in browser | Search created in one organization stayed visible after switching to another, with its original execution context displayed | desktop-user-searches.jpg and mobile-user-searches.jpg; foreign-owner rejection is a local helper/contract check, not live backend auth testing |
| Member image attachment in browser | USER member selected an existing fictional design JPEG through the native picker and previewed it in Images; the other organization had zero previews and list rows remained image-free | Local browser preview only; no server upload occurred |
| Notice terminology | Active UI/domain/API/schema use Notice; Spanish copy uses aviso | /notices routes, Notice DTOs, notice tables and refreshed notice snapshots; original-source preservation remains specified |
| Contract and link checks | See package-checks.json | JSON structure, schema references, path parameters, owner-only search markers, no saved-item schemas/routes and no listing image fields |
| Screenshots | 53 refreshed viewport snapshots | Screenshot gallery: image-free discovery, detail/Images tab, Notice, user-owned searches, organization/system role variants |

## Three-listing revision — 5 November 2026

Properties, Vehicles and Other are now the primary auction navigation and separate listing views. Browser checks across all five widths verified matching active categories and result counts (six property, two vehicle and two Other fictional examples), no page-level overflow, no Saved controls and no images in listing rows. Property area controls appear only in Properties. English headings and selected navigation were checked for all three; mobile and desktop layouts were visually inspected. A Vehicle item was tagged directly from its row and displayed the tag in its shared detail view with no area facts. A saved Vehicle search remained visible with its category after switching to Properties and another organization. All 40 app gallery snapshots were refreshed for the new navigation; older role/system/country report cases remain baseline evidence, not newly repeated authorization tests.

The 241 prototype checks include category isolation, subtype options, area controls, localized headings, active navigation, direct tags on all categories, category reset, invalid-category denial, category-aware detail and user-owned search retention. Structural API checks require category on all four listing/map endpoints, assets and saved filter schemas. The proposed schema has category/subtype compatibility checks and a category index. SQL, migration, production routing, classification and notification integration remain implementation gates. No real auction data or category-specific source sample was added.

## Current requirement interpretation

There is no Saved/favorite auction-item feature, route, flag or prerequisite collection. Organization tags link directly to auction assets; optional notes and image attachments are independent. Organization-scoped tag definitions/assignment visibility and attachment visibility remain proposed policies where not explicitly confirmed.

Saved searches are confirmed user-owned. Their organization context constrains private filter execution and entitlements only. Organization ADMIN and SYSADMIN do not override search ownership. Source events still drive search notifications; a tag assignment alone does not imply a new auction. The data model uses owner-based search/delivery RLS and organization-based tag/image/annotation RLS. No SQL has been executed against a database.

The software remains multi-country with one deployment-configured country per instance. Every user belongs to an organization. Organization roles remain ADMIN, MANAGER and USER; SYSADMIN is a separate system grant. Notice is the product/domain term; real ingested legal text must remain verbatim.

## Verification limits

Browser layout checks compare document scroll width with viewport width. They do not establish full accessibility compliance or detect every overlap. Images are viewport snapshots; content may continue below them. The prototype resets on reload and uses fictional auction data. Member-selected image previews remain in the browser; real storage, signed uploads, content inspection/re-encoding, metadata removal, retention and image deletion authorization are future implementation gates. The demonstrated attachment was an existing fictional design screenshot, not a property photo.

OpenAPI checks are structural, not a full standards-validator or generated-client build. The proposed SQL, owner-based RLS and tenant constraints require migration and integration testing. No live Clerk, payment, email, source ingestion, database, geocoder or production deployment is connected. Production security, extraction quality, performance, recovery, WCAG 2.2 AA and legal/privacy review remain acceptance gates.

The official Boletín Judicial endpoint returned 403 during earlier source research; source authorization and usable samples remain unresolved. No access restriction was bypassed. The package embeds no real judicial notices or personal auction data. Sources are linked in docs/12-sources-and-validation.md.

## Reproduce

From the project deliverables directory run node tools/check-prototype.cjs, python3 tools/build_package.py and python3 tools/check_package.py. tools/package_release.py refreshes only the local gallery and manifest; no ZIP is created. Browser screenshots must be recaptured after visual changes.

## Reference-based logo revision — 5 November 2026

Created five editable SVG assets: black/white gavel symbols, black/white Auctions wordmarks and a green tile favicon, plus a brand preview and usage guide. The logo is based on the visible user-supplied gavel reference; the original attachment path was not available to local file tools and the raster was not copied. Applied the symbol to the desktop rail, mobile home link, sign-in concept and generated document/package headers. Brand assets preserve a single monochrome mark; the split-screen reference background is not embedded.

Refreshed all 40 app screenshots and added desktop/mobile brand preview captures. Repeated 65 responsive route cases at 320, 390, 768, 1024 and 1440 px: no page overflow, broken logo images, missing visible Home links or auction-row images. Clicked desktop and mobile home logos and verified that each reached Properties. Inspected the home screen, mobile sign-in and light/dark brand preview visually. The package header's logo and favicon loaded with zero broken images. Evidence is in brand-checks.json and layout-checks.json. The 241 existing prototype checks still pass. This remains a design package; no production deployment was performed.

## Supplied SVG replacement — 5 November 2026

The replacement SVG supplied by the user supersedes the drawn approximation described in the preceding revision. Preserved the source byte-for-byte in brand/source-gavel.svg. The five active logo assets now reuse the six paths from its right-hand black gavel without redrawing. Only scaling, translation and monochrome fill adapt those paths to the existing logo, wordmark and favicon containers. The split background and duplicate mark are excluded from UI assets.

Refreshed all 42 screenshots. Rechecked 26 main-route cases at desktop 1440 and mobile 390 widths: no page overflow, broken images or images in auction rows. Visually inspected light/dark logo variants and mobile sign-in. Evidence is replacement-logo-checks.json; the earlier 65-case responsive and 241-check behavior results remain baseline evidence, not newly repeated tests for this asset-only revision. No production deployment was performed.

## Filter-only discovery — 6 November 2026

Removed the independent search bar and Search submit handler from all three listings. All criteria, including proposed optional text/reference, now live in one filter form and apply together. Interface labels say Save filters / Guardar filtros and My filters and alerts / Mis filtros y alertas; SavedSearch remains the internal user-owned definition and API resource. Updated product, journeys, design system, API guidance, data model and acceptance criteria. Added formnovalidate to the dialog Close control so an unnamed filter definition does not block closing.

247 prototype checks pass. Repeated 65 responsive routes at 320, 390, 768, 1024 and 1440 px: no standalone search forms, page overflow, Saved auction controls or list imagery. Fifteen English expanded-form cases across the three listings and five widths confirm one form, visible text/reference inside that form, no Search button and no overflow. Spanish desktop/mobile layouts were visually inspected. Browser behavior: entering text and province retained six results before Apply, then jointly matched one; an incompatible province with Enter matched zero. The save dialog summarized applied criteria while a province edit was pending. Its Close action worked with a blank name after the fix. Saved Vehicle filters remained visible with their original category after changing listing and organization. Refreshed 40 app screenshots and added the expanded mobile panel; two unchanged brand screenshots remain current (43 total).

The browser and helper checks validate only the local editable prototype. No backend, SQL or production deployment was executed. Older source, role, ownership and image-processing limits still apply. Filter semantics for proposed text/reference remain part of the editable design contract.

## Grouped Boolean filters — 6 November 2026

Implemented a two-level group builder with independent AND/OR operators inside each group and between groups. Added typed term controls, add/remove group/term actions, applied summaries with parentheses and separate draft state. Saved user-owned definitions retain a detached snapshot of the complete expression. SchemaVersion 3 API contracts, JSON examples, proposed SQL metadata, product/UX/security/deployment/acceptance/roadmap documents and editable ERD were updated. The contract also corrects category metadata placement on Asset rather than Problem.

283 prototype checks pass, including all four inner/outer truth-table combinations, category isolation, explicit unknowns, currency-bound amount terms, term/group/total limits, unsupported fields/operators, foreign organization tags, draft separation and saved snapshots. All 65 responsive route cases were recaptured with no overflow, separate search form, Saved-auction controls or auction-row imagery. Fifteen populated English builder cases (three categories at five widths) verified two groups, three independent operator controls, one form and category-appropriate area availability, with no overflow.

Browser walkthrough: (San José OR Alajuela) AND (House AND Reviewed) matched one fictional asset. Changing the outer operator in the draft retained one result; Apply with outer OR matched three. An empty draft group showed an error and preserved those three applied results. Saving retained the OR/AND parentheses across an organization switch. Evidence is grouped-filter-behavior.json, filter-form-checks.json and layout-checks.json. Refreshed all 40 app snapshots, replaced the mobile filter panel and added desktop/mobile grouped-filter examples; unchanged brand captures bring the total to 45.

Production SQL compilation, migration execution, database query-cost bounds, server authorization, map/count/notification parity and a full OpenAPI validator remain implementation gates. Current schema checks validate references, required property declarations, typed expression transport and separation of public/private term schemas; no database or production backend was run. Historical checks and superseded flat-filter behavior in preceding report entries are baseline evidence only.

## Separate filter view with save/retrieve — 6 November 2026

Moved the grouped builder out of all listings/maps into a separate Filters view. Listings have Open filters and an optional applied-expression summary; Save and Retrieve are inside the editor. The editor combines grouped controls, Save filters and My saved filters. Save validates the current draft as a new named definition without applying it. Retrieve loads a detached owned definition and its authorized category/organization. Apply returns to matching results; Cancel restores previous results/context. Navigation away safely discards temporary editor context. Product, journeys, main walkthrough, design, API guidance, security, acceptance and roadmap were updated. Filter schemaVersion 3 and API routes remain unchanged.

310 helper checks pass, including opening/closing, saving without application, detached retrieval, cross-category/context application, cancellation, lost membership, foreign owner and SYSADMIN retrieval denial. Repeated 70 responsive route cases at five widths: no overflow, separate Search form, Saved auction controls or list images. Every listing case has exactly one Open filters action and no form/save/retrieve controls; the dedicated view has its form and Save. Fifteen populated English editor cases verify two groups, independent operators, category-specific area availability and saved-library/save placement without overflow.

Browser evidence: saving an Alajuela draft stayed in the editor; Cancel returned six unchanged properties. Retrieve then Apply returned one matching asset. Retrieving a Vehicle/solo-organization definition loaded the car term with no area field; Cancel restored six Properties in the original organization, while Apply opened one Vehicle in the saved organization. A saved two-group definition restored outer AND, inner OR/AND and all four terms, and applied to one fictional item. Invalid draft saving opened no naming dialog; clearing/invalid editing followed by Cancel retained the prior one-item result. Evidence is separate-filter-view-behavior.json, layout-checks.json and filter-form-checks.json.

All 42 standard app screenshots were refreshed, with separate-view, populated library and grouped-editor variants. The two unchanged brand previews and existing additional filter variants bring the total to 49. Browser-back/reload persistence, live APIs, database/RLS execution and production deployment remain implementation gates. The local prototype resets on reload. The older inline-filter evidence above is historical and superseded by this workflow.

## Localized app name — 6 November 2026

Confirmed identity is Auctions in English and Remates in Spanish, with no v2 suffix or adjacent badge. Updated the app navigation/sign-in wordmarks, accessible Home labels, browser titles and footers. Added editable remates-dark.svg and remates-light.svg variants, preserving the supplied gavel paths. Removed the displayed badge from package/document headers and updated documentation/contract metadata to describe Auctions / Remates. Technical directories and the original supplied SVG are unchanged.

316 prototype checks pass. Eight browser cases (Spanish/English × discovery/sign-in × desktop/mobile) verified exact names, browser titles, zero version badges, localized footer prefixes and no overflow. Refreshed all 70 responsive route cases and confirmed Spanish Remates identity throughout. Updated all prior screenshots and added two English sign-in captures (51 total). Brand preview now shows both languages' light/dark editable wordmarks. Evidence: localized-name-checks.json and layout-checks.json. No production service was deployed; earlier integration limits still apply.

## Server-side item pagination specification — 6 November 2026

Confirmed server-side item pagination with selectable page size. Proposed default 25 and choices 5/10/25/50/100. Catalog item APIs now use page/pageSize and return items, page, pageSize, totalItems, totalPages, hasPrevious, hasNext and snapshotAt. Other resources retain their cursor contract. Saved filter ASTs omit pagination. Added reset/preservation, authorized counting, deterministic ordering, stale-page, failure and superseded-response acceptance requirements. The offline simulateItemPage adapter demonstrates bounded responses only; no live Spring endpoint, database paging query, network paging or production deployment was implemented or tested.

335 helper checks pass. Fifteen new pagination layouts across three categories and five widths verified the size choices, partial last page, boundary controls and no overflow. Browser behavior confirmed five first-page properties, one second-page property, correct range 6–6 of 6, disabled Next on the last page, preserved page after detail return and editor Cancel, size reset to page 1, zero-result navigation, organization/category reset and map inclusion of an item outside the current page. Evidence is item-pagination-layouts.json and item-pagination-behavior.json.

Refreshed the six affected default listing screenshots and added two partial-page captures (53 total). The prior 70-route and localization/editor layout records remain baseline evidence; they were not all repeated for this change. Structural checks verify item pagination query/response fields, bounded size choices and absence of page fields from saved Filter. Production server-side behavior remains an explicit implementation gate.

## Item tables and multi-sort

Replaced discovery cards with column-headed tables in Properties, Vehicles and Other. Mobile renders labeled rows and retains visible sorting controls. Header actions select primary direction; Add sort exposes ordered field/direction priorities with numbered indicators. The API accepts an ordered sort array; production must sort before server pagination, keep nulls last, use an ID tie-breaker and reject incompatible fields or mixed-currency amount ordering. The offline adapter demonstrates ordering before slicing; no production backend was run.

342 helper checks cover table rendering, priority validation, page reset, secondary precedence, ID ties and null placement. Fifteen browser layout cases across three categories and five widths show one table, correct column counts, no listing images and no page overflow. Browser actions verified adding a priority, selecting a field and primary header sorting. Updated affected listing/pagination screenshots and added a two-priority table preview. Other earlier screenshot/layout records remain baseline evidence.

## Single-line records and right-side actions

Reference and title now have separate columns; Tags and Notice buttons occupy the rightmost Actions column. Cells never wrap. Mobile scrolls the table horizontally instead of stacking cells. Fifteen browser cases across three categories and five widths measured 57 px rows, verified nowrap cells and two rightmost action buttons, no listing imagery and no page-level overflow. Tags opened its dialog and Notice opened synthetic evidence. All 342 helper checks pass. Updated affected previews and made regeneration tools tolerant of JavaScript declaration formatting. No production backend was deployed.

## Icon-only item actions

Replaced text row buttons with eye/Open item, tag/Tags and document/Notice icons; removed the visible Actions header while retaining an accessible column label. Each button has localized tooltip/accessible name and a 44 px target. Fifteen browser cases verified three controls per rightmost cell, empty visible header, icon-only button content, nowrap rows and no page overflow. Decorative action SVGs are explicitly excluded from the auction-imagery prohibition. All three actions were exercised successfully. Updated affected previews; existing backend/production validation limits remain unchanged.

## Colored tags in list view

Added a Tags column with labeled palette-based colored badges before the untitled icon controls. Kept single-line rows and horizontal badge overflow. Added ADMIN/MANAGER color selection at creation and update, a typed color API property and proposed SQL default/check constraint. Existing definitions fall back to gray; actual backfill/migration remains implementation work.

348 helper checks pass, covering creation, assignment, color propagation, invalid color rejection and USER denial. Fifteen listing cases verified the tag column, seeded colored badge, row height, icons and no page overflow. Fifteen settings role/viewport cases verified color controls for ADMIN/MANAGER only and no overflow. Browser creation/assignment showed green, blue and amber labels; changing a definition to purple updated its assigned badge. Another organization displayed none of those assignments. Evidence: table-layout-checks.json, tag-color-role-checks.json and tag-color-behavior.json. Updated affected listing, settings, pagination and sorting previews and added colored-tag examples. No live backend/database migration was performed.

## Multiple tags with truncation

The first two fictional property records now each show two colored tags. Badges shrink with CSS ellipsis instead of scrolling or wrapping; full labels remain in tooltips/accessibility text and the Tags dialog. Further assignments show +N after the first two badges. Fifteen responsive browser cases confirmed two multi-tag rows and four physically truncated badges at every tested width, while all rows remained 57 px and the page had no horizontal overflow. Updated list, pagination, color and sorting previews. The inactive-assignment check now uses an actually unassigned record, preserving its original purpose after the demo seed changed.

## Frameless controls, appearance modes and palette exploration

Removed persistent frames/fills/shadows from item-table buttons, retaining 44 px icon targets, hover feedback and keyboard focus outlines. Added Light/Dark/System appearance selection and independent Forest/Ocean/Slate/Terracotta palettes, with browser-local persistence and validated direct preview links. System resolves to the device preference and listens for changes; no device setting was modified during verification. Added a comparison page with eight light/dark previews and links into the prototype. These palettes are exploratory, not a confirmed final brand selection.

359 helper checks pass. Forty-eight browser combinations (four palettes × three modes × four widths) showed no overflow, correct effective appearance and frameless action buttons. Sixteen dark-surface cases covered filters, sign-in, overview and plans across all palettes. Reload retained the selected Ocean/Dark preferences, and a comparison-page link opened the requested combination. Defaults were restored to Forest/System after QA. Updated affected listing/pagination/color previews and added palette captures; other prior screen/layout records remain baseline evidence. Full contrast/accessibility audit and production preference integration remain acceptance gates.

## Warm blue palette

Added a fifth palette, Warm blue / Azul cálido, with indigo-leaning navigation/actions, warm ivory light canvas and violet-neutral dark surfaces. Both variants are on the comparison page and supported by direct links and remembered preferences. Twelve browser cases (four widths × Light/Dark/System) verified selection, effective appearance and no overflow. Light/dark previews were captured; 360 helper checks pass. Other palettes remain available and no final brand palette was selected.

## Navy palette anchored on #001B66

Added/verified Navy / Azul marino as the sixth exploratory palette. The exact #001B66 brand token anchors navigation in light and dark appearances, with coordinated supporting colors. Twelve browser cases across four widths and three appearance modes verified the exact token, selected palette, effective appearance and no overflow. Light/dark captures and comparison links are included. All 361 helper checks pass; prior audit/production limits remain unchanged.

## Sample catalog expansion — 11 November 2026

The editable prototype and data/demo-listings.json now contain 150 fictional records: 50 Properties, 50 Vehicles and 50 Other. The original ten samples are preserved. Deterministic generated records cover all supported subtypes, seven provinces, bilingual titles, CRC/USD amounts, review states and missing property areas. No real auction, personal, registry or vehicle identifiers are supplied. Generated records are intentionally unmapped.

1,002 prototype checks passed. Existing core regression truth tables run against the original ten fixtures; additional checks run against the full 150-record catalog and verify unique IDs, source snapshots, valid values, and complete duplicate-free pagination for every category at page sizes 5, 10, 25, 50 and 100. Historical browser screenshots and layout results above predate this data expansion; they are design evidence, not current record-count evidence. No new browser layout verification was performed for this data-only update.

## Optional other-round dates — 11 November 2026

Added the bilingual listing checkbox and optional Other rounds column. 1,073 prototype behavior checks passed, including visibility in all three categories, unchanged page/results, exclusion of the next round from other-round entries, matching next-event dates, distinct fictional round records and unknown schedule fallback. Package structural checks passed after fixture regeneration. Existing browser snapshots predate this option; no new browser layout checks were run.

## User column selection — 11 November 2026

Replaced the dedicated other-round checkbox with a bilingual Columns disclosure menu, immediate selection, per-user/category browser persistence and reset. 1,084 prototype checks passed, covering reload persistence, another user's defaults and isolated selection, category isolation, invalid selections, hidden table cells and preserved result pages. Browser interaction confirmed that enabling Other rounds and hiding Reference survives reload. Earlier dedicated-checkbox guidance is superseded. Backend account synchronization remains a specified implementation requirement, not a live feature.

## Specific round columns

Replaced the combined Other rounds menu choice with independent First, Second and Third round date columns. Regression checks cover event/date matching, independent selection, bilingual labels, missing dates and migration of legacy selections. No new browser screenshots were captured; the previous menu screenshot reflects the superseded combined option.

## Round time and base-offer columns

Added six independently selectable, bilingual columns: time and base offer for each of rounds 1–3. Automated checks cover round/event matching in all categories, persistence, missing values, zero offers, currency formatting and labels. Existing screenshots predate these additional choices.

## Studio appearance exploration — 11 November 2026

Added Studio / Estudio as a seventh selectable palette with table density and typography refinements. 1,158 prototype checks passed. Browser previews inspected in light and dark at the default desktop viewport; 25 rows rendered, measured row height 49 px including borders, no page-level horizontal overflow. Screenshots: studio-light.jpg and studio-dark.jpg. A full mobile/contrast audit has not been performed for this new option.

## Beautiful UI inspired Studio refinement

Reviewed the user-selected reference Records Table and adapted Studio with neutral graphite surfaces, quiet navigation, fine grid separators and rounded table containment. Light and dark desktop previews refreshed. 1,158 behavior checks passed; browser inspection showed 25 rendered rows and no page-level horizontal overflow. Mobile and full contrast verification remain pending for the refinement.

## Harbor theme exploration — 11 November 2026

Added Harbor / Puerto based on the supplied teal dashboard image, retaining all earlier themes. 1,159 prototype checks passed. Light and dark desktop previews captured; 25 rows rendered without page-level horizontal overflow. Mobile and full contrast review remain pending. Existing uncommitted Studio changes preserved.

## Warm blue component refinement

Applied the reference-inspired compact grid, rounded containers/navigation, flat sort toolbar and tinted identifiers to the existing Warm blue palette, following user clarification. Light/dark previews refreshed; 1,159 behavior checks passed. This is a desktop visual review; a complete mobile and contrast audit remains pending.

## Studio Warm Blue variant

Added Studio Warm Blue, sharing Studio component styling with warm ivory/indigo tokens and neutral navigation. Light and dark desktop previews captured; 1,160 behavior checks passed. Studio is the current refinement base. Full mobile/contrast review remains pending.

## Organization tag CRUD screens

Added bilingual list/detail/create/edit screens, sidebar and Settings links, and confirmed delete/archive modal. Browser exercised creation with purple color, rename, detail, edit cancellation and confirmed deletion; list returned to two original records. Five screenshots captured in Studio Warm Blue. 1,180 behavior checks passed, including USER denial, foreign-organization rejection, deleted-tag assignment rejection and retained historic assignments. Offline demonstration state resets on reload. Full responsive and production backend checks remain pending.

## Lucide icon standardization

Generated offline SVGs from pinned lucide-react, replaced custom list action paths and legacy glyph decorations, and retained the gavel as brand artwork. Browser Tags screen inspection found no non-Lucide button/navigation SVGs and no legacy glyphs in rendered text. Screenshot lucide-tags.jpg. 1,180 behavior checks and package validation passed. Generator dependencies and upstream license are included.
