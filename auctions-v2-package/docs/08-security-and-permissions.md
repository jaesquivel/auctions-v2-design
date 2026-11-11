# Security and permissions

## Instance country boundary

Country scope is deployment configuration, not a role capability. No user, organization owner or application administrator may select or override it through UI, query parameters, headers, tokens, saved searches or operations APIs. All catalog lookups, source adapters and publication transactions enforce the configured country. Use a separate database and source-storage namespace per country instance; tenant membership never expands country scope. Deployment provisioning is operational configuration outside the application, not an administrator country-selection feature.

## Trust boundaries

Browser content and all uploaded or fetched source documents are untrusted. Next.js renders the interface and checks access near server data reads; Spring verifies the Clerk session token and enforces domain permissions for every protected endpoint. Hiding controls is convenience only. Clerk authenticates people and manages organization membership; it does not replace row-level authorization in the application.

Verify token signature against the configured issuer’s keys, exact issuer, expiry, not-before, allowed algorithm and intended audience when configured in the chosen token profile. Validate authorized-party/origin policy for browser sessions. Do not accept arbitrary issuers or jwks URLs from request content. Spring Security can validate JWTs as a resource server; mapping Clerk’s selected session-token version, organization claims and custom permissions needs explicit integration tests. Do not assume Clerk uses a standard OAuth scope claim for app roles. Handle key rotation and bounded key-cache failures securely. See [official references](12-sources-and-validation.md).

## Organization roles and permissions

Confirmed C11: organization roles are exactly ADMIN, MANAGER and USER. ADMIN manages all organization settings including users; MANAGER manages operational settings including available tags. The matrix marks additional decisions as proposed. A solo organization is proposed to start with ADMIN. Subscription features cannot grant a missing role capability.

| Capability | ADMIN | MANAGER | USER | Status |
| --- | --- | --- | --- | --- |
| Edit full organization settings and manage users/roles | Yes | No | No | Confirmed ADMIN/MANAGER boundary; USER exclusion proposed baseline |
| Edit operational settings and available tag definitions | Yes | Yes | No | ADMIN/MANAGER confirmed; USER exclusion proposed baseline |
| Read catalog, evidence and own organization research | Yes | Yes | Yes | Proposed baseline |
| Edit organization annotations and own saved searches | Yes | Yes | Yes | Proposed normal research baseline |
| Assign/remove existing active tags directly on auction items | Yes | Yes | Yes | Proposed; does not permit definition editing |
| Manage organization identity, billing and subscription settings | Yes | No | No | ADMIN full settings; exact lifecycle flows proposed |
| Delete organization through safeguarded closure | Yes | No | No | Proposed; final-membership and final-ADMIN safeguards |
| Publish global catalog facts, configure system or control ingestion | SYSADMIN required separately | SYSADMIN required separately | SYSADMIN required separately | Organization role alone never grants system powers |

Proposed capability keys: organization.settings.manage, organization.users.manage, organization.billing.manage and organization.tags.manage. ADMIN receives all organization capabilities. MANAGER receives operational capabilities such as organization.tags.manage. USER receives research capabilities only. Map these three domain roles to reviewed Clerk custom roles/permissions; provider identifiers are integration details, not extra application levels. Reject unknown or legacy role values. No organization role can change instance country, other organizations or global source policy.

Available tag definitions are organization-scoped. ADMIN/MANAGER create, rename and deactivate them. Proposed USER behavior selects existing active IDs only. A foreign organization tag ID is rejected even if its label matches. Rename preserves assignments; deactivation preserves history and prevents new assignments. Public catalog taxonomy is separate from this tenant operational list.

## SYSADMIN system role

Confirmed C12: SYSADMIN allows system configuration and operational tasks. Its scope is the deployed instance, separate from the organization roles ADMIN, MANAGER and USER. A person may hold an organization role plus SYSADMIN. SYSADMIN does not imply ADMIN inside any organization, and organization ADMIN does not imply SYSADMIN. All users, including SYSADMIN, still require organization membership.

