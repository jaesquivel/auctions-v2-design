# Auctions / Remates product requirements

## Purpose and scope

Help a researcher find potentially relevant judicial auction properties, understand what a published notice says, inspect the original evidence, and track changes with an organization workspace, including a one-person organization. The application aggregates and organizes source material. It does not determine title, occupancy, encumbrance validity, investment return, auction eligibility, or whether an auction will occur.

The audience includes individual property researchers, analysts comparing opportunities, teams organizing research, and operations reviewers correcting extracted records. These personas are proposed; no user interviews were available.

## Outcomes and measures

Proposed pilot targets: at least 80% of usability participants can find a matching asset and open its source within three minutes; 100% of published critical values have source evidence and review status; no private workspace access across tenants in authorization tests. Measure saved-search creation, source-open rate and repeat research sessions with consent-aware, minimized analytics. Conversion and revenue targets remain open until pricing and audience are validated.

## Functional requirements

| ID | Priority | Required behavior | Acceptance reference |
| --- | --- | --- | --- |
| FR01 | MVP | Filter criteria: optional text/reference, subdivision within the configured instance country, asset type, notice status, next scheduled event range, base currency and amount, area, tags and evidence availability | AC01, AC02 |
| FR02 | MVP | Combine fields with AND; multiple values in one facet with OR; use explicit unknown-value controls | AC02 |
| FR03 | MVP | Share URL state; deterministic ordering and cursor paging; restore view after detail | AC01 |
| FR04 | MVP | List and map share filters; exclude ungeocoded assets from pins while keeping a visible count and list | AC03 |
| FR05 | MVP | Detail shows asset identity, next event and event history, original amounts and currencies, missing fields, quality flags and notice provenance | AC04 |
| FR06 | MVP | Notice detail retains original text, source locator, revision and evidence highlights; no unmarked translation | AC05 |
| FR07 | MVP | Assign/remove available organization tags directly on auction items; optional organization notes are independent; no saved-item state | AC06, AC19 |
| FR08 | MVP | Users create, edit, pause and delete their own saved searches and notification preferences; organization role never transfers ownership | AC07, AC23 |
| FR09 | MVP | Clerk sign in, mandatory organization onboarding, organization switching, members and invitation handling | AC08 |
| FR10 | MVP | Server-side roles and subscription feature checks; billing state displayed accurately | AC09 |
| FR11 | MVP | Reviewer queue with evidence, correction reason, concurrent-edit protection and audit trail | AC10 |
| FR12 | MVP | Spanish and English UI, locale-aware numbers, currency and dates; original legal source retained | AC11 |
| FR13 | MVP | Ingestion retries, duplicate handling, source revisions, quarantine, release and stale-source flags | AC12 |
| FR14 | Next | Workspace exports, comparison views and richer event notifications | Separate approved contract before delivery |
| FR18 | MVP | Auction list rows contain no images; item detail has an Images tab where organization members attach images | AC24, AC25 |
| FR17 | MVP | SYSADMIN controls system configuration and instance operations through separately authorized screens and endpoints | AC20, AC21 |
| FR16 | MVP | Exactly ADMIN, MANAGER and USER roles; ADMIN manages full organization settings/users; ADMIN and MANAGER manage available organization tags | AC18, AC19 |
| FR15 | Later | Additional single-country deployments using shared software, country adapters and jurisdiction-specific taxonomies | AC14 |

### Search semantics

The software supports multiple countries, but each instance runs for exactly one deployment-configured country. The reference instance is configured for CR; country is not a search filter, URL option, user preference or administrator setting. Changing UI language does not change country. UI locale defaults to es-CR in the CR instance, and currency is CRC only when an amount bound is entered. A mixed-currency result set may be shown but cannot be ordered by amount until a currency is selected. An absent amount, date, area or district remains null and never becomes zero, today, or an inferred address. Unknown values are excluded by corresponding numeric or date filters unless an explicit include-unknown control is enabled. All scheduled dates are source-derived, not predictions. Event ordinals are separate rows, never separate assets.

