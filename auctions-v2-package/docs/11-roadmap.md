# Implementation roadmap

The plan is a proposed sequence for a small cross-functional team, not a committed delivery estimate. Approximate durations assume two full-stack engineers, a designer/product owner part time, and an operations reviewer with access to source samples. Procurement, source access and legal/privacy review can change the schedule. The present deliverable is phase zero specification work; implementation has not begun.

| Phase | Indicative duration | Deliverables and dependencies | Exit criteria |
| --- | --- | --- | --- |
| 0 Validate scope | 1–2 weeks | Review this package, interview target users, assess source access, agree billing/map choices | C/P/A register reviewed, source and privacy owners assigned |
| 1 Foundation | 2 weeks | Next.js/Spring repos, CI, PostgreSQL migrations, Clerk integration, locale system, design primitives | Mandatory solo/invited organization onboarding, two-org isolation and single-country boundary tests pass; synthetic catalog searchable |
| 2 Evidence pipeline | 2–3 weeks | One approved CR connector, immutable storage, extraction drafts, reviewer queue, revision audit | Licensed labeled set available; critical-field review and replay work |
| 3 Discovery and detail | 2–3 weeks | Shared filter codec, list/map, asset/notice evidence, freshness and empty states | AC01–05 and bilingual mobile review pass |
| 4 Research workspaces | 2 weeks | Direct auction tags/annotations, member image attachments, user-owned saved filters and alerts and ADMIN/MANAGER/USER roles | AC06–08 pass with tenant isolation and delivery deduplication |
| 5 Subscriptions and hardening | 2 weeks | Selected billing integration, limits, SYSADMIN settings/operations, monitoring, recovery and accessibility review | AC09–13 pass; source/privacy/commercial gates approved |
| 6 Limited pilot | 2 weeks | Invited users, measured quality, source operations drill, refinement | Pilot outcome targets assessed, critical defects closed |
| 7 Expansion | After pilot | Second independently configured country instance and adapter, comparison/exports and richer alerts | AC14/AC15 and jurisdiction onboarding independently approved |

Some frontend implementation can overlap extraction once shared contracts stabilize. Do not run production ingestion ahead of source authorization, sell paid plans before lifecycle policies exist, or add a second jurisdiction by copying unreviewed CR assumptions.

## Initial implementation backlog

| Ticket | Deliverable | Dependency | Done when |
| --- | --- | --- | --- |
| AV2-001 | Approve source onboarding and privacy checklist | O01/O07 | Approved source configuration and licensed samples exist |
| AV2-002 | Convert tokens and mockup components into Tailwind/Next.js | Design review | Shared layout passes responsive and keyboard checks |
| AV2-003 | Apply schema with Flyway and app roles | Data/security review | Fresh install and tenant tests pass |
| AV2-004 | Implement Clerk token and workspace authorization | AV2-003/O04 | Wrong-org and revoked-member tests deny access |
| AV2-005 | Implement asset APIs and filter codec | AV2-003 | OpenAPI contract and AC01/02 pass |
| AV2-006 | Build source fetch, hash storage and draft extraction | AV2-001/003 | Repeat fetch and failure quarantine work |
| AV2-007 | Build evidence review and revision publication | AV2-006 | Concurrent review and audit cases pass |
| AV2-008 | Integrate licensed live map/geocoder | O03/AV2-005 | Precision and unknown-location behavior pass |
| AV2-009 | Implement direct auction tags, user-owned saved filters and delivery outbox | AV2-004/005/007 | No cross-organization access, personal fallback or duplicate alerts; SYSADMIN grants remain independent of organization roles |
| AV2-010 | Implement provider billing and entitlement projection | O02/AV2-004 | Forged/replayed/out-of-order callbacks tested |
| AV2-011 | Exercise deployment, restore and source outage | Working staging system | Approved recovery and observability targets demonstrated |

## Priorities and risk

Highest risk is extraction correctness and source availability, followed by private workspace isolation and mistaken interpretation of event status. Map licensing, commercial configuration and source privacy remain explicit gates. Reassess architecture after measured query latency, indexing cost and reviewer throughput; do not add infrastructure merely to match an assumed future scale. Record decision changes against stable C/FR/AC IDs so design, contract and implementation remain traceable.

## Three-listing delivery adjustment

