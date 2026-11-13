# Data model and storage

The proposed PostgreSQL model separates a global evidence catalog from tenant-private research. [schema.sql](../data/schema.sql) is an executable initial design, not a production migration history. [ERD](../diagrams/data-model.mmd) is editable Mermaid; [diagram preview](../diagrams/index.html) provides a dependency-free visual summary. PostGIS is a proposed extension for production maps and is not required by the initial SQL.

## Country per instance

The shared schema supports deployment to different countries. Each instance database contains exactly one jurisdiction row, provisioned by deployment tooling and checked against INSTANCE_COUNTRY at startup. The singleton constraint and country foreign keys prevent mixed-country assets, notices and sources. Application and organization administrators cannot insert or change jurisdiction configuration. Runtime credentials receive no jurisdiction write privilege; changing country means provisioning a separate instance and its own data resources, not editing an active catalog. Country columns are retained as provenance and validation, never as user-selectable scope.

## Catalog aggregates

| Entity | Responsibility and identity |
| --- | --- |
| jurisdiction | Exactly one deployment-provisioned country profile per database, including locale, timezone and adapter version; reusable across countries without CR-specific core columns |
| source | Approved source configuration reference, jurisdiction, enabled state; secrets live elsewhere |
| source_document | Immutable content hash, storage key, URL, fetch and publication timestamps, media type; bytes deduplicated within a source |
| ingestion_run | Fetch/extract lifecycle, adapter version, input and error summary; retries are separate attempts |
| notice | Stable logical notice with current revision number; revision identity survives source corrections |
| notice_revision | Immutable original text, language, document locator, review state and extraction version |
| extraction | Draft normalized fields, evidence and version; immutable evidence is retained after publication |
| asset | Global stable identity, jurisdiction, type, nullable source facts and reported status |
| asset_notice | Many-to-many link: one notice may describe multiple assets and one asset has many notices |
| auction_event | Ordinal and source-derived schedule/base/status for one asset, pointing to supporting notice revision |
| field_evidence | Entity/field locator, raw value, normalized JSON, page/span and confidence; review history separately audited |
| catalog_tag and asset_tag | Public controlled taxonomy, separate from workspace tags |

An asset registry reference is optional and country-specific. Do not merge solely on a court case number: one case can contain several assets and events. An event base belongs to a particular event, not a timeless asset price. The catalog projection exposes nextBase and nextEvent derived from the next applicable event; SQL stores the original event facts. For source date-only schedules, starts_at is null, local_date is populated and precision=date. An unknown timezone blocks a timestamp interpretation until reviewed.

## Private and operational entities

| Entity | Responsibility |
| --- | --- |
| app_user | Clerk user ID, locale and required primary organization workspace; no password/card storage |
| workspace | Organization research area with a required unique Clerk organization ID; kind is always organization |
| system_role_assignment | Instance-wide SYSADMIN grant/revocation associated with an existing organization-member user; trusted provisioning only |
| system_settings | Singleton allowlisted system settings with optimistic version; country is not mutable here |
| membership | Current role and status mirrored from Clerk with sync timestamp |
| asset_image | Organization/asset attachment with uploader, object key, processing status, MIME, size and timestamps; separate from official evidence |
| asset_annotation | Independent optional organization note on an asset, with version; not a saved-item flag/collection |
| organization_tag | ADMIN/MANAGER-managed definition with organization-scoped normalized label, active state and version |
| asset_tag_assignment | Direct organization/asset/tag tuple; composite organization FK to definition and direct asset FK |
| saved_search | User-owned normalized filters/preferences with validated nullable execution context; ownership never passes to the organization |
| alert_delivery | Saved search, user, asset and revision unique notification identity and delivery state |
| subscription | Workspace’s provider subscription ID, status and plan key; effective feature configuration is server-owned |
| webhook_receipt | Provider/event ID uniqueness; processing status and sanitized metadata |
| idempotency_receipt | Actor and route scoped mutation replay with request hash and expiry |
| outbox_event | Transactional publication and delivery tasks with retry state |
| audit_event | Actor, workspace when relevant, action, object and redacted before/after metadata |

