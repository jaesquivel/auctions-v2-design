# Testing and acceptance criteria

The tests below are implementation release criteria. They are distinct from the package checks recorded in [validation report](../qa/validation-report.md). The local mockup cannot prove production security, availability, extraction precision, payment processing or legal compliance.

## Acceptance matrix

| ID | Requirement and screen | Scenario and expected result |
| --- | --- | --- |
| AC01 | FR01/03 S02 | Given fixed filters, when opening a shared URL and paging then returning from detail, the filters, sort and scroll context are restored; items are deduplicated and an invalidated cursor prompts refresh |
| AC02 | FR01/02 S04 | Given CRC min/max and an area limit, filtering uses AND across fields and OR within facets; missing values excluded unless opted in; min greater than max and missing currency fail inline and via API |
| AC03 | FR04 S03 | Given list results including one unknown location, map shows only supported locations, counts the omitted record and offers list access; approximate locations carry a precision label; provider failure retains list |
| AC04 | FR05 S05 | Given multiple event ordinals, detail shows each supported base and date in source timezone; a passed date without outcome remains unknown; no calculated later event appears |
| AC05 | FR06 S06 | Given a reviewed money field, opening its evidence reaches the correct revision, page and raw span; English UI preserves Spanish source text with language label |
| AC06 | FR07 S02/S03/S05 | Assign a tag directly to a previously untagged auction with no save step; duplicate assignment is idempotent; another organization cannot read/change it; removing the last tag leaves the auction discoverable |
| AC07 | FR08 S08 | The user sees and manages their own saved searches across organization switches; ADMIN/SYSADMIN cannot read or mutate another user’s search; pause/delete stops future delivery; retries deduplicate owner notifications |
| AC08 | FR09 S09/S10 | Given an invitation, only intended authenticated recipient can accept; expired/revoked invites fail; role change and removal invalidate access within the stated revocation window |
| AC09 | FR10 S11 | Given a USER on Team, paid features do not grant settings, tag-definition or billing administration; forged plan IDs and unsigned callbacks cannot activate entitlements; verified duplicate billing events are idempotent |
| AC10 | FR11 S12 | Given two SYSADMIN reviewers editing the same draft, first publish succeeds and second gets 409; the second draft remains recoverable; every published critical value has evidence and reviewer attribution |
| AC11 | FR12 all | Given Spanish and English at 320/390/768/1440 px, essential content wraps, controls have labels and keyboard access, focus is visible and source language remains unchanged |
| AC12 | FR13 ingestion | Given same bytes fetched twice, evidence is deduplicated without losing fetch observations; parser failure quarantines the run; source correction creates a new revision and links the prior one |
| AC13 | Nonfunctional | Representative search load meets proposed p95 target; production backup restore meets approved RPO/RTO; secrets and private content never appear in public bundles/caches/logs |
| AC14 | FR15/C09 deployment | Given separate instances for two countries using the same codebase, each loads only its configured adapter and catalog; another-country fixture is rejected by the wrong instance; alternate date/money conventions normalize in the matching instance |
| AC15 | C09 all roles and API | Given the CR instance, no public/user/admin screen offers country selection; country query/payload overrides return 400 even for CR, foreign regions return 400, foreign record IDs return 404, and mismatched configuration/database/adapter prevents startup; language switching preserves country |
| AC16 | C10 onboarding and all protected routes | Given a new uninvited identity, retrying onboarding creates one solo organization and one ADMIN membership before activation; invited onboarding joins the target organization without a duplicate solo organization; provisioning failure grants no app access |
| AC17 | C10 S02/S05/S10/S11 | Given solo and team organizations, auction tags/annotations and billing remain organization-scoped while saved searches remain user-owned; no personal variant is rendered or accepted by the contract; a user cannot lose their final organization or the organization its final ADMIN |
| AC18 | C11 roles/settings | ADMIN manages identity/users/tags; MANAGER manages tags but receives 403 for identity changes, invitations, role changes and billing mutations; USER cannot edit settings/tag definitions; legacy roles fail and the last ADMIN is protected |
| AC19 | C11/C13 tags | Users assign active tags directly to auction items; duplicate labels and foreign IDs fail; rename preserves assignments; deactivation blocks new assignments but preserves history; all operations remain organization-scoped |
| AC20 | C12 system access | SYSADMIN can edit allowlisted system settings and start approved operations; organization ADMIN/MANAGER/USER without the system grant receive 403; invitations/membership changes reject SYSADMIN as an organization role; revocation denies subsequent mutations |
| AC21 | C09/C10/C12 boundaries | A SYSADMIN with organization USER remains unable to manage organization settings/users; no automatic foreign-organization access is granted; country remains immutable; settings versions conflict safely and ingestion approval/idempotency/evidence checks still apply |
| AC22 | C13 no Saved feature | Navigation, cards, detail, contract and storage expose no saved/favorite auction-item state; direct tags and discovery tag filters replace that workflow |
| AC23 | C14 ownership | Only the search owner can read/update/delete; organization switching preserves ownership; context loss suspends execution; organization deletion preserves the definition and clears context; workers never notify another user or bypass context access |
| AC24 | C15 list/detail | Every auction list row is image-free; a member opens Images on any auction item and attaches files without a save/tag prerequisite; another organization cannot see those attachments |
| AC25 | C15 uploads | Production verifies scope, actual MIME/bytes, size, hashes and upload completion; rejected/processing images are not served; expired URLs fail; member images never replace official evidence or appear in public listing payloads |

