# Auctions / Remates requirements and decisions

Version 1.4 · 6 November 2026 · English specification with Spanish and English product copy.

This package specifies an auction-item discovery and judicial auction notice research application with Properties, Vehicles and Other listings. It is a development specification and design prototype, not a running auction service. Every listing, amount, date, court label, person, and organization in the prototype is fictional. No bidding, payment of judicial deposits, property valuation, or legal certification is performed.

## Evidence and requirement status

The project workspace was empty at the beginning of this task. The referenced chat, “Create Auctions App Docs Mockups” (6aeb9739-aacc-83e8-bab8-4eaa33e45755), contained a scope handoff and no attachments, implementation, brand assets, prior schema, approved pricing, or source agreements. The current user request and subsequent clarification are the controlling requirements baseline. The clarification confirms one configured country per instance and supersedes the original country selector and client-supplied country filter.

| Status | Meaning | Authority |
| --- | --- | --- |
| Confirmed C | Explicitly requested scope | Current request and earlier scope handoff |
| Proposed P | Concrete recommendation ready for review | This package; not prior approval |
| Assumption A | Working condition requiring validation | No supporting project evidence |
| Open O | Unresolved decision with an owner and release gate | Decision register below |

## Confirmed baseline

| ID | Requirement | Delivered specification |
| --- | --- | --- |
| C01 | Costa Rican judicial auctions and notice extraction; extensible to other countries | Product, ingestion, data and architecture |
| C02 | Property discovery, search, advanced filters, tags and maps | Product and UX, discovery mockups |
| C03 | Asset and notice detail | UX, API, data and detail mockups |
| C04 | Spanish and English | Localization specification and prototype language switch |
| C05 | Next.js App Router and Tailwind frontend | Architecture and design tokens |
| C06 | Java and Spring Boot backend where appropriate; PostgreSQL | Proposed Spring modular monolith and SQL model |
| C07 | Clerk authentication, subscriptions and organization roles | Security, API and workspace mockups |
| C08 | Comprehensive docs, responsive high fidelity mockups, editable artifacts and linked index | This offline package |
| C09 | Multi-country software; each deployment is configured for exactly one country, with no user or administrator country selection | Instance configuration, country-scoped API and mockups |
| C10 | Every user belongs to an organization, including single-user organizations; no personal workspace mode | Onboarding, organization-only ownership, membership, billing and mockups |
| C11 | Exactly ADMIN, MANAGER, USER roles; ADMIN edits all organization settings/users; MANAGER edits operational settings such as available tags | Role matrix, settings, contracts and schema |
| C12 | SYSADMIN is the system-level role for system configuration and operational tasks; organization roles remain ADMIN, MANAGER and USER | System permissions, settings, operations and contracts |
| C13 | No saved/favorite auction items; users assign tags directly to auction items | Direct tag assignment, discovery filters, no Saved navigation/state |
| C14 | Searches can be saved and are owned by the user | User-owned saved-search API, storage, alerts and owner-only access |
| C15 | No images in auction list rows; organization members may attach images from an item’s Images tab | Text-first list, member image tab, private attachment contract and model |
| C16 | Product, domain, API and documentation use Notice terminology | Notice routes, types, source references and bilingual copy |

## Organization requirement clarification

C10 supersedes all earlier personal-workspace and individual-subscription concepts. Every user belongs to at least one organization, including a one-person organization. A workspace is the research area of an organization, never a separate personal ownership type. The proposed onboarding flow creates a solo organization for a new user who is not joining an existing one; invitation-first onboarding avoids creating an unnecessary extra organization.

## Role clarification

C11 supersedes the earlier four-role model. The three organization roles are exactly ADMIN, MANAGER and USER. ADMIN manages the full organization settings including users; MANAGER manages operational settings including the available organization tags list. USER research capabilities below are proposed, not a confirmed restriction to read-only access. No separate Owner level remains. The proposed solo-organization bootstrap role and final-administrator safeguard use ADMIN.