Public tags such as “land” describe catalog taxonomy. Private tags such as “review with team” belong to a workspace and are never included in public search or indexing. Public source facts and private researcher notes are visibly distinct. ADMIN and MANAGER edit available organization tag definitions, sanitized and deduplicated within the organization and limited to 40 characters. Proposed USER behavior permits assignment of existing active tags, not creation or renaming of definitions. These tags are separate from the public catalog taxonomy.

### Status and freshness

Use separate states for ingestion (fetched, extracted, review_required, published, quarantined), record quality (needs_review, reviewed), and reported event status (scheduled, postponed, cancelled, concluded, unknown). A past event time does not prove a sale or conclusion; absent a confirming source, show “scheduled date passed; outcome unknown.” Review means a person checked the transcription, not that the underlying facts were independently verified. Always display source publication date and last checked time. The default stale warning threshold is a proposed 48 hours since a successful source check.

## Images on auction detail

Confirmed C15: auction listings contain no images or thumbnails. Detail provides an Images tab for organization members to attach images directly to the auction item, without tagging or saving it first. Proposed visibility is within the active organization; attachments are member-supplied material, not official notice evidence or verified property photography. Proposed constraints are JPEG/PNG/WebP, 10 MB per file and 20 attachments per organization/item. Production processing validates actual bytes, scans/re-encodes approved formats and removes metadata before display. These policy limits and uploader/ADMIN deletion rules require product/privacy review.

## Direct auction tagging and user-owned searches

There are no saved, bookmarked or favorite auction items. Users apply available tags directly from discovery cards or asset detail and find items through tag filters in discovery. Assigning the first tag does not create a save; removing the final tag does not remove or hide the auction item. Optional notes remain an independent organization annotation, not a saved-item collection.

Searches may be saved and belong to the authenticated user. A user can manage their own searches across organization switches. An optional/validated organization execution context scopes private tag filters and plan limits, without giving that organization ownership. Loss/deletion of the context suspends execution; the owner retains their search and can delete or re-scope it to an authorized context. No automatic reassignment to an organization administrator occurs.

## Mandatory organization membership

Every application user belongs to at least one organization. An individual researcher uses a one-person organization under the same ownership, role, billing and data-isolation model as a team. There is no personal-workspace fallback. Organization membership is a baseline account invariant, independent of paid plan. Proposed onboarding joins an existing organization through a verified invitation or creates a solo organization with the user as ADMIN. A user may belong to multiple organizations and selects an active organization only among valid memberships; a single membership is displayed as context without requiring a choice.

Anonymous catalog visitors under P09 have no application account. A signed-in identity cannot finish activation or use protected app features until organization membership is established. Provisioning failures remain in a recoverable onboarding flow. A user cannot leave or be removed from their final organization unless another membership is established or the account is closed through the approved deletion workflow. Organization deletion likewise needs a member reassignment/account-closure plan.

## System administration

SYSADMIN configures and operates the deployed instance. It is a system-level grant separate from ADMIN/MANAGER/USER organization membership. Every SYSADMIN still belongs to an organization. Organization ADMIN does not confer SYSADMIN. Proposed initial tasks include pausing/resuming ingestion, setting an approved source-check cadence, starting approved ingestion runs and reviewing/publishing extracted facts. System configuration fields are allowlisted and audited; secrets, arbitrary source URLs, organization role assignment and country switching are not generic settings fields. Cross-organization private research access is not automatically granted by the proposed SYSADMIN policy.

## Subscriptions and entitlements

Subscription is a paid product concept; saved-search subscription is a notification preference. UI and APIs distinguish the two. Proposed bundles are Explore (public search and source access), Research (direct auction tagging, optional notes and user-owned search notifications), and Team (additional collaboration capabilities within an organization). Subscriptions, billing customers and execution entitlements belong to organizations; saved-search ownership belongs to the user. Proposed quota accounting uses the search’s execution context, not ownership. All billing subscriptions and customers belong to organizations, including solo organizations; no user-owned subscription exists. All plans retain the mandatory organization model and role checks. No price or allocation is approved. Prototype unlocks all screens for review and takes no payment. Commercial configuration owns numeric limits; a downgrade disables creation above the new limit, pauses excess alerts with notice, and preserves user-owned search definitions and organization annotations until an approved retention policy says otherwise.