## Layered test strategy

Unit tests target filter normalization, locale money/date parsing, date precision, event projection, permission resolution and entitlement transitions. Avoid tests that merely repeat setters. Property-based tests are appropriate for amount separators, min/max constraints, cursor signatures and idempotency key scope.

Integration tests use ephemeral PostgreSQL with migrations and a restricted app role, exercising cross-tenant queries, optimistic locks, outbox and duplicate delivery handling. Test Clerk token profiles with valid, expired, wrong issuer, wrong audience where applicable, wrong organization and rotated keys. Test current membership removal and concurrent quota mutations. Use provider sandbox callbacks for billing and email; do not test using live charges or unsolicited real messages.

Extraction tests compare against independently labeled source spans and exact normalized facts. Include OCR confusion, truncated notice, contradictory dates, multiple assets, repeated notices, cancellation and unknown coordinates. Report precision, recall, coverage and confidence intervals by source type; aggregate accuracy alone is inadequate for rare critical errors.

End-to-end journeys cover discovery → evidence → direct tags → user-owned search alert; invitation → role change; correction → publication → delivery. Accessibility testing includes automated audits, keyboard-only navigation, focus restoration and screen-reader checks in both languages. Manual visual review at mobile/desktop widths covers long translated labels, large fonts, no-result state and offline source. Security review includes IDOR, XSS, SSRF, webhook replay, CSRF and cache isolation. Performance tests use the explicit capacity assumptions and report infrastructure configuration.

## Release ownership

Product signs off discovery, locale copy and scope. Engineering signs off contract/data consistency and deployment recovery. Operations signs off source permissions, review staffing and extraction evaluation. Security/privacy signs off tenant isolation, personal-data handling and approved policies. Commercial owner signs off pricing and provider lifecycle. A failed gate blocks the relevant production capability; a mockup demonstration does not waive it.

## AC17 — Three primary auction listings

At desktop and mobile widths, Properties, Vehicles and Other are directly reachable and the selected listing is indicated. Each heading and result set matches its category; no cross-category item appears. English and Spanish labels agree. Subtype options match the selected section. Vehicle/Other views contain no property-area controls or area row facts. All rows remain image-free. Clearing filters keeps category; switching section resets incompatible filters. Item and Notice navigation preserves or derives category context.

