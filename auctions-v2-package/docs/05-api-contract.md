# REST API contract

## Contract boundary

[OpenAPI 3.1 JSON](../contracts/openapi.json) is the machine-readable proposed v1 contract. This guide supplies business semantics and examples. Base path /api/v1 is exposed through the application origin; Spring owns catalog and workspace rules. Clerk owns identity and organization invitations; the service verifies authorization before calling Clerk. The Next.js layer must not become a second source of business truth.

All example IDs and payloads are fictional. Dates use RFC 3339 timestamps; source-only dates use YYYY-MM-DD plus precision=date. Money and area are decimal strings, never binary floating-point numbers. Country metadata is ISO 3166-1 alpha-2 and is assigned from trusted instance configuration; currency is ISO 4217, locale es or en. Unknown facts are null. IDs are opaque UUIDs in production; prototype DEMO IDs are not production UUID examples.

## Common behavior

JSON request/response bodies; Bearer session token for private and SYSADMIN operations. Global catalog reads may be anonymous under P09. A workspace ID in the URL selects context but grants no authority. Verify the user’s active organization and current membership against that workspace. Every workspace maps to a Clerk organization, including solo workspaces. There is no personal-workspace authorization shortcut. An organization token cannot be used to query an unrelated workspace. Public GETs never include notes, private tags, email or provider customer IDs.

Catalog item pagination now uses page/pageSize and server totals as specified under C23 below. Search-definition and extraction queue resources retain {items, nextCursor, totalMatched, snapshotAt} cursor responses; their existing limit default 24/max 100 applies only to those resources, not auction item listings.

Errors use application/problem+json with type, title, status, code, detail, requestId and optional fieldErrors. Never return SQL, tokens or source personal data in errors. 400 invalid filter; 401 absent/invalid auth; 403 authorized identity lacks capability; 404 missing or inaccessible private object; 409 revision or membership conflict; 422 domain validation; 429 rate limit with Retry-After; 503 unavailable dependency. Retry GETs with jitter; mutations require idempotency or a safe read-after-failure.

## Endpoint catalog

| Method and path | Scope and purpose | Important behavior |
| --- | --- | --- |
| GET /assets | Public catalog search | Filters listed below, stable ordering |
| GET /assets/{assetId} | Asset and events | Published facts only; source and checked timestamps |
| GET /assets/map | Filtered coordinate clusters | Same filters; bbox required; capped at 500 clusters |
| GET /notices/{noticeId} | Published revision and evidence | Original language; source locator and extraction quality |
| GET /workspaces/{workspaceId}/assets | Catalog enriched with this organization’s tag IDs | Private/no-store; organizationTagId filter; validated membership |
| GET /workspaces/{workspaceId}/assets/map | Map results for the same organization filters | Private/no-store; bbox and membership required |
| GET /workspaces/{workspaceId}/assets/{assetId}/tags | Direct auction tag assignments | Organization members; no saved-item prerequisite |
| PUT, DELETE /workspaces/{workspaceId}/assets/{assetId}/tags/{tagId} | Idempotently assign/remove one tag | Normal research permission; available definition must belong to this organization |
| GET, PUT /workspaces/{workspaceId}/assets/{assetId}/annotation | Independent optional note | Organization scope and optimistic version; no saved-item meaning |
| GET /workspaces | Current user’s organization research workspaces only | No organization enumeration or personal workspace variant |
| POST /onboarding/complete | Idempotently complete mandatory organization activation | Authenticated identity; verifies or provisions organization membership before app access |
| GET, POST /me/searches | List or create saved searches | Feature and quota check in same transaction |
| PATCH, DELETE /me/searches/{searchId} | Pause/edit or remove | Optimistic version; do not accept user-selected recipient email |
| GET /workspaces/{workspaceId}/members | List members and pending invitations | Organization only; USER may read |
| POST /workspaces/{workspaceId}/invitations | Invite using Clerk | ADMIN only; ADMIN/MANAGER/USER role allowlist; idempotency key |
| PATCH /workspaces/{workspaceId}/members/{memberId} | Change organization role | ADMIN only; last-ADMIN protection |
| DELETE /workspaces/{workspaceId}/members/{memberId} | Remove membership | No final-ADMIN removal; audit and cache invalidation |
| GET, PATCH /workspaces/{workspaceId}/settings | Read/update identity settings | Read ADMIN/MANAGER; update ADMIN only |
| GET, POST /workspaces/{workspaceId}/tags | List/create available organization tags | Read members; create ADMIN/MANAGER |
| PATCH /workspaces/{workspaceId}/tags/{tagId} | Rename/deactivate definition | ADMIN/MANAGER; version required; preserves assignments |
| GET /workspaces/{workspaceId}/entitlements | Effective feature flags, limits and billing state | No card data; response private/no-store |
| POST /workspaces/{workspaceId}/billing/portal | Provider portal session | ADMIN with billing capability |
| POST /workspaces/{workspaceId}/billing/checkout | Provider checkout session | Server allowlist of plan keys; no client prices |
| POST /webhooks/{provider} | Clerk or billing signed callbacks | Raw-body signature; event deduplication and durable receipt |
| GET /me/access | Derived current organization/system access | Authenticated organization member; private/no-store; read-only grants |
| GET, PATCH /system/settings | Read/update instance system settings | SYSADMIN; allowlisted fields and optimistic version |
| GET /operations/extractions | System review queue | SYSADMIN plus system.catalog.review capability |
| GET /operations/extractions/{extractionId} | Draft evidence and revision | Private, no public caching |
| POST /operations/extractions/{extractionId}/publish | Publish corrected transcription | SYSADMIN; expectedVersion, reason and evidence checks |
| POST /operations/ingestion-runs | Authorized source fetch request | SYSADMIN; allowlisted source ID, never arbitrary URL |