## System role clarification

C12 confirms SYSADMIN for system configuration and operations. It is modeled separately from organization membership roles, preserving C11. A user may have an organization role plus SYSADMIN; organization membership remains mandatory. Exact system settings, tasks, role-provisioning process and lack of automatic private-organization access are proposed decisions. The fixed-country requirement still applies: SYSADMIN does not select or change the instance country at runtime.

## Tagging and saved-search clarification

C13 removes the saved/favorite auction-item concept entirely. A tag assignment links an organization tag directly to an auction asset; no save action, favorite flag or prerequisite collection exists. Organization scope for available tag definitions and shared assignments follows the current proposal. C14 confirms saved searches are user-owned, independently of the active organization. An organization context can constrain private tag filters, execution permissions and entitlements, but it is not the owner of the search. Organization ADMIN and SYSADMIN gain no automatic access to another user’s searches.

## Proposed decision register

| ID | Proposal | Reason and consequence | Responsible party and review gate |
| --- | --- | --- | --- |
| P01 | Spring Boot modular monolith plus isolated ingestion worker | One transaction boundary initially; worker can scale independently | Engineering before implementation |
| P02 | Global public catalog; private organization research workspaces only, including solo organizations | Organization-only ownership is confirmed by C10; public catalog sharing remains proposed | Product and security before schema approval |
| P03 | Spanish default, English UI; source text preserved in original language | Prevent silent translation of legal content | Product before content signoff |
| P04 | Three unpriced feature bundles: Explore, Research, Team | Entitlements can evolve independently of role checks | Commercial owner before billing |
| P05 | PostgreSQL full text and PostGIS when licensed geocoding is available | Avoid a separate search service at initial scale | Engineering after representative load tests |
| P06 | Human review before publishing critical extracted fields | Date and money errors can materially mislead users | Operations before public catalog |
| P07 | Web and email saved-search alerts, daily digest initially | Simple delivery and controlled notification volume | Product before alert pilot |
| P08 | No automatic currency conversion or inferred legal status | Avoid fabricated comparability and certainty | Product before discovery launch |
| P09 | Public anonymous catalog browsing; authenticated direct tag assignment | Supports discovery; exposure policy needs approval | Product and privacy before indexing |
| P10 | Private workspace sharing; public source citations with redaction controls | Balance traceability and unnecessary personal data exposure | Privacy lead before ingestion |

## Assumptions and release questions

| ID | Assumption or open question | Proposed owner | Gate |
| --- | --- | --- | --- |
| A01 | An authorized, usable notice source and download mechanism can be secured | Operations | No live ingestion without source assessment |
| A02 | Initial users research real estate rather than vehicles or movable assets | Product | Validate with five target users before MVP scope freeze |
| A03 | Illustrative capacity: 100,000 assets, 1 million notice revisions, 100 concurrent searches | Engineering | Replace with measured source volume before sizing |
| O01 | Source terms, retention, redistribution, robots/rate limits and privacy obligations | Source owner and qualified local counsel | Required before external source ingestion |
| O02 | Billing provider, prices, taxes, cancellation and refund policy | Commercial and finance | Required before paid checkout |
| O03 | Geocoder and basemap provider, licensing and regional accuracy | Product and engineering | Required before live map |
| O04 | Which organization roles need Clerk custom permissions and which Clerk features are available in the chosen account | Security | Required before organization pilot |
| O05 | Hosting vendor, region, residency and recovery budget | Operations | Required before production procurement |
| O06 | Extraction quality targets and review staffing against licensed labeled examples | Operations | Required before automatic release |
| O07 | Privacy notice, lawful use review, deletion and source correction process | Privacy and counsel | Required before public indexing |

## Reading and use