Make category modeling and mapping review part of the domain foundation. Before releasing discovery, implement Properties, Vehicles and Other routes together, sharing the auction service and research permissions. Verify all three in responsive and bilingual QA. Source onboarding must supply authorized samples for each category; property-only parser coverage is insufficient for a three-listing release. Gate production on classification accuracy and category-scoped saved-filter integration tests. The prototype's example subtypes and default Properties landing route remain proposed choices.

## Grouped-filter delivery gate

Deliver the typed version-3 AST, schema validation, parameterized compiler and user-owned persistence before alert rollout. Add fixtures for all four inner/outer combinations, mixed currencies, unknown values, tags across organizations and category isolation. Run database plan/cost benchmarks for OR-heavy expressions and validate saved-filter migration behavior. The editable prototype covers the interaction and in-memory evaluation; server compiler, production indexes and worker parity remain required implementation work.

## Dedicated filter workflow delivery

Ship the separate filter route and owned save/retrieve integration together. Preserve the version-3 evaluator and access rules. Implement production routing/back/reload behavior, mutation failure recovery and accessible focus restoration before release. Keep Save-as-copy distinct from any future explicit overwrite feature. Server validation and membership checks remain release gates; local draft navigation does not replace them.

## Pagination delivery gate

Implement server count and bounded page queries with shared authorization/filter compilation, then connect the listing's size and navigation controls. Validate query plans, deep-offset/count cost, stale response handling and list/map independence before release. Keep alert matching independent of the user's current item page. Allowed sizes/default are proposed choices pending product confirmation; server-side paging and selectable size are confirmed.

## Approved frontend initialization

Initialize the approved stack in the decisions document with compatible pinned versions. Implement Studio tokens, Geist typography, Clerk/next-intl routing, next-themes modes, palettes, shared forms and Sonner feedback. Build new custom grids and date/datetime/numeric/currency/percent/unit fields; do not port v1 implementations. Retain Tags exceptions. Integrate Leaflet/react-leaflet with configurable tiles and attribution. Validate accessibility, locale/timezone behavior, server pagination, sorting and organization isolation.


## Confirmed shadcn/ui-first policy — 12 November 2026

Use official shadcn/ui components wherever applicable, throughout the application. This supersedes any earlier implication that generic controls or field visuals should be rebuilt independently. Retain the approved Radix foundation. Compose application behavior from these components; do not reuse v1 custom components. Obtain the user's decision before customizing component appearance or interaction to preserve a previously discussed design requirement. Earlier approval of Studio, compact grids or colored tags does not by itself approve a new shadcn component customization under this policy. Do not silently discard those requirements either: document the conflict and request a decision.

See [component coverage and customization decisions](13-shadcn-component-policy.md) for the complete mapping and proposed exceptions. No customizations are approved by that proposal. Standard supported props/variants, translated content and application data binding may be used without treating each use as a component customization; deviations from documented appearance/interaction need approval. An implementation must record component provenance and approved exceptions. The current offline HTML/CSS/JS prototype is a visual/behavior reference, not a shadcn React implementation. This update changes specifications, not the prototype runtime.


Stock shadcn appearance is now confirmed; Studio/compact-table customization proposals were declined. Review tag-selection and grid behaviors using docs/14-standard-component-review.md before implementing conflicting controls. Do not treat existing custom prototype styling as the implementation baseline.


## Confirmed stock-table behavior — 12 November 2026

Retain server-side pagination, selectable page sizes, multi-column sorting and user-saved visible columns using standard shadcn controls. Defer column-edge resizing, persisted widths and enforced single-line truncation for the first implementation. Default table layout may wrap content; do not impose the prior compact heights, darker header or ellipsis rules. These deferred adaptations remain backlog items requiring a later explicit decision, not first-release acceptance conditions. Ignore historical saved width preferences in the new stock frontend; visible-column preferences remain supported. Tags keeps its fixed columns and no filter/pagination/column selector. The existing custom offline prototype remains a historical behavior reference, not the migrated stock frontend. No tag-picker alternative has been approved yet.


## React preview delivered — 13 November 2026

The current preferred preview is the real Next.js app in [frontend](../../frontend/README.md), using official shadcn Radix Nova components and actual Table grids. The original offline HTML remains a reference. See [React implementation, verification and limits](16-react-preview.md). Server-side fixture pagination/filtering/sorting is now implemented in Next Route Handlers; production Spring/PostgreSQL and tenant authorization remain future work. The user approved the stock Popover/Toggle tag-picker composition with colored tags and no checkmarks. Browser persistence is a simulation, not an authorization boundary. Earlier pending tag-picker/vanilla-only statements are superseded.