## Member image contract

GET /workspaces/{workspaceId}/assets/{assetId}/images lists authorized organization attachments. POST /images/uploads creates a bounded upload session for a verified member and server-selected object key. POST /images/{imageId}/complete verifies object ownership, bytes/type, size and checksum and returns processing state; only ready attachments receive authorized preview URLs. DELETE /images/{imageId} is a proposed uploader-or-ADMIN soft-delete flow. All writes retain audit/idempotency requirements where declared, and there is no save/tag prerequisite. Cross-organization image IDs return 404. Limits are proposed at JPEG/PNG/WebP, 10 MB per file and 20 per organization/asset. No public or organization listing DTO includes thumbnails or image URLs; member images are available from detail only.

## Direct tags and user-owned search contract

Saved auction-item endpoints/models are removed. PUT of an existing organization/asset/tag tuple returns the same assignment; DELETE is idempotent after membership checks. Removing the final tag does not delete the asset or optional annotation. A definition rename preserves assignment IDs; new inactive or foreign-organization assignments fail. Catalog public tags remain separate from organization tag assignments.

Public GET /assets never returns private tag/annotation fields and rejects organizationTagId. Authenticated GET /workspaces/{workspaceId}/assets and /assets/map accept organizationTagId, validate the definition belongs to that context, and return private/no-store results. OrganizationFilter adds that UUID to the public Filter fields. Saved searches use OrganizationFilter with their explicit execution context.

GET/POST /me/searches and PATCH/DELETE /me/searches/{searchId} operate only on searches whose immutable ownerUserId equals the verified session subject. No ownerUserId input is accepted. ADMIN or SYSADMIN cannot read/mutate another user’s search; an inaccessible ID returns 404. List returns all the owner’s searches across organization switches. contextWorkspaceId is required at creation, validated against membership, and may be re-scoped by the owner with full private-filter validation. If the context is removed, retain user ownership and suspend execution; current organization-private values are withheld. The owner may still pause/delete the search. A deleted organization clears context without deleting or transferring the user-owned definition. Notifications go only to the search owner’s verified account, and delivery jobs recheck ownership, context access and entitlements.

Optional annotation note fields use AnnotationInput with version and note; they are independent from tags. A client applying several tag changes and a note must handle partial request failures explicitly; no hidden saved-item aggregate is created.

## System configuration and operations contract