Every app_user has a required primary organization and an active membership in that organization, enforced by a deferred composite foreign key. The primary organization is an account-membership anchor, not a personal workspace or a limit of one organization per user. Active session organization may be any current membership. Workspace ownership is expressed through ADMIN membership, not an owner_user_id variant. Create the organization mapping, user and ADMIN membership in a single local transaction after provider provisioning succeeds; invitation-first onboarding uses the accepted organization instead. Last-organization removal must reassign this anchor to another active membership or complete the approved account-closure workflow.

Clerk is authoritative for authentication and organization membership. Billing provider is authoritative for paid events. PostgreSQL stores the synchronized application state and entitlement projection. Reconcile missed webhooks periodically. User deletion must be reconciled with shared research ownership; proposed policy retains research under its existing organization ownership while deleting or anonymizing personal attribution subject to approved retention requirements.

## Member image storage

asset_image references organization workspace and asset directly; no tag, annotation or saved-item row is required. Proposed records track the uploader, server-assigned object key, content type, byte size, hash and pending/processing/ready/rejected/deleted state. Organization RLS prevents cross-organization reads. Private objects use bounded signed URLs only after authorization; pending/rejected objects are not rendered as trusted images. Upload completion verifies storage size, decoded type and integrity before processing. Deletion/retention is proposed and must be approved; no legal or photographic verification is implied.

## User-owned search storage

saved_search.owner_user_id is required and immutable. context_workspace_id is execution context only, nullable on organization deletion with ON DELETE SET NULL. A search remains user-owned and is suspended effectively when context is missing, membership is lost or entitlements prevent execution; its user-selected enabled preference need not be overwritten. Owner-authorized editing/re-scoping must revalidate private tag references. No organization or SYSADMIN ownership bypass is granted.

RLS for saved_search checks a trusted transaction-local app.user_id against owner_user_id. Alert delivery checks the recipient/owner identity; its FK ties (search_id,user_id) to the search owner, not to a mutable execution context. Historical delivery context is separate and can become null. Application services and workers still validate current execution context and entitlements. Organization deletion must not cascade-delete or transfer user-owned saved filters. No live migration is performed by this package.

## System role storage

Keep membership.role restricted to ADMIN/MANAGER/USER. SYSADMIN is stored in system_role_assignment, independently of organization membership. A SYSADMIN remains an app_user with a required primary organization. Proposed grants/revocations are provisioned through a trusted deployment/security process, not by organization administration or public API payloads; audit each change. A dedicated authorization repository can read these records across the instance, while ordinary tenant repositories cannot update or enumerate them.

System settings are a singleton row containing only ingestion_enabled, source_check_interval_minutes and version. The configured country remains in the immutable deployment/jurisdiction profile. Settings and grant writes require dedicated service permissions and auditing; there is no global tenant-data bypass.

## Role and controlled-tag constraints

Membership.role accepts exactly ADMIN, MANAGER or USER. The proposed solo bootstrap assigns ADMIN. Last-ADMIN protection is a mandatory transactional service validation awaiting integration testing. The existing deferred user-membership FK still enforces required organization membership. No automatic legacy-role conversion is applied: review prior access explicitly, including any previously read-only users, before assigning one of the new roles; unknown roles fail closed.

Tag definitions have stable IDs, labels of up to 40 characters and unique normalized labels per organization. ADMIN/MANAGER manage definitions. Tag assignment routes identify the asset and tag directly, without any save state. The assignment table uses workspace_id in the definition FK to prevent foreign-organization assignments and references the asset directly; no annotation prerequisite exists. Service checks enforce active state for new assignments and at most 20 assignments per asset and organization. Renames preserve IDs, deactivation preserves history, and both tag tables use workspace RLS.

## Types and constraints

Use UUID primary keys; timestamptz for instants; IANA timezone strings for interpretation; numeric(20,2) plus CHAR(3) currency for event money; numeric(20,4) for area; bounded coordinates with explicit precision. Currency has no implicit FX rate. A composite revision key links asset evidence and events to the exact notice revision. Referential integrity prevents orphan tag assignments. SQL CHECK constraints enforce nonnegative amounts, confidence [0,1], valid country codes and workspace shape. Cross-entity country consistency and valid IANA zones need service validation or reference data.

