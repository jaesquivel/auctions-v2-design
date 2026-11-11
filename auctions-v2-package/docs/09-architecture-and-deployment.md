# Architecture and deployment

## Proposed system

Next.js App Router with TypeScript and Tailwind provides locale-aware public pages, authenticated workspace screens and server-rendered initial results. Java with Spring Boot is proposed for catalog, search, workspace, entitlements and publication services. A separately deployed worker built from shared domain modules performs fetching, parsing, normalization and notifications. PostgreSQL is the source of application truth; object storage holds immutable source bytes; Clerk provides identity. No production infrastructure is created by this package.

Use a modular monolith with catalog, evidence, research, identity integration, subscriptions and ingestion modules. Modules own their tables and communicate through typed service boundaries and outbox events. Avoid separate microservices until scale or team ownership creates a measured need. Pin current supported runtime versions and dependency lockfiles during project initialization; no version compatibility is implied by this design-only package.

## Single-country deployment configuration

The codebase supports multiple countries; every deployed instance serves exactly one country. INSTANCE_COUNTRY is a required deployment-time ISO country code, with matching country profile and source adapter. Next.js, Spring and workers load the same immutable profile and fail startup if the country, adapter or database jurisdiction disagree. No country selector, administrator setting, API configuration endpoint or per-request override is exposed. The frontend receives a sanitized read-only country label from the server.

The CR example profile is in [instance configuration](../deployment/instance.example.env). Supported UI languages remain Spanish and English independently of country. Configure country-specific timezone, subdivision taxonomy, source adapters and money parsing separately from language preference. Do not assume one currency per country; explicit source currencies remain supported.

Provision each country instance with its own database, source storage namespace, ingestion jobs, secrets, provider callback configuration and monitoring identity. This isolation is a proposed implementation choice for enforcing the confirmed single-country boundary. Moving an existing instance to another country is not a runtime toggle: provision and validate a separate deployment. SYSADMIN manages approved system sources and operations within the configured instance; organization ADMIN manages users and organization settings only.

## Organization-only account architecture

Every application user belongs to at least one Clerk organization with a corresponding organization workspace. Solo users receive a one-person organization through the proposed onboarding saga; invited users join the invited organization first. Use an actor-scoped provisioning lock/idempotency receipt, provider organization/membership verification and a single local user/workspace/membership transaction. Reconcile partial failures before activation; never create an application session with a personal research scope. Organization roles and billing apply identically to solo and multi-member organizations. Multi-organization session switching revalidates membership and clears private state.

## System access boundary

SYSADMIN is an instance-wide system grant stored separately from organization memberships. All operations endpoints and system settings resolve the trusted grant on the server; tenant role checks remain independent. Proposed authorization keys cover system settings, ingestion, catalog review and auditing. Do not derive this grant from user-controlled claims or organization metadata. The system UI exposes allowlisted configuration and operation controls with immutable country context. System grant provisioning/revocation uses a separate trusted security process; organization ADMIN cannot elevate themselves.

## Request and event flow

Public request → CDN/application edge → Next.js page → Spring catalog read → PostgreSQL public projection. Private request → Clerk session → Next.js secure server data access → Spring token and workspace verification → scoped query. Never cache a user-specific response as public. Server actions are callable endpoints and require the same authorization as REST mutations.

Approved source → ingestion worker → immutable object + draft extraction → SYSADMIN-reviewed publication transaction → catalog update + outbox → index refresh and alert delivery. Email jobs use a unique delivery key and mark provider response; delivery failure never rolls back a published catalog revision. Signed Clerk/billing callbacks → durable webhook receipt → asynchronous reconciliation → membership/entitlement projection.

Editable architecture and sequence diagrams are in [diagrams](../diagrams/index.html).

## Frontend implementation map

| Area | Proposed Next.js placement |
| --- | --- |
| Public locale shell | app/[locale]/(public)/layout.tsx |
| Discovery and URL filters | app/[locale]/(public)/{properties,vehicles,other}/page.tsx |
| Asset and notice pages | app/[locale]/(public)/assets/[id] and notices/[id] |
| Protected workspace | app/[locale]/(workspace)/workspace/[workspaceId]/layout.tsx |
| Operations and system | app/[locale]/(operations)/operations/review and app/[locale]/(system)/system |
| Shared interface | components/catalog, components/evidence, components/research |
| Validated service calls | lib/server/api, lib/server/authz, lib/filters |
| Localization | messages/es.json and messages/en.json |

Server components handle initial reads; client components own filter drafts, save toggles and map interaction. A shared filter codec normalizes URL/search-save state. Generate or validate API types from OpenAPI. Never place Clerk secret keys, billing keys, source credentials or direct database access in client components.

## Deployment topology

| Component | Suggested hosting class | Scaling and boundary |
| --- | --- | --- |
| Frontend | Managed Next.js platform or container host | Edge cache public pages; no-store private pages |
| Spring API | Managed container service behind HTTPS gateway | At least two instances proposed for production |
| Worker | Separate container job/service | Bounded concurrency per approved source |
| PostgreSQL | Managed private database with PITR | Private networking and connection pooling |
| Source objects | Private versioned object storage | Immutable keys, scoped service access |
| Queue | PostgreSQL outbox initially | Introduce managed queue when backlog/throughput requires |
| Email and billing | Selected external providers | Signed callbacks, retries and reconciliation |

Provider, region, budget and residency are O05. This topology is compatible with container-oriented hosting and does not require publishing the Java backend on the static prototype host. Keep dev, staging and production databases, object buckets, Clerk instances, webhook secrets and provider accounts separate. Use synthetic data in dev and sanitized, licensed fixtures in staging. No production source dump goes into the repository.