SYSADMIN is a system-scoped role separate from membership.role. GET /me/access returns the current organization role and a nullable systemRole, derived from the authenticated principal and trusted server-side assignment records. Neither value is accepted as a grant in a request body. Do not trust client headers, query parameters or organization-editable metadata to assign SYSADMIN. Organization ADMIN cannot grant it through invitations, user management or billing.

GET/PATCH /system/settings require SYSADMIN. Proposed editable fields are ingestionEnabled and sourceCheckIntervalMinutes (integer 15 through 1440); PATCH also requires the current version. Country is read-only response metadata from deployment configuration, excluded from the strict write schema. Unknown fields or country overrides fail; conflicting versions return 409. Changes are audited and do not mutate an organization’s private data. No secrets or arbitrary source URLs are accepted.

All /operations/* endpoints require SYSADMIN in addition to task-specific validation. Existing approved-source ingestion retains Idempotency-Key, source country checks and durable job acknowledgement. Review publication retains evidence and version checks. Revoking SYSADMIN denies subsequent system mutations using the authoritative assignment state. GET /me/access and all system responses are private/no-store. The mockup does not implement these server checks.

## Organization role and operational tag contract

Organization request/response membership role fields are exactly ADMIN, MANAGER and USER. SYSADMIN is a separate system role field and is never accepted by organization invitations or membership updates. ADMIN manages users, roles and full organization settings. ADMIN/MANAGER manage the available organization tags list. USER normal research and existing-tag assignment are proposed baseline permissions. The last ADMIN cannot be removed or demoted; there is no Owner level.

GET /workspaces/{workspaceId}/settings is available to ADMIN/MANAGER; PATCH of organization identity is ADMIN-only. GET /workspaces/{workspaceId}/tags lists definitions to organization members. POST creates and PATCH /tags/{tagId} renames or deactivates a definition for ADMIN/MANAGER only. Creation requires Idempotency-Key; updates require version. Duplicate normalized labels return 409 TAG_LABEL_EXISTS. Unknown/foreign tag IDs return 404; assigning a newly inactive tag returns 422 TAG_INACTIVE. Assignment endpoints use a stable tagId, never free-text names that create definitions. Existing inactive assignments may be read, replayed idempotently or removed; new inactive assignments are rejected. Assignment has no dependency on an annotation or saved-item record.

No hard-delete tag endpoint is proposed. Rename preserves stable IDs/assignments; deactivation preserves history. Public search tag filters use the separate catalog taxonomy. All settings/tag operations are scoped to the active organization and audited. There is no generic settings blob that lets MANAGER alter users, roles, billing or country.

## Organization-only ownership and onboarding

Workspace.kind is always organization and clerkOrganizationId is required read-only metadata. Auction tags, optional annotations, memberships, entitlements and billing subscriptions belong to that organization. Saved searches belong to the authenticated user; contextWorkspaceId is an execution scope, not an ownership field. The server rejects any request to create a personal scope. Organization membership is required for all protected application routes, including solo users and SYSADMIN users; system capabilities remain a separate grant.

POST /onboarding/complete requires a valid Clerk identity but is the sole protected bootstrap exception to the pre-existing organization-context requirement. It accepts no client-assigned roles, organization IDs or billing ownership. If Clerk already confirms membership in the active organization, synchronize that organization and membership. If memberships exist but no valid active organization has been selected, return 409 ORGANIZATION_CONTEXT_REQUIRED and require selecting an existing membership rather than creating another organization. If no membership and no invitation is pending, provision a solo organization and ADMIN membership using an actor-scoped idempotency key and a resumable provisioning record. A verified pending invitation yields 409 INVITATION_PENDING until accepted through Clerk; do not silently create a duplicate solo organization. The result is the organization Workspace DTO. Replays return the same organization. Do not activate the local app_user until membership exists; compensate or reconcile partial provider failures before granting app access.

Membership mutations enforce both last-admin and final-organization safeguards transactionally. 409 LAST_ORGANIZATION prevents final-membership removal; the approved account-deletion workflow is separate. Provider-originated removal immediately denies protected access and enters reconciliation before another organization is provisioned or the account is closed. Billing remains organization-owned for all plans.

## Instance country boundary

Every API instance serves exactly one deployment-configured country. Country remains read-only response metadata for provenance, but is absent from request filters, saved-search definitions and public mutation inputs. Do not expose a country configuration endpoint or administrator setting. Explicit country query parameters or country keys in saved-search payloads return 400 COUNTRY_NOT_SELECTABLE, including values equal to the configured country; reject foreign subdivision codes with 400 REGION_OUTSIDE_INSTANCE. Country-bearing headers and token metadata never override configuration. All reads, ingestion and publication enforce the configured country; cross-country direct ID access returns 404.

Saved-search upgrade: if a legacy filter contains the same country as the instance, remove that key in an audited migration; a different country disables the search pending operator review and is never silently retargeted. Saved filters use the current proposed schemaVersion=3 contract because no production API has been released.

## Filter representation

Current requests use category plus the JSON expression query parameter defined in the schemaVersion 3 section below. Legacy flat query examples are superseded. The expression has explicit parentheses and typed terms. Map bounds intersect that expression; no map coordinate or administrative boundary is inferred from a Boolean term.

## Mutation guarantees

POST create, invitation, checkout, publication and ingestion operations accept Idempotency-Key (UUID, proposed retention 24 hours). Scope keys to actor, route and request-body hash; replay returns the original status/body, changed payload returns 409. PATCH and PUT private entities include version; version=0 creates a save, subsequent versions are exact-match updates. Publication accepts only the versioned normalized-field allowlist and validates every corrected value against evidence; actor, tenant, reviewer and publication state cannot be assigned through correctedFields. Publishing increments extraction and notice revisions atomically with a transactional outbox event. Duplicate webhook event IDs return 200 after existing receipt is confirmed; processing can continue asynchronously. Unknown provider events are acknowledged but audited.

## Example domain error

```json
{
  "type": "https://example.invalid/problems/filter-invalid",
  "title": "Invalid search filter",
  "status": 400,
  "code": "CURRENCY_REQUIRED",
  "detail": "Choose a currency when filtering by published base.",
  "requestId": "demo-request-01",
  "fieldErrors": [{"field": "currency", "message": "Required with minBase or maxBase"}]
}
```

example.invalid is documentation-only and is not a deployed API. Internal traces use requestId, never tokens. An OpenAPI schema cannot enforce membership or all cross-field rules; those are mandatory service validations and acceptance tests.

## Three-listing query contract — proposed implementation of C17

AssetCategory is properties, vehicles or other. Asset and detail responses require category separately from subtype type. GET /assets, /assets/map and their organization-scoped equivalents require category; missing/invalid category returns 400. Reuse these endpoints rather than introducing divergent category services. Validate subtype/category compatibility and reject property area constraints on Vehicles/Other with 422. Counts, page requests, caches, map queries and search execution bind category; changing category requests page 1. Item detail IDs are global within the instance.

Saved filter schemaVersion is now 3 and requires category and a grouped expression. OrganizationFilter inherits this requirement. On any future migration of version-1 property-only saved filters, explicitly stamp category=properties; unknown or ambiguous imported filters require owner review and suspended execution. Never silently broaden a saved search to multiple listings. OwnerUserId remains server-derived. This is an editable design contract; no deployed API or migration has been run.

## Single filter definition — C19

Catalog listing and map endpoints evaluate one normalized Filter or OrganizationFilter object. The optional text term is a text/reference filter criterion, combined according to its group operator; category remains mandatory outside the expression; it does not create an independent search endpoint or workflow. SavedSearch remains the internal resource name for a user-owned saved filter definition, surfaced as Save filters in the UI. Existing /me/searches routes and ownership rules remain compatible. The filter-only interaction alone did not require a schema-shape migration; the subsequent grouped expression uses version 3 as specified below. Reject unknown filter fields; keep bounds, cursor/category binding and tenant rules unchanged.

## Grouped expression contract — schemaVersion 3

Filter = {schemaVersion:3, category, expression:{operator:AND|OR, groups:[{operator:AND|OR, terms:[{field,operator,value?}]}]}}. Every group has 1–20 terms; the expression has 0–10 groups and at most 100 terms overall. Empty groups, unsupported fields/operators, missing/invalid values, incompatible subtype/category, property area on non-properties and foreign organization tags fail with 422. Not-reported terms use isUnknown without a value. Blank text is invalid. Root groups=[] means no optional criteria, independent of the root operator. No recursive groups, implicit precedence, NOT, or arbitrary client expressions are accepted in this version.

GET listing/map APIs require category and accept one expression query parameter with application/json content, URL-encoded once. Omitted expression means no optional criteria. Organization endpoints use OrganizationFilterExpression, which additionally permits organizationTag UUID terms; public expressions reject those terms. Remove legacy flat q/region/assetType/organizationTagId parameters rather than combining two parallel representations. Pagination and bbox remain transport controls; bbox intersects the expression and never broadens it. Backend field/operator dispatch is allowlisted and every value is bound as a parameter, never interpreted as SQL or a JSON path.

Term variants and types are specified in OpenAPI. Base values use Money {amount: decimal string, currency: ISO code}; the prototype offers CRC/USD. Canonicalize amount to two fractional digits without rounding invalid input. Area is a nonnegative decimal string. Actual production arithmetic must use exact decimal types, not browser floating-point assumptions. Unknown base/area matches only isUnknown; comparisons on null are false. Each amount predicate first checks its own currency, preventing cross-currency OR mistakes. Counts, list, map, saved-filter execution and notifications share the same evaluator and version.

Security evaluation is always mandatoryCountry AND category AND visibility/entitlements AND (expression). Do not place authorization clauses inside client-controlled groups. Cap decoded payload size (proposed 32 KB), terms and query cost; apply timeouts and rate limits. Page/cache keys include canonical AST, category, scope and version. Preserve group order and parentheses when displaying/saving; no lossy flattening. No schema-shape migration has run: version-2 filters would be audited into an outer AND with one group per old field, OR within repeated-value fields, explicit unknown branches and currency-bound base terms. Unsupported/ambiguous legacy criteria suspend execution for owner review; never silently drop them. Routes /me/searches keep owner checks and carry schemaVersion 3 filter definitions.

Editable expression examples: [four operator combinations](../data/grouped-filter-examples.json).

## Separate view save/retrieve contract

No filter schema change is needed: version 3 expressions remain unchanged. Saving from the view posts its validated draft to /me/searches; it does not execute an auction query or apply the definition. Ownership remains server-derived, and execution context must be an active membership. Retrieving uses definitions returned by the current user's /me/searches response, validates that the user still owns them and can use their context, and copies the selected definition into client draft state. The UI must not fetch another user's definition or silently re-scope private criteria to a different organization.

Apply executes the existing category/organization-scoped listing or map API with the validated draft; loading and saving alone do not issue a result-replacement operation. Cancellation requires no mutation. Preserve draft/context across recoverable save/load failures. The existing PATCH API remains specified for future explicit updates, but the prototype's Save action creates a new named definition. No overwrite is implied by Retrieve.

## Server-side catalog pagination — C23

GET /assets and GET /workspaces/{workspaceId}/assets accept page (integer >=1, default 1) and pageSize (proposed enum 5/10/25/50/100, default 25). Category and the grouped expression remain unchanged. Catalog item responses are {items, page, pageSize, totalItems, totalPages, hasPrevious, hasNext, snapshotAt}. totalPages=ceil(totalItems/pageSize), including 0 for an empty set. items.length never exceeds pageSize. Count distinct authorized published asset IDs using the same mandatory scope and grouped expression; event/notice joins must not duplicate rows. Normalize exact decimal and null semantics before compilation.

Apply server-side filtering and deterministic ordering before LIMIT/OFFSET. Proposed order remains next scheduled event ascending, null dates last, asset UUID ascending. Perform count and bounded row read in one request-consistent database snapshot. snapshotAt identifies that response's observation time, not a frozen multi-request snapshot: publications/revisions may move records between pages. Do not promise cross-page immutability. A page beyond current totalPages returns empty items and current totals; the client requests max(1,totalPages) once to recover. Zero-result responses retain page=1 in the normal UI. Malformed, fractional, nonpositive or unsupported sizes return 400 INVALID_PAGINATION. Reject legacy cursor/limit on these item routes instead of mixing pagination schemes. Other resources retain their existing cursor contract.

page and pageSize are query transport controls, excluded from Filter/OrganizationFilter and saved definitions. Changing filter/category/context/size requests page 1; cancel/detail return preserve the prior request state. Use category, canonical expression hash, scope, locale, sort, page and pageSize in response-cache keys. Abort or ignore superseded requests so stale page responses cannot replace newer criteria. On a failed page request keep the last successful rows/metadata and offer retry; do not advance displayed page until success. Apply rate limits and benchmark deep offsets; backend cost safeguards remain a production gate.

Map endpoints retain bounded coordinate-cluster semantics and do not accept item page/pageSize. They must not derive pins from only the currently displayed page. Public responses exclude private research; organization paging uses the same membership checks as every other read. Exact totals are authorized totals, not global catalog counts.

## Item table and prioritized sorting

Confirmed: use column-based tables for auction listings and allow sorting on one or more values. Common columns are item/reference, reported location, subtype, published base, next event and organization tags; Properties also has area. No listing imagery is introduced. On mobile, the single-line table scrolls horizontally and the same sorting controls stay available.

Click a sortable column header for a primary ascending/descending sort. Add sort appends a priority; users can select its field/direction or remove it. Numbered header indicators show priority. Sort happens on the server before item pagination, with nulls last and item ID as the final deterministic tie-breaker. Changing sort resets page 1 and preserves size. Distinct fields only, maximum five priorities proposed. Amount ordering requires a single-currency scope; never compare raw CRC/USD amounts. Area is property-only. Sort is request/presentation state outside the saved expression; saving sort preferences with definitions remains unconfirmed.

GET item listing endpoints accept sort as a JSON array of {field,direction} in priority order. Backend validates allowlisted fields/directions, compatible category and single-currency scope and binds/allowlists ordering rather than interpolating user SQL. Counts are unaffected by sort. Cache/request identity includes sort. The offline adapter demonstrates sorting before slicing; actual server ordering and stable database pagination remain production integration gates.

Acceptance: verify multi-value precedence, both directions, equal values/ID ties, null placement, page reset, currency/category constraints, accessible header controls and mobile labels. Use the mockup Add sort control rather than requiring a keyboard modifier.

## Colored organization tags in listings

Confirmed: assigned tags have colors and appear in the list view. Show their labels as colored badges in a Tags column before the untitled icon controls. Keep one-line records; multiple badges scroll horizontally within the cell, with keyboard focus and readable labels. Color never replaces label text or implies legal/verification status. Unassigned items show an em dash. Assignments and colors remain organization-scoped.

Proposed palette: gray, blue, green, amber, red and purple, with predefined readable foreground/background pairs and gray fallback. ADMIN/MANAGER choose the definition's color when creating or updating it; USER assigns existing definitions. A color change keeps the stable tag ID and updates all its badges, not filter matching or item identity. Tag DTO includes color; create defaults to gray, patch validates the allowlist and expected version. Existing definitions require a gray backfill in production. No migration/database execution is claimed.

## User-owned column preferences (proposed extension)

Confirmed behavior: visible listing columns are saved per user. Proposed endpoints `GET /me/listing-preferences/{category}` and `PUT /me/listing-preferences/{category}` return/replace `{category, visibleColumns, version, updatedAt}`. PUT accepts `{visibleColumns, expectedVersion}`; category is properties, vehicles or other. The server derives the user from the validated session, applies the column allowlist and at-least-one-data-column rule, rejects unsupported/duplicate keys (422), and rejects stale versions (409). GET returns documented defaults when no preference exists. Save atomically, return the saved preference, and restore it on subsequent sign-in on any device. UI should show a save failure and retry rather than claiming a successful account save. Display preferences are separate from filters and never alter authorization or result membership. This proposed extension is documented here for implementation; it is not yet added to the baseline OpenAPI or connected to a backend. The offline prototype uses per-user/category browser storage only.