Every mutable private row has created_at, updated_at where relevant and version. Append-only source documents, notice revisions and audits have no normal application UPDATE permission. A correction creates a revision and updates current_revision in one transaction. Foreign keys do not cascade-delete the public evidence chain. Personal private data can be deliberately deleted in a scoped retention job; evidence retention is independently reviewed.

## Index and query strategy

Use country/type/status indexes, event (asset_id, starts_at), source hash uniqueness, organization tag-assignment and owner-scoped search indexes and a GIN catalog search_vector. The text/reference filter index is built from approved public fields and reviewed source text, using a simple unaccented strategy initially so bilingual proper names work predictably. Normalize accents without overwriting original text. Test GIN updates and query plans with representative Spanish OCR. Proposed PostGIS geography points plus GiST support production bounds and distance; never fabricate coordinates for unknown locations.

RLS is defense in depth for workspace-owned tables; service authorization remains mandatory. Before private queries, establish the allowed workspace via a trusted server context inside the transaction using SET LOCAL, never a raw client-supplied value. Use a restricted application role with no BYPASSRLS and FORCE ROW LEVEL SECURITY. Migration, worker, backup and application database roles are distinct. [Security specification](08-security-and-permissions.md) and schema comments define the boundary.

## Evolution and retention

Use Flyway versioned migrations; expand/backfill/contract for breaking changes; never run automatic schema generation in production. Preserve jurisdiction-specific fields in a versioned JSON extension only when core fields cannot represent them; promote frequently queried fields after design review. Proposed operational retention: webhook raw metadata 30 days, detailed ingestion logs 90 days, deleted annotation retention 30 days. These are product proposals, not legal requirements. Source evidence retention and deletion require O01/O07 resolution before production.

## Auction category and subtype

Confirmed: the three listings are Properties, Vehicles and Other. Proposed model: asset.category is a required constrained discriminator (properties, vehicles, other), independent of asset_type subtype and organization tags. SQL checks enforce a compatible subtype, and non-property assets cannot carry area_m2. A category/type index supports listing queries. Shared asset IDs, events, asset_notice links, tag assignments, annotations and image attachments work for every category; no property-only research table is introduced. Country remains fixed per database.

Proposed initial subtype mapping: house/land/apartment/commercial → properties; car/motorcycle/truck/vehicle_other → vehicles; equipment/inventory/other → other. Normalize additional source-specific subtypes through versioned mappings. Store original terms and evidence; do not classify unknown items as Other automatically. Existing drafts and published catalog data would need a reviewed migration, not a blanket default. The demonstration catalog contains 150 wholly fictional fixtures: 50 Properties, 50 Vehicles and 50 Other. Ten original examples are retained, with deterministic bilingual generated records spanning supported subtypes, seven provinces, CRC/USD, review states and unknown property areas. Generated records have no map coordinates; the map remains a schematic illustration. Saved search filter JSON now carries schemaVersion=3, category and the grouped expression.

## Filter-only discovery

Saved_search.filter stores the one normalized applied filter definition. The optional q text/reference criterion is evaluated alongside structured predicates; any text index is an implementation detail supporting that filter. There is no independent search model or saved auction collection. User ownership, category and organization execution context remain as specified.

## Grouped filter persistence

Saved_search.filter JSONB stores schemaVersion=3, category and the full typed expression tree, including each group's operator and term order. No new ownership or organization tables are needed. Application validation enforces depth, term limits, compatible typed values and category constraints before storage/execution. JSONB storage alone is not validation. A compiled SQL predicate uses bound values and allowlisted fields; country/category/tenant constraints remain outside the client expression. Numeric amount predicates include currency. Use representative AND and OR selectivity plans before choosing indexes; do not assume every OR can use one index efficiently. No SQL migration or database execution is claimed.

## Separate editor lifecycle