| Proposed system capability | SYSADMIN | Organization role alone |
| --- | --- | --- |
| Read/edit allowlisted system settings | Yes | No |
| Pause/resume ingestion and set source-check cadence | Yes | No |
| Start approved-source ingestion and operate recovery tasks | Yes, with normal validation | No |
| Review/publish extracted catalog facts | Yes, with evidence/version checks | No |
| Read system operational status and audit relevant actions | Yes | No |
| Read or edit other organizations’ private research/settings | No automatic grant | Only authorized organization membership |
| Change the instance country at runtime | No | No |

The specific capability breakdown is proposed: system.settings.manage, system.ingestion.manage, system.catalog.review and system.audit.read. SYSADMIN is the confirmed system role; these keys do not introduce extra user levels. Previous generic staff-grant placeholders are superseded. A trusted server-side assignment repository is authoritative; organization-editable Clerk metadata, invitation payloads and membership role fields cannot grant SYSADMIN. Bootstrap/revocation through a controlled security/deployment process is proposed; no role-grant UI endpoint is exposed in this package.

Require MFA for SYSADMIN use, audit configuration changes and operational actions, and recheck the authoritative grant for privileged mutations. Revocation denies subsequent mutations and clears relevant capability caches. System responses use no-store. The fixed-country configuration remains immutable at runtime. No general impersonation or automatic access to private tenant notes is proposed.

## Organization lifecycle safeguards

Only authenticated identity onboarding may run without an established active organization. It must join or provision an organization before application activation; no personal fallback is allowed. SYSADMIN users also belong to organizations, while system grants remain independent of organization roles. A sole member remains ADMIN until another ADMIN exists. Prevent removal or demotion of the last ADMIN; there is no separate Owner level. Prevent final-organization removal unless another membership or approved account closure is completed. Provider-originated membership loss denies access immediately and triggers reconciliation; stale local membership is never sufficient to regain access. An organization can be deleted only after every affected user has another organization or their account is closed. All plan and payment permissions operate on organization billing.

## Member image attachments

Organization members may attach images to auction items through the Images tab. Proposed default: images are private to the active organization, independently of source evidence. Validate membership, item/instance scope, content-size limits and decoded MIME on initiation and completion; never trust filenames or browser Content-Type alone. Bind upload URLs to a server-selected object key, organization, asset and expiry. Scan/re-encode accepted image formats and remove EXIF metadata before serving; reject SVG/HTML and other unapproved types. Proposed deletion authority is the uploader or organization ADMIN. SYSADMIN does not automatically gain access to private organization images. No image data or signed URLs belong in public listing DTOs or caches.

## User-owned saved-search boundary

Saved searches are user-owned, not organization-owned. Only the verified owner may read/edit/pause/delete one; ADMIN, MANAGER and SYSADMIN do not override this rule. Bind ownership from the session, never a request field. Organization context scopes private tag filters, execution and plan entitlements only. Owner-only RLS uses app.user_id, separately from workspace RLS for tag assignments/annotations. Background deliveries target the verified search owner and revalidate context access. Lost/deleted context suspends execution while preserving user ownership, with private context values withheld until authorized re-scoping.

## Multi-tenant access controls

Resolve the organization workspace from the route, then verify current membership, organization role and active organization context. Include the validated organization context in organization-data repository predicates/cache keys. User-owned search predicates and cache keys use the verified owner user ID, never organization ID alone. Reject mismatched token org and route workspace; never silently switch organizations from a URL. On membership removal, invalidate membership and entitlement caches; proposed cache maximum is 60 seconds, while role changes and billing operations recheck authoritative state. If current membership cannot be established for a privileged mutation, deny and offer retry. For reads, a bounded synchronized membership record may be used within the stated revocation window.

Global catalog and tenant research use separate DTOs. Private pages, API responses and server-rendered private payloads use no-store. Public edge caches contain public fields only. RLS on private tables uses a transaction-local, server-validated workspace context; absent context denies all. Application database user has no BYPASSRLS. RLS cannot protect against a compromised trusted service setting arbitrary context, so service tests and least privilege remain required.

## Threats and mitigations