## Delivery pipeline

Pull request → contract validation, meaningful unit/integration tests, dependency and secret checks → frontend/backend builds → staging migration job → staging deploy → smoke and authorization checks → approved production rollout. Expand schema before switching readers. Database migrations run once per deployment with a dedicated role, never concurrently from every API instance. Rollback code independently while maintaining schema compatibility; rollback publication data through new revisions rather than destructive SQL reversal.

Environment configuration: INSTANCE_COUNTRY, INSTANCE_TIMEZONE, INSTANCE_ADAPTER and INSTANCE_DEFAULT_LOCALE define the deployment profile; they are not user preferences. NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is intentionally public; CLERK_SECRET_KEY, CLERK_ISSUER, CLERK_JWKS_URI, BILLING_WEBHOOK_SECRET, DATABASE_URL, SOURCE_BUCKET and APPROVED_SOURCE_CONFIG are server-only. Exact names are proposals. Environment startup validation rejects missing secrets and production use of demo/provider-test mode.

## Observability and recovery

Correlate request ID, ingestion run ID and publication revision across structured logs and traces. Monitor API latency/error rate, queue age, source last success, quarantine count, extraction field changes, alert delivery, webhook lag and membership reconciliation. Never use case party names or raw notice bodies as metric labels. Proposed alerts: API 5xx >2% for five minutes, queue age >30 minutes, source unchecked >48 hours, webhook processing >10 minutes; calibrate after pilot.

Proposed RPO is 15 minutes and RTO is four hours, pending budget and source retention review. Use managed point-in-time recovery and daily encrypted snapshots; test restores quarterly into an isolated environment, including evidence object availability and user/workspace integrity. Retain source-object versions according to approved policy and verify byte hashes on replay. Drill source outage, identity-provider outage, billing callback loss, duplicate worker task and DB failover. A stale catalog remains readable with warnings; protected mutations fail closed if authorization cannot be established.

## Shared auction domain, three listing routes

Proposed Next.js App Router routes /[locale]/properties, /vehicles and /other render one category-aware listing component with category-specific filter configuration. Shared asset detail/Notice routes derive the active category from the server response. Spring Boot validates a required category using one auction application service; PostgreSQL stores category separately from subtype. Workers classify before publication. Cache, cursor, search and notification keys include normalized category. No per-country or per-category microservice split is required by this design. Category never changes the deployment-configured country.

## Versioned filter evaluator

Proposed Spring application component parses/validates a typed version-3 AST and compiles a parameterized predicate shared by list, map, counts and saved-filter workers. Next.js renders the group builder and keeps draft and applied expressions separate. PostgreSQL evaluates the predicate with the mandatory visibility/category/tenant clauses outside all OR groups. Store canonical expression and schema version with each saved definition; bind cursors/caches and worker compilation versions to that representation. Prototype evaluation is in-memory demonstration only; production compiler and query-planning gates remain open.

## Separate filter route

Proposed Next.js /[locale]/filters route reuses the grouped builder component and user-owned saved-definition API. Keep applied listing state, editable draft, selected saved snapshot and authorized return context separate. The dedicated route is shared across all three listings; category-specific fields derive from draft category after retrieval. Browser-back/reload persistence and unsaved-edit recovery require production routing integration; the offline prototype demonstrates explicit Open/Apply/Cancel navigation and direct ?screen=filters entry only.

## Server pagination path

Next.js requests only the selected asset page from Spring and renders returned items plus metadata. Spring validates page/pageSize, compiles the same grouped expression and scope as the count, and asks PostgreSQL for a bounded ordered slice. Page-size/criteria changes cancel or supersede prior requests. Backend exact decimal, transaction/count consistency, offset performance and stale-response integration tests are required before release. The offline HTML prototype uses simulateItemPage only as an explicit local design adapter; it is not evidence of a deployed API or server-side query execution.

## Confirmed frontend foundation — 11 November 2026

Approved by the user: Next.js App Router, React, TypeScript and Tailwind; source-owned shadcn/ui components using Radix, styled to Studio and Studio Warm Blue; Geist/Geist Mono through next/font; clsx, tailwind-merge and class-variance-authority; next-themes; next-intl; react-hook-form, Zod and @hookform/resolvers; Sonner; @tailwindcss/typography and tw-animate-css; lucide-react; Clerk's Next.js integration, UI themes and Spanish/English localizations; ESLint/Next configuration and appropriate type packages. Typography is build-served; animations must respect reduced motion. Theme mode and palette remain independent preferences.

Build NEW custom data-grid and field components. Do not reuse the v1 grid or field implementations. Use the approved UI primitives and current requirements: grouped filters, user-owned saved filters and columns, server pagination with selectable sizes, multi-sort and shared single-line grid styling. Tags retain fixed columns and no filtering, pagination or column selector; editing/deletion occur only from the list. Validate locale/timezone and exact monetary values; backend validation and organization authorization remain authoritative.

Retain Leaflet/react-leaflet, with a client boundary for browser APIs and tile URL/attribution configurable per deployment. No country selection is introduced. The specific tile service remains open.

Recommended implementation details, not further confirmed choices: standardize Radix imports, coordinate Clerk and next-intl routing, verify compatible versions and pin a lockfile at application initialization rather than automatically copying v1 versions. Image lightbox implementation and plain img versus next/image remain open.

This decision governs the future frontend. The current editable HTML/CSS/JS prototype remains offline; no full Next.js foundation has been installed by this documentation update.