Persisted saved_search records retain the same user owner, context and schemaVersion 3 JSON. Client editor draft and return-context snapshots are transient state, not a new organization-owned filter entity. Saving stores the draft snapshot, loading copies it, and applying controls only the current listing. The source definition must stay unchanged when the retrieved draft is edited. Context loss leaves the owner's definition visible but suspended/unavailable for retrieval until explicitly resolved.

## Pagination data access

No page/pageSize is stored in saved_search.filter. Proposed PostgreSQL queries share a compiled authorization/filter predicate for COUNT(DISTINCT asset.id) and one ordered LIMIT/OFFSET result page. Avoid to-many event/notice join multiplication; choose one ordering event per asset before pagination. Use a request-consistent transaction snapshot, a UUID tie-breaker and relevant category/status/event indexes. Benchmark count cost and deep offsets with representative data; no database query plan or production load target has been validated by this mockup.

## Colored organization tags in listings

Confirmed: assigned tags have colors and appear in the list view. Show their labels as colored badges in a Tags column before the untitled icon controls. Keep one-line records; multiple badges scroll horizontally within the cell, with keyboard focus and readable labels. Color never replaces label text or implies legal/verification status. Unassigned items show an em dash. Assignments and colors remain organization-scoped.

Proposed palette: gray, blue, green, amber, red and purple, with predefined readable foreground/background pairs and gray fallback. ADMIN/MANAGER choose the definition's color when creating or updating it; USER assigns existing definitions. A color change keeps the stable tag ID and updates all its badges, not filter matching or item identity. Tag DTO includes color; create defaults to gray, patch validates the allowlist and expected version. Existing definitions require a gray backfill in production. No migration/database execution is claimed.

### Next auction and round

Confirmed display: the item listing labels the date “Next Auction” / “Próximo remate” and shows its corresponding “Round N” / “Ronda N” beside the date on the same row. The detail summary and event heading use the same round. The prototype fixture field `nextAuctionRound` holds fictional values 1–3 for demonstration; production must obtain date and round from the same next eligible auction event in the notice. Do not infer a round from an item's row position or date in production. Missing rounds show “Not reported” / “No informado” using the existing localized fallback. Date sorting remains chronological.

### Optional other-round dates in listings

Confirmed: users may show other rounds’ dates in the listing. The Columns / Columnas menu reveals an “Other rounds” column beside Next Auction; each entry pairs its round with its date and excludes the next round already displayed. Rows remain single-line and horizontally scroll on narrower screens. This display option does not change filtering, sorting, pagination or saved filters. Proposed default: hidden, with selection saved per user and category as described below. Missing schedules show the existing not-reported fallback. The editable fixture `auctionRounds` array contains fictional round/date pairs. Its illustrative 14-day spacing is not a legal rule; production must retain dates and round identifiers extracted from notice events, including only known schedules.

### User-owned listing column preferences

Confirmed: a Columns / Columnas menu selects visible listing columns and saves the selection for each user. Available choices: Reference, Item, Location, Type, Area (Properties only), Published base, Next Auction, First round, Second round, Third round, Tags, and Item controls. The action column remains untitled when shown. At least one data column must stay visible; Reset columns restores the default, which includes all applicable columns except the three optional round-date columns. Hiding columns does not change filtering, sort priorities, results or the current page.

Proposed: independent selections for Properties, Vehicles and Other, shared across the user's organizations within the instance. Column order remains fixed. The offline prototype stores validated column keys in browser storage keyed by user ID and category; this persists across reloads in that browser and is not authentication or cross-device synchronization. Corrupt or obsolete preferences fall back to defaults.

Production persistence proposal: `user_listing_preferences(user_id, category, visible_columns jsonb, version integer, updated_at timestamptz)` with primary key `(user_id, category)` and user foreign key. Permit only supported, unique column keys, require at least one data column, and omit Area outside Properties. Derive user ownership from the authenticated Clerk subject; never accept an owner ID from the request. ADMIN, MANAGER, USER and SYSADMIN may edit their own preference only. Preference storage grants no additional access to listing data.

### Specific round-date columns (current behavior)

