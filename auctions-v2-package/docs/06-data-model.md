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

RLS for saved_search checks a trusted transaction-local app.user_id against owner_user_id. Alert delivery checks the recipient/owner identity; its FK ties (search_id,user_id) to the search owner, not to a mutable execution context. Historical delivery context is separate and can become null. Application services and workers still validate current execution context and entitlements. Organization deletion must not cascade-delete or transfer user-owned searches. No live migration is performed by this package.

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

### Round times and base offers

Confirmed: the Columns menu also offers independent Time / Hora and Base offer / Oferta base columns for each of the First, Second and Third rounds. They sit beside that round's optional date column; each can be selected separately and persists with the user's category preferences. These six optional columns are hidden by default. Time uses the event's configured country timezone (Costa Rica in this prototype), not the viewer's browser timezone. Missing event times or base offers show Not reported. Each fixture event now includes `time`, `timezone` and `baseOffer: {amount, currency}`; base offers retain their currency and do not imply currency conversion. Synthetic amounts are illustrative and do not encode statutory reductions. Production must extract and validate each round's time and base offer from notice evidence, never infer them from another round. Single-line rows and horizontal scrolling remain.

### Tag archive extension for CRUD

The new delete screen proposes soft archival of an organization tag definition. Prototype fields: `deleted=true`, `active=false`. Production proposal: nullable `deleted_at` with actor/audit entry, optimistic version check, organization ownership predicate, and preserved assignment/filter foreign references. Update the baseline schema before implementation; this design update does not execute a migration. Archived labels remain reserved to avoid ambiguous historical identity.