| Threat | Mitigation | Verification |
| --- | --- | --- |
| Object ID guessing or tenant crossover | Scope every lookup, private 404, tenant RLS | Two-org read/write tests and direct API calls |
| Source PDF exploitation or SSRF | Domain allowlist, redirect checks, private-IP denial, size/time limits, isolated parser | Malformed PDF and internal URL tests |
| Stored XSS from OCR or notes | Treat text as text, sanitize permitted markup, strict CSP, escaped rendering | Payloads in title, note and extracted text |
| Prompt injection in source text | Extract-only schema, no tool authority, validation and evidence review | Source instructions cannot invoke actions or change policy |
| Forged payment/membership event | Verify raw-body signature and freshness; event ID uniqueness | Invalid signature, replay and out-of-order tests |
| Lost update or duplicate job | Optimistic versions, idempotency, outbox deduplication | Parallel save/publish and replay tests |
| Credential or personal data exposure | Secret manager, minimal logs, redact parties, short-lived source URLs | Log inspection and source access tests |
| CSRF and cross-origin token misuse | SameSite cookies, origin and anti-CSRF checks for cookie mutations; CORS allowlist | Cross-site mutation tests |
| Subscription bypass | Server feature resolution and atomic quota check | Changed plan key and concurrent quota tests |

## Data handling and incident readiness

TLS on external and service connections; managed encryption at rest for databases and object storage. Clerk secrets, billing secrets and source credentials remain server-only and rotate independently. Public source links may point to the origin; archived documents require an authorization/redaction decision before redistribution. Do not expose object-storage paths as permanent unrestricted links. Source text may contain personal data even when published elsewhere; avoid unnecessary indexing and approve a correction/deletion process before launch.

Audit membership/role changes, invitations, billing configuration changes, source ingestion, corrections and publication. Record actor, action, object, timestamp, request ID and redacted diff. Restrict audit reads to security/operations. Set retention through approved policy, and prevent ordinary application updates. Alerts and analytics contain minimal personal data. Prepare incident runbooks for leaked token, unauthorized cross-tenant access, materially incorrect published date/base and source takedown. Proposed response is disable risky publication/delivery, retain evidence, assess affected records, correct with a new revision and notify affected users according to approved policy.

## Shared permissions across auction categories

Properties, Vehicles and Other are public catalog classifications, not authorization roles or organization namespaces. Enforce the same organization scoping for tags, notes and member images and the same owner checks for saved searches in every listing. Include category in catalog/search cache and cursor keys; organization/user identity remains required for private responses. No category field may change instance country or bypass tenant checks. SYSADMIN remains independent from ADMIN/MANAGER/USER.

## Boolean filter boundary

Evaluate mandatory instance country, category, catalog publication visibility, authenticated organization membership and entitlements before/intersected with the whole Boolean expression. OR must never encompass these server-enforced clauses. Public term schemas exclude organization tags. Organization tag IDs are validated against active execution context even when placed in a branch that would otherwise short-circuit. User-owned saved filters retain existing access checks; SYSADMIN/ADMIN cannot read another user's expression. Validate every branch before evaluation. Bound depth/count/bytes/cost and bind SQL values to prevent injection and resource exhaustion.

## Retrieve authorization

Show only the current user's definitions in the separate filter view. Validate ownership, current membership, schema/term validity and organization-private IDs before loading. Retrieve cannot use ADMIN or SYSADMIN to override another user's ownership. Context restoration changes the active organization only to a displayed saved context in which the actor has an active membership; it never transfers the definition or widens access. Revalidate membership and term scope again when applying or saving. Cancel restores the previous authorized context. Unavailable or invalid definitions produce a recoverable denial rather than empty/global fallback filters.

## Bounded page reads

Validate integer page and allowlisted pageSize on the server. Pagination cannot bypass the configured country, category, publication visibility, organization membership, private tag term validation or entitlements. Apply authorization before both count and rows; totals must not reveal inaccessible records. Bind offset/limit values through the query builder and enforce cost/rate safeguards. A large page number is not authorization for an unbounded export. Page-size selection is ordinary listing navigation for all permitted readers, not an organization administration capability.