Confirmed: the Columns menu offers First round / Primera ronda, Second round / Segunda ronda, and Third round / Tercera ronda as three independent date columns, replacing the combined Other rounds choice. Each column always shows its corresponding event date, even if that round is also the Next Auction. Unknown dates use the not-reported fallback. Preferences remain user-owned and category-specific; all three date columns are optional and hidden by default. Existing prototype selections containing the legacy `otherRounds` key expand to `round1`, `round2`, `round3`, retaining the user's other choices. Earlier references to a combined Other rounds column are superseded by this section.

### Leading listing columns

Confirmed order: Tags first; for Properties, Registration number / Número de finca second; for Vehicles, Plate / Placa second; Location follows. Other has Tags then Location, as no category-specific registration identifier was requested. Item and the remaining selectable columns follow. These identifiers are distinct from the internal item Reference. Column visibility remains user-owned. Prototype data includes clearly fictional `registrationNumber` and `plate` values prefixed DEMO; unknown identifiers use the existing not-reported fallback. Existing browser preferences that display Reference also receive the appropriate category identifier. Production must populate identifiers from normalized notice evidence, not synthesize them.

### Round times and auction bases

Confirmed: the Columns menu also offers independent Time / Hora and Base offer / Oferta base columns for each of the First, Second and Third rounds. They sit beside that round's optional date column; each can be selected separately and persists with the user's category preferences. These six optional columns are hidden by default. Time uses the event's configured country timezone (Costa Rica in this prototype), not the viewer's browser timezone. Missing event times or auction bases show Not reported. Each fixture event now includes `time`, `timezone` and `baseOffer: {amount, currency}`; auction bases retain their currency and do not imply currency conversion. Synthetic amounts are illustrative and do not encode statutory reductions. Production must extract and validate each round's time and base offer from notice evidence, never infer them from another round. Single-line rows and horizontal scrolling remain.

### Tag archive extension for CRUD

The new delete screen proposes soft archival of an organization tag definition. Prototype fields: `deleted=true`, `active=false`. Production proposal: nullable `deleted_at` with actor/audit entry, optimistic version check, organization ownership predicate, and preserved assignment/filter foreign references. Update the baseline schema before implementation; this design update does not execute a migration. Archived labels remain reserved to avoid ambiguous historical identity.

## Current tag and grid rules

Confirmed: tags always exist as usable definitions until deleted; no `active` field or active/inactive UI. Tag DTO/PATCH and proposed SQL now omit active; SQL uses deleted_at for history-preserving deletion. Creation accepts label/color. Edit and Delete are available only from the list; no View button or detail/edit routes. Inline edits preserve one physical row, with name/color inputs and Save/Cancel. Settings links to the list. Earlier active-status and separate-detail proposals are superseded.

All data grids follow the properties-grid rules and theme styling: single-line records, ellipsis, horizontal scrolling, titled sortable data columns, multi-value sorting, frameless icon actions in an untitled rightmost column, pagination with selectable page size, and user-owned column visibility. Category-specific columns do not change the common rules. The tag grid includes these controls; browser storage simulates saved user column choices. Production grids require server sorting/pagination.

### Tags grid exception

Confirmed clarification: Tags has no filter or pagination controls and displays the complete organization's non-deleted tag list. It retains shared grid appearance, single-line rows, header sorting/multi-sort, per-user column visibility and frameless Edit/Delete icons. This exception supersedes earlier tag-grid pagination guidance; auction item grids retain server pagination and selectable page sizes.

### Fixed tag columns

Confirmed: Tags has fixed columns (Tag name, Assigned items, and untitled Edit/Delete controls), with no column selector or saved column-visibility preference. Existing browser preferences for tag columns are ignored. Tags also has no filters or pagination; sorting and common properties-grid styling remain. This supersedes prior tag column-selection guidance. Auction item grids retain their column selector.

## Organization-owned property fields

Confirmed: property records include user-editable notes and appraisal amount owned by the organization, with scope `(workspaceId, assetId)`. Members of the same organization share these values; another organization has its own values for the same property. Properties use a Lucide Pencil action instead of Eye to open the editor. Vehicles and Other retain their existing open action. Source notice/extracted data remain unchanged.