Save a Vehicle search, switch to Properties and change organization: the owner still sees the Vehicle search and its category; another user cannot access it. Apply/remove tags and attach images on Vehicle/Other items with the existing organization boundaries. API integration gates: missing/invalid category 400, incompatible subtype or non-property area 422, cursor/category mismatch 409, category-correct counts/maps and no invented coordinates. Ingestion gates: ambiguous category remains unpublished, mixed-category notice links preserve lot semantics, corrections retain IDs/evidence/research and notifications are deduplicated. SQL/API gates remain specifications, not executed integration tests.

## AC19 — Filter-only discovery

All three listings show no standalone search form or Search button. Every matching input, including optional text/reference, belongs to the single filter form. Editing text and province alone leaves the result set unchanged; Apply filters evaluates both together. Enter in text/reference submits that same form. List and map share applied criteria. Save filters validates and captures the current editor draft without applying it, and remains user-owned across organization switches. Clear retains category and clears text/structured criteria together. Verify Spanish/English and desktop/mobile with an accessible Filters disclosure.

## AC20 — Grouped Boolean filters

Verify inner AND and OR with outer AND and OR against known fictional truth tables, explicit parentheses, multiple terms/groups and duplicate terms. Draft changes to operators, fields or group structure leave results unchanged until Apply. Invalid/empty groups preserve the last applied result set. No groups matches the category catalog. Save/restore retains every operator/value and a detached snapshot; context/owner controls remain intact. Confirm list/map/count/digest equivalence and revision deduplication in production integration tests.

Reject unknown fields/operators, incompatible subtype/area, blank text, foreign tag IDs in any OR branch, invalid money/currency and excessive groups/terms/depth/bytes. Unknown values match only explicit isUnknown. Category/country/tenant predicates cannot be bypassed by OR. Inspect SQL binding and malicious value tests before release. Test 10-group/20-term/100-total bounds and practical query-cost limits with representative data. Verify Spanish/English controls, unique labels and mobile wrapping. This supersedes AC19's implicit all-criteria conjunction while preserving its filter-only interaction and applied/draft distinction.

## AC21 — Separate view with save/retrieve

Every list/map exposes Open filters and contains no inline form, Save or Retrieve controls. The separate view shows grouped controls and Save/Retrieve on desktop/mobile. Saving a valid draft creates an owned definition without applying it; incomplete drafts fail without opening a naming step or changing results. Retrieving copies every operator, term and value, restores the displayed authorized category/context and leaves the applied definition unchanged. Editing that copy does not mutate the saved original. Cancel restores prior criteria/context and result mode; Apply returns to matching results. Switching category through retrieval updates the draft's subtype/area controls correctly.

Test same-category and cross-category retrieval, multiple organization memberships, context loss, foreign owners (including ADMIN/SYSADMIN), validation errors, Clear without Apply, invalid naming, duplicate names as distinct IDs and a failed retrieval preserving the draft. Verify keyboard labels, no overflow and direct editor route. A later production test must cover browser-back/reload behavior; it is not claimed by the local state-only prototype.

## AC23 — Server-side pagination and selectable size

For each category verify default size, every offered size, first/next/previous/last pages, partial last page and zero results. Rows and visible range must agree with server totals; no response may exceed pageSize. Changing size/filters/category/organization resets page 1, whereas editor Cancel and detail return preserve it. Saving/retrieving a draft neither stores nor applies page state. Map results must include matching locations outside the current list page.

Production integration gates: network inspection proves the browser requests only one server page; database filtering/authorization precede count/order/paging; count has no join duplicates; integer/size validation rejects malformed and unsupported input; stale out-of-range pages recover once; changing totals and equal/null sort values retain deterministic tie-breaking. Superseded responses cannot replace a new request, and failure preserves the last successful page. Test inaccessible totals, foreign organization terms, rate/cost bounds, mobile wrapping and keyboard status. The offline adapter verifies interaction and response shape only; it is not a live backend test.

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