## Quality requirements

Proposed SLOs: 99.5% monthly catalog availability; p95 search API under 800 ms for the stated load assumption; p75 largest contentful paint under 2.5 seconds on representative mobile conditions; ingestion freshness within 24 hours of source availability, measured separately from source outages. Accessibility target is WCAG 2.2 AA with keyboard and screen-reader review, not an untested certification. No proprietary source material is required to open the package.

## Explicit exclusions

No bidding, judicial deposit payments, automated title verification, legal advice, guaranteed completeness, inferred market discounts, lead sale, or automatic translation replacing original notices. Photographs must have provenance and usage rights; when absent, show an honest placeholder. Consumer mobile native apps, marketplace transactions, and non-CR adapters are outside the proposed MVP.

## Release definition

Release requires approved source access and privacy policies, a labeled extraction evaluation, human review operations, authorization and billing tests, an exercised backup restore, accessibility review, and product signoff of all MVP acceptance cases. The present package is a reviewable specification and prototype; it does not satisfy these production gates by itself.

## Auction-first product organization — confirmed C17

The primary experience consists of Properties, Vehicles and Other listings. Each supports a single category-relevant filter workflow, direct organization tagging, item detail, Notice evidence, member Images and user-owned saved searches. No auction list displays images. Country is deployment-fixed across all three sections. Organization permissions and subscriptions apply consistently to each section; no category-specific paywall is confirmed.

Proposed: shared amount/currency, schedule/status, extraction quality, location and organization-tag filters. Property subtype and land/floor area apply to Properties only. Initial vehicle subtypes are car, motorcycle, truck and other vehicle; initial Other subtypes are equipment, inventory and other. Vehicle make/model/year and detailed equipment attributes are future evidence-backed fields, not fabricated prototype facts. Display only source-supported attributes; do not show area controls or property labels in Vehicles/Other. No bidding or legal certification is implied.

## Filter-only discovery — C19

Every result set comes from one applied filter definition: category plus any selected criteria. There is no separate search input or Search action. Proposed optional Text or reference / Texto o referencia is inside the filter form. Apply filters submits all criteria together, using the explicit group operators. Unapplied edits do not change results; Save validates and stores the current editor draft. Clear resets the editor draft while retaining its category; Apply is required to change results. Save filters stores the validated draft for the signed-in user, with existing execution context and alert behavior. No saved auction-item feature is introduced.

## Grouped filters — C20

Users add/remove groups and terms, choose a field, compatible comparison and value for each term, choose AND/OR within each group, and choose AND/OR between groups. Apply filters validates and atomically replaces the applied expression. Editing any term/operator or adding/removing a group leaves results unchanged until Apply. Save filters stores the validated editor draft, with category and user ownership. List/map/counts and alerts evaluate the same expression.

Example: (Province = San José OR Province = Alajuela) AND (Type = House AND Quality = Reviewed). Parentheses are displayed in the applied summary. Proposed fields in the prototype are text/reference, province, compatible subtype, organization tag, currency, base, property area and quality. Numeric comparisons support equals/at least/at most; explicit Not reported is available for base and area. A base comparison carries its own currency, so OR does not compare unlike currencies. A missing amount/area never becomes zero. More fields remain subject to source-supported data availability.

## Separate filter workspace — C21

Properties, Vehicles and Other listings show auction items, an optional applied-expression summary, and Open filters. They contain no inline builder, Save filters or Retrieve control. The separate view contains the grouped editor, Save filters and a user-owned saved-filter collection with Retrieve actions. Save validates the current draft and creates a named copy; it does not apply, overwrite or modify any earlier definition. Retrieve restores the full grouped expression into a draft, not live results. Apply validates and returns to results; Cancel discards the draft and restores the prior listing context. Clear in the editor clears only its draft. This supersedes prior statements that Save always captures only the applied definition.

Saved definitions remain visible to their owner across organization changes. Unavailable context disables retrieval. Proposed retrieval restores the explicitly displayed original category and organization, with current membership/role revalidated, so private tag criteria execute in their intended context. No ownership transfer or organization-administrator override is introduced.