The prototype property editor includes notes (up to 10,000 characters), optional non-negative appraisal amount (up to two decimal places) and currency (CRC/USD in this instance). Empty amount clears the appraisal. Save validates all fields atomically; Cancel restores saved values on the same item screen. Existing organization notes are reused. Additional editable fields are confirmed as a future need; names/types are unspecified and no extra fields are invented here.

Proposed permissions follow existing research-edit access: ADMIN, MANAGER and USER; membership must be validated server-side. Prototype state resets on reload. Annotation input/response now allow optional nullable `appraisal: Money`; production must restrict appraisal to Properties, reject invalid currencies/amounts and use expected-version checks. SQL design adds nullable appraisal_amount/appraisal_currency to asset_annotation with paired-null and non-negative checks. No database migration or production service has been executed.

## Transparent field ownership

Confirmed: organization ownership of editable fields, notes, appraisal, tags and attachments is implicit. User-facing headings, helper text, empty states and save feedback do not explain or label that ownership. Use plain labels such as Notes, Appraisal amount, Additional information and Changes saved. Organization configuration and the global context switcher remain organization controls; this does not expose field ownership labels. Internal documentation, API ownership, authorization, data isolation and audit requirements remain explicit and unchanged.

## Auction tab — second item tab

Confirmed: Auction / Remate is the second tab after General info for every item category. It contains round numbers, auction bases with currencies, dates/times and configured timezone; whether this item is sold individually or as part of a lot; and links to the auction's other items. Lot references and links to fellow lot members appear when applicable. General info retains item attributes and editable notes/appraisal; tags stay in the item header; schedule and auction base information move into Auction. Remaining tabs follow Auction in their prior category-aware order.

Demonstration fields: auctionId, saleMode (individual/lot), lotId and existing auctionRounds. Five fictional items are grouped per auction example; generated examples 07 and 08 in each category share a lot and its schedule/base. Distinct individually sold items can retain their own schedules/auction bases. These synthetic relationships are UI examples, not verified auction data. Open DEMO-A07, DEMO-V07 or DEMO-O07 for a lot example. Missing relationships or schedules must use explicit unknown/not-reported states, not inferred real-world facts.

Proposed production model: Auction groups source-evidenced sale units; a sale unit is individual or a lot and links its member assets. Round dates/times and base money attach to that sale unit, avoiding a duplicated lot price per member. Preserve source evidence, version changes and explicit currency; never sum member prices into a lot base or infer lot membership from proximity in a notice. Existing API/SQL grouping extensions remain implementation work; this prototype adds fixture relationships and UI without executing migrations or connecting a backend. Link resolution must preserve access checks and return an unavailable state for inaccessible items.

## Conditional round participation guarantees and participation fees

Confirmed: the Auction rounds list shows Participation Guarantee and participation fee amounts when calculable from explicit notice terms or verified applicable country law. Missing/ambiguous/conflicting bases must display Not available, never an assumed zero. Show currency and traceable calculation provenance. Treat Participation Guarantee and participation fee as distinct amounts. Values attach to the applicable round and sale unit, so a lot amount is not duplicated per member as a separate obligation.

Production specification: retain the source clause or legal citation, effective dates, jurisdiction, rule version, applicability, calculation basis, currency, rounding rule, result and review status. Resolve notice/law conflicts through review; do not silently choose precedence. Use exact decimal/minor-unit arithmetic; no silent FX conversion. Recompute on relevant source/rule revisions and audit changes. Country rules are deployment-owned, not user-selectable. No real country-law formula is implemented by this update.

Prototype demonstration: only A07/A08 have explicit synthetic notice terms, labeled as fictional in the notice: 10% guarantee, half-up cent rounding, and CRC 5000 fee per round of the shared lot. These are demonstration inputs, not Costa Rican legal guidance. Other examples display Not available. Calculated cells expose notice/rule reference in their title. Backend calculation, legal-rule verification and API/schema extensions remain implementation work.

Terminology: Participation Guarantee / Garantía de participación is the confirmed label for the guarantee amount.

