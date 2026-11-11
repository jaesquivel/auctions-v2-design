# Auctions / Remates documentation and mockup package

Version 1.0 · 4 November 2026 · Costa Rica first, Spanish and English interface.

Start with [the readable index](index.html), then [the interactive mockups](mockups/index.html). Open these files directly from the project directory. No build, account, remote service or internet connection is required. Modern Chrome, Safari, Firefox or Edge is recommended for native dialog support.

## Contents

| Folder | Deliverable |
| --- | --- |
| docs | Thirteen editable Markdown specifications and matching HTML previews |
| mockups | Responsive editable HTML, CSS, JavaScript and design tokens |
| contracts | Proposed OpenAPI 3.1 JSON with 41 operations |
| data | Proposed PostgreSQL schema and 150 fictional listing fixtures (50 per category) across Properties, Vehicles and Other |
| diagrams | Editable Mermaid architecture, ERD and sequence, plus SVG previews |
| qa | Desktop/mobile screenshots, responsive gallery and actual validation report |
| tools | Local regeneration and consistency-check utilities using Python/Node standard libraries |

The documents cover requirements and decisions, PRD, journeys and IA, screen inventory, UX/UI foundations, API semantics, data, ingestion, security, deployment, acceptance and roadmap. The mockup guide identifies demonstrated interactions and integration boundaries. Direct screen links accept ?screen=asset, ?screen=notice, ?screen=review, ?screen=team and other screen IDs from the guide; use ?screen=discover&view=map for the map, and &lang=en for English.

## Instance country

The software supports multiple countries through separately configured instances. Each instance serves exactly one country, configured at deployment time. Users and application administrators cannot select or change it. The reference mockup shows Costa Rica as read-only context. UI language selection and within-country location/currency filters remain available. See deployment/instance.example.env.

## Mandatory organization membership

Every user belongs to an organization, even when they are the sole member. Organization workspaces, auction tag assignments, annotations and billing subscriptions are organization-scoped; saved searches are user-owned; there is no personal workspace or user-owned billing mode. Proposed onboarding joins an invited organization or creates a solo organization with its user as ADMIN. The prototype switches between a multi-member organization and a one-member organization to demonstrate identical ownership and isolation rules.

## Requirement status

Confirmed means explicitly requested by the user; proposed means newly recommended in this package; assumptions and open questions require validation. The project folder contained no pre-existing implementation or files, and the earlier chat supplied only a scope handoff. This is a coherent starting specification, not a claim of prior approval.

All auction records, amounts, schedules, identities, source texts and property artwork are synthetic demonstrations. Maps are deliberately schematic. No auction data is scraped, no email is sent, no payment is made, and no authentication is performed. Local state resets on reload. “Reviewed extraction” describes transcription review and conveys no legal guarantee.

## Editing and regeneration

The project directory is the canonical deliverable. Run `python3 tools/package_release.py` to refresh the screenshot gallery and file manifest only; it does not create an archive.

Edit docs/*.md, then run `python3 tools/build_package.py` from this folder to regenerate readable document previews, the index, SVG summaries and JSON fixture export. This utility uses Node for fixture extraction. Edit tools/build_contract.py and run `python3 tools/build_contract.py` to regenerate the OpenAPI contract. The SQL is editable directly and must be converted into reviewed migrations before use.

Run `node tools/check-prototype.cjs` and `python3 tools/check_package.py` for package checks. These checks do not replace a full OpenAPI validator, database migration testing, real browser accessibility audits or backend authorization testing. Screenshot and layout evidence describes the prototype revision at capture time.

All source files and screenshots are maintained directly in the project directory, with a SHA-256 file manifest. ZIP archives are no longer generated. No proprietary runtime, node_modules, user secrets or external network assets are required. Production development must still resolve source authorization, privacy, provider choices and billing decisions recorded in docs/00-decisions-and-context.md.

## Organization roles

Exactly ADMIN, MANAGER and USER. ADMIN edits all organization settings and users. MANAGER edits operational settings such as the available organization tags list. USER normal research and existing-tag assignment are proposed baseline permissions. No separate Owner level remains.

## System administration

SYSADMIN allows system configuration and operational tasks within the configured instance. It is separate from the organization role; SYSADMIN users still belong to an organization. Proposed privileges do not automatically grant organization ADMIN or private access to other organizations. Use the independent System role preview in the mockup to inspect allowed and denied screens. Country remains fixed at deployment.

## Auction tags and saved searches

Auction items are never saved/bookmarked. Assign tags directly and find items with discovery filters. Saved searches remain available and belong to the user, including across organization switches. Their organization execution context does not transfer ownership.

## Auction images

Auction list rows do not show images. An organization member can attach images from the item’s Images tab. Organization-private visibility, size/type limits and deletion rules are proposed; the prototype provides local previews only.

The three primary auction listings are Properties, Vehicles and Other (Propiedades, Vehículos, Otros). Editable views: mockups/index.html?screen=discover&category=properties, category=vehicles or category=other. Shared detail/Notice, tags, member Images and user-owned saved searches apply to all three. The starting Properties route and subtype taxonomy are proposed.

Brand assets: brand/index.html previews the reference-based gavel identity; brand/ contains editable SVG marks, wordmarks, favicon and usage guidance.

Discovery uses one filter form, with no separate search box or Search action. Optional text/reference is a filter criterion. User-owned saved definitions are labeled Save filters in the interface; internal SavedSearch API names remain compatible.

Grouped filters: each group has an AND/OR choice for its terms and the expression has an AND/OR choice between groups. Saved definitions preserve the AST (schemaVersion 3). See data/grouped-filter-examples.json and the group-builder walkthrough. No separate Search workflow.

Filter view: listings open ?screen=filters through Open filters. Save and Retrieve controls live there. Save stores a valid draft as a named copy; Retrieve restores a draft; Apply returns to results; Cancel preserves prior applied criteria/context. These interaction details are proposed. Saved definitions remain user-owned.

Item listings specify server-side pagination with selectable page size. The offline prototype simulates bounded responses over fictional fixtures; production must use the server API. Preview a partial second page with mockups/index.html?screen=discover&pageSize=5&page=2. Page/pageSize are not saved filters.

Appearance exploration: open mockups/themes.html to compare four palettes and launch light/dark combinations. The app header exposes palette and Light/Dark/System selectors; choices persist locally. Item-list buttons are frameless, retaining focus outlines.