## Server-side item pagination — C23

Each item listing requests and renders one bounded server page. The server applies mandatory country/category/publication/organization constraints and the full grouped filter before counting, sorting and paging; the browser must not fetch the complete matching catalog and paginate it locally. The page-size control offers a bounded set of choices, with no All items option. Proposed choices are 5, 10, 25, 50, 100 and default 25. Previous/Next, page number/count and visible item range use server metadata.

Changing applied filters, category, organization or page size resets to page 1; preserve size across those transitions. Cancelling the filter editor, saving/retrieving a draft and returning from an item preserve the current page until Apply. Saved definitions and alert matching contain no page/pageSize. Empty results show zero range and disabled navigation; partial last pages use the actual returned count. Page-size preference persistence beyond the current browser session is not confirmed. Map clusters are a separate bounds-based server query and are not restricted to the current item page.

## Item table and prioritized sorting

Confirmed: use column-based tables for auction listings and allow sorting on one or more values. Common columns are item/reference, reported location, subtype, published base, next event and organization tags; Properties also has area. No listing imagery is introduced. On mobile, the single-line table scrolls horizontally and the same sorting controls stay available.

Click a sortable column header for a primary ascending/descending sort. Add sort appends a priority; users can select its field/direction or remove it. Numbered header indicators show priority. Sort happens on the server before item pagination, with nulls last and item ID as the final deterministic tie-breaker. Changing sort resets page 1 and preserves size. Distinct fields only, maximum five priorities proposed. Amount ordering requires a single-currency scope; never compare raw CRC/USD amounts. Area is property-only. Sort is request/presentation state outside the saved expression; saving sort preferences with definitions remains unconfirmed.

GET item listing endpoints accept sort as a JSON array of {field,direction} in priority order. Backend validates allowlisted fields/directions, compatible category and single-currency scope and binds/allowlists ordering rather than interpolating user SQL. Counts are unaffected by sort. Cache/request identity includes sort. The offline adapter demonstrates sorting before slicing; actual server ordering and stable database pagination remain production integration gates.

Acceptance: verify multi-value precedence, both directions, equal values/ID ties, null placement, page reset, currency/category constraints, accessible header controls and mobile labels. Use the mockup Add sort control rather than requiring a keyboard modifier.

## Single-line item records

Confirmed: each auction record occupies one line. Reference and item title have separate columns; cell text never wraps. Tags and Notice buttons are grouped in the rightmost Actions column. Long titles/locations may ellipsize visually with full text available through the title attribute and item detail. No stacked reference, badges or inline notice links remain in the item cell. This supersedes compact multiline mobile rows: narrow screens scroll the table horizontally, retaining one-line records and a right-aligned action column. Sorting and server pagination behavior stay unchanged.

Verify row/cell heights, no wrapping, rightmost action placement, keyboard access to the scroll region and buttons, accessible column headers and no page-level horizontal overflow at 320–1440 px.

## Colored organization tags in listings

Confirmed: assigned tags have colors and appear in the list view. Show their labels as colored badges in a Tags column before the untitled icon controls. Keep one-line records; multiple badges scroll horizontally within the cell, with keyboard focus and readable labels. Color never replaces label text or implies legal/verification status. Unassigned items show an em dash. Assignments and colors remain organization-scoped.

Proposed palette: gray, blue, green, amber, red and purple, with predefined readable foreground/background pairs and gray fallback. ADMIN/MANAGER choose the definition's color when creating or updating it; USER assigns existing definitions. A color change keeps the stable tag ID and updates all its badges, not filter matching or item identity. Tag DTO includes color; create defaults to gray, patch validates the allowlist and expected version. Existing definitions require a gray backfill in production. No migration/database execution is claimed.

## Organization-owned property fields

Confirmed: property records include user-editable notes and appraisal amount owned by the organization, with scope `(workspaceId, assetId)`. Members of the same organization share these values; another organization has its own values for the same property. Properties use a Lucide Pencil action instead of Eye to open the editor. Vehicles and Other retain their existing open action. Source notice/extracted data remain unchanged.