Read [product requirements](01-product-requirements.md), [UX and screens](02-journeys-and-information-architecture.md), and [roadmap](11-roadmap.md) first. Engineers should then use the [API guide](05-api-contract.md), [data model](06-data-model.md), [ingestion specification](07-ingestion-and-normalization.md), and [security model](08-security-and-permissions.md). All P and A items remain reviewable proposals, even where written as implementation instructions.

## Confirmed C17: auction items in three listings

Auction items are the focus of the application. Primary listings are Properties, Vehicles and Other (Spanish: Propiedades, Vehículos, Otros). These are first-class navigation destinations, not organization tags. No combined All items listing is proposed for primary navigation. This supersedes property-only discovery wording in the original scope.

Proposed P17: use one shared auction domain and API with a required category discriminator (properties, vehicles, other); Properties is the initial landing listing. Subtype taxonomies, category switching/reset behavior, routes and normalization rules below are proposed implementation decisions. Other is an intentional non-property/non-vehicle category, not an automatic destination for uncertain extraction.

## Confirmed C18: gavel logo reference

Use the supplied monochrome split-screen gavel image as the basis for the system logo on home and other surfaces. The subsequent supplied replacement SVG supersedes the initial approximation. Active black/white variants preserve its six right-hand gavel paths with scale, position and fill adaptations. The original supplied SVG is preserved in the brand directory. Brand assets are included under brand/.

## Confirmed C19: filter-only discovery

All auction discovery is performed through filters. There is no independent search box, Search button or separate text-search workflow. This applies to Properties, Vehicles and Other, in list and map views. Saved searches remain user-owned saved filter definitions; UI labels now say Save filters / Guardar filtros. Proposed execution retains optional text/reference matching as a criterion inside the same filter form, applied together with structured criteria. This supersedes earlier separate search-box copy.

## Confirmed C20: grouped Boolean filter terms

Terms can be grouped. Each group combines all its terms with AND or with OR; multiple groups combine using AND or OR. Saved filter definitions preserve that grouping. This supersedes the implicit conjunction-only behavior described in C19; the filter-only workflow remains confirmed.

Proposed P20: use two explicit levels initially (terms inside groups, groups inside the expression), with an independent operator for each group and one operator between groups. No implicit precedence, mixed unparenthesized operators or arbitrary recursive nesting. Limits of 10 groups, 20 terms per group and 100 terms total are proposed safeguards. No groups means the category-scoped catalog; an empty existing group is invalid. Category, configured country, organization permissions and entitlements always apply outside the Boolean expression.

## Confirmed C21: separate filter view with save/retrieve

Filters are displayed in a separate view opened by a button from the listings. Save and retrieve controls live inside that view. This supersedes the inline filter pane and mobile disclosure, while preserving grouped AND/OR semantics and user ownership.

Proposed interaction: Open filters opens a full-page editor. Apply and view results validates and returns to the listing; Cancel returns without changing the previous applied definition. Save stores the validated draft as a named new definition, without applying it; Retrieve loads a detached draft and restores its saved category/organization context, subject to current membership. These save/apply and context-restoration details are proposed design decisions, not additional user-confirmed rules.

## Confirmed C22: localized name

The application is named Auctions in English and Remates in Spanish. No v2 appears in the displayed app name or as an adjacent badge. This supersedes the earlier working identity. Technical project paths remain unchanged.

## Confirmed C23: server-side item pagination

Auction item listings use server-side pagination and a selectable page size. This applies to Properties, Vehicles and Other. Proposed P23: one-based page numbers, default size 25, allowed sizes 5/10/25/50/100, previous/next controls and server-reported totals/ranges. Pagination is transport/presentation state, not a grouped filter term or part of a saved definition. Technical API revision is not part of the application name.

## Confirmed single-line item table layout

Use one line per record with no stacked cell content. Keep Tags and Notice buttons together in the rightmost Actions column. This supersedes the earlier compact multiline mobile proposal; narrow viewports use horizontal table scrolling.