## Government-assessed tax value

Confirmed: Properties and Vehicles can have a government-assessed value for tax purposes (Valor fiscal). It is optional and distinct from the appraisal amount and auction base. General info displays its amount/currency and available tax year/source reference; unknown values show Not reported. Other does not display this field.

Proposed representation: nullable governmentTaxValue with amount, currency, taxYear and sourceReference, extended with authority, assessment/effective dates and evidence when available. Preserve the issuing jurisdiction/source and assessment period; do not infer a tax amount, market value or current valuation from this field. Display is read-only in the prototype; source/integration and maintenance workflow remain unspecified. A07 and V07 contain explicitly fictional sample assessments; no real government valuation service is connected.

## Market Value and Appraisal Value

Confirmed: Market Value / Valor de mercado and Appraisal Value / Valor de avalúo belong to editable user/organization research data, not government/source valuations. Store each as optional amount/currency under the same organization/item scope as notes; do not display ownership labels in the UI. Government-assessed tax value and auction round bases remain separate source fields. The property General info form now supports both values, with non-negative decimal validation, independent currencies, Save/Cancel and blank-to-clear behavior. Annotation contracts and SQL design include separate nullable market money fields. Prototype persistence remains session-only.

## Description and Liens extracted from notices

Confirmed: notices may provide Description / Descripción and Liens / Gravámenes. Preserve them as optional source-derived text, displayed read-only in General info and Notice. They are distinct from editable notes and do not belong to organization research fields. Missing text means Not reported, never “no liens.” Original legal/source wording is preserved in its original language; only UI headings are localized.

Extraction must retain notice revision, page/span evidence, original text, confidence and review status for each field; avoid silently merging contradictory notices. A reported lien is not a verified current registry condition or a legal guarantee. Proposed nullable fields noticeDescription and noticeLiens are included in detail DTO/schema design; no migration is executed. Prototype examples are explicit synthetic text, also included in their original fictional notice snapshot.

## Notice Reference and judicial Case number

Confirmed: Reference belongs to the notice, not the auction item, property registration or vehicle plate. In grids, Reference is the last data column, immediately after Case number for judicial auctions and before the untitled controls column. Non-judicial records have no case number; unknown references remain Not reported. Reference is also an information field in the Notice tab, with Case number when judicial. Existing per-user column visibility choices remain respected.

Model notice reference and judicial case number at the notice/source level, preserving source provenance. Asset grid DTO fields are read-only projections from the relevant linked notice, not globally unique identifiers. A multi-notice selection policy remains a proposed backend decision; never select an arbitrary case/reference when sources conflict. Fictional examples use distinct DEMO-NOTICE-REF and DEMO-CASE prefixes shared by the auction's items. SQL changes are design-only and no migration was run.


### Confirmed auction parties and notice source details
Auctions may identify multiple creditors, debtors, auctioneers and (for judicial auctions) a court, plus a venue or office. The Auction tab displays these optional source facts. Case number remains judicial-only; Reference belongs to the notice. The Notice tab displays case number/reference, publication name, issue, publication date, page/locator, extraction notes, and the full original notice text. Missing values are unreported, never inferred. Extraction notes are read-only processing/review annotations, distinct from editable research notes.

Proposed representation: revision-scoped parties array (role/name), optional venue/office and publication metadata, and extractionNotes array. Each extracted fact must retain evidence and review provenance; a party can occur more than once per role. Preserve source spelling and full original text, without translating or rewriting it. No real identities are included in fixtures. Shared auction facts must stay consistent across linked items. Publication URLs are optional validated source links; do not invent URLs. Internal extraction diagnostics and secrets must not enter user-visible extraction notes. Reconcile conflicting revisions explicitly; do not overwrite published evidence. The existing auction grouping model remains proposed rather than a production integration.

Acceptance: all categories expose Auction parties/venue and Notice source metadata; court/case appear only for judicial auctions; repeated parties are preserved; unknowns stay unreported; source metadata cannot be edited as research; original notice text remains intact. Examples A07/A08 are explicitly fictional and share identical auction metadata.