The prototype property editor includes notes (up to 10,000 characters), optional non-negative appraisal amount (up to two decimal places) and currency (CRC/USD in this instance). Empty amount clears the appraisal. Save validates all fields atomically; Cancel discards unsaved edits and returns to the listing, preserving item pagination. Existing organization notes are reused. Additional editable fields are confirmed as a future need; names/types are unspecified and no extra fields are invented here.

Proposed permissions follow existing research-edit access: ADMIN, MANAGER and USER; membership must be validated server-side. Prototype state resets on reload. Annotation input/response now allow optional nullable `appraisal: Money`; production must restrict appraisal to Properties, reject invalid currencies/amounts and use expected-version checks. SQL design adds nullable appraisal_amount/appraisal_currency to asset_annotation with paired-null and non-negative checks. No database migration or production service has been executed.

## Unified property detail and editing

Confirmed: property viewing and editing use one screen, with the same information, layout and tabs. The property title and Pencil list action both open asset detail. Notes and appraisal fields are editable directly in the Overview tab alongside the published information, auction schedule and tags; the Images tab remains available. Save stays on that screen; Cancel restores the last saved field values. Organization scope remains implicit in the UI. The previous separate property-edit screen is removed; old links resolve to asset detail. Source notice data remains read-only. Prototype field values persist only in memory during the session. Earlier separate-editor descriptions/screenshots are superseded.

## Auction tab — second item tab

Confirmed: Auction / Remate is the second tab after General info for every item category. It contains round numbers, base offers with currencies, dates/times and configured timezone; whether this item is sold individually or as part of a lot; and links to the auction's other items. Lot references and links to fellow lot members appear when applicable. General info retains item attributes, editable notes/appraisal and tag labels; schedule and auction base information move into Auction. Remaining tabs follow Auction in their prior category-aware order.

Demonstration fields: auctionId, saleMode (individual/lot), lotId and existing auctionRounds. Five fictional items are grouped per auction example; generated examples 07 and 08 in each category share a lot and its schedule/base. Distinct individually sold items can retain their own schedules/base offers. These synthetic relationships are UI examples, not verified auction data. Open DEMO-A07, DEMO-V07 or DEMO-O07 for a lot example. Missing relationships or schedules must use explicit unknown/not-reported states, not inferred real-world facts.

Proposed production model: Auction groups source-evidenced sale units; a sale unit is individual or a lot and links its member assets. Round dates/times and base money attach to that sale unit, avoiding a duplicated lot price per member. Preserve source evidence, version changes and explicit currency; never sum member prices into a lot base or infer lot membership from proximity in a notice. Existing API/SQL grouping extensions remain implementation work; this prototype adds fixture relationships and UI without executing migrations or connecting a backend. Link resolution must preserve access checks and return an unavailable state for inaccessible items.

## Conditional round participation guarantees and participation fees

Confirmed: the Auction rounds list shows Participation Guarantee and participation fee amounts when calculable from explicit notice terms or verified applicable country law. Missing/ambiguous/conflicting bases must display Not available, never an assumed zero. Show currency and traceable calculation provenance. Treat Participation Guarantee and participation fee as distinct amounts. Values attach to the applicable round and sale unit, so a lot amount is not duplicated per member as a separate obligation.

Production specification: retain the source clause or legal citation, effective dates, jurisdiction, rule version, applicability, calculation basis, currency, rounding rule, result and review status. Resolve notice/law conflicts through review; do not silently choose precedence. Use exact decimal/minor-unit arithmetic; no silent FX conversion. Recompute on relevant source/rule revisions and audit changes. Country rules are deployment-owned, not user-selectable. No real country-law formula is implemented by this update.

Prototype demonstration: only A07/A08 have explicit synthetic notice terms, labeled as fictional in the notice: 10% guarantee, half-up cent rounding, and CRC 5000 fee per round of the shared lot. These are demonstration inputs, not Costa Rican legal guidance. Other examples display Not available. Calculated cells expose notice/rule reference in their title. Backend calculation, legal-rule verification and API/schema extensions remain implementation work.

Terminology: Participation Guarantee / Garantía de participación is the confirmed label for the guarantee amount.
