# React / Next.js interactive preview

Delivered 13 November 2026. The preferred interactive preview now runs from the real [frontend application](../../frontend/README.md), alongside the original offline mockup package. Open [Spanish](http://127.0.0.1:3000/es/properties) or [English](http://127.0.0.1:3000/en/properties) after starting its local server.

## Actual foundation

Next.js App Router 16.4.6, React 19.3.1, TypeScript, Tailwind CSS 4, official source-owned shadcn Radix Nova components, Geist served through next/font/local, Lucide, next-themes, next-intl, React Hook Form, Zod/resolvers, Sonner, Typography, motion helpers, clsx/tailwind-merge and the official registry's cn utility. Leaflet/react-leaflet renders the illustrative map. Clerk's Next.js/UI/shadcn theme/localizations are installed and conditionally wired when both keys are configured; no remote account was created. The production lockfile and components.json record the dependency/preset choices.

All React grids use the actual shadcn Table components, including item listings, Tags, auction rounds and team members. Business filtering/sorting/pagination is newly written application logic rather than a copied v1 grid or another table engine. Components retain official Nova styles. The scoped lint exception for the registry's unchanged mobile hook is documented in frontend/eslint.config.mjs.

## Behaviors

150 fictional records are served by real Next.js Route Handlers. POST /api/items/query validates grouped AND/OR filters and performs server sorting/pagination before returning only the requested page. GET /api/items/{id} returns detail/related records and the preserved full synthetic notice. These are local preview adapters, not a replacement for the proposed Spring Boot API contract.

Visible columns, page sizes, multi-sort, separate filter editing/save/load, user-owned filters and organization-owned research are simulated with scoped browser persistence. Column-edge resizing, saved widths and bespoke truncation remain deferred. The official Table uses its default cell behavior. Properties/Vehicles/Other maintain category-specific information; Vehicles/Other do not show location data.

Unified item forms include General info, Auction, Registry info, Notice, Registry, Properties-only Location and Images. Header tags use the now-approved stock Popover and Toggle composition with colored badges, no checkmarks, immediate assignment and no Assign Tags button. Tag CRUD has inline edit/delete and a create form; no active field, filter, pagination or column selector. Source fields and original notices remain immutable. Unknown source facts are unreported, never verified absence.

Optional fictional participation calculations retain source/rule provenance and exact minor-unit arithmetic; no real legal default is introduced. Image previews use memory/object URLs, a standard Dialog viewer, local validation and no server upload. They survive tab changes within the loaded application and clear on reload. Registry lookup, billing, invitations, notifications and ingestion remain visibly simulated or unavailable.

## Scope and limits

This user request confirms creation of the React application, not a production deployment. Local storage scopes are a behavior demonstration, not tenant security. Server fixture routes are public to this locally bound preview. Clerk credentials/sign-in do not implement production organization mapping or authorize private research APIs. Do not use real private data. Java/Spring Boot, PostgreSQL, object storage, production auth/authorization, actual source ingestion and billing remain future work.

All users still operate within a demo organization. Role and SYSADMIN controls are explicitly simulation controls. Instance country remains CR, with no country selector. Tile URL/attribution are deployment options; no external tile requests occur by default. Real parcel coordinates and geocoding are not provided.

## Verification

Production build, TypeScript and ESLint pass. 12 domain tests and 4 live API/route tests pass. Runtime dependency audit reports zero known advisories with dev dependencies omitted; this does not claim a clean development-tooling audit.

Browser checks verified actual Table slots/Radix controls, server page-size/page transitions, grouped filter save/apply/load, per-user saved-filter ownership and column persistence, multi-sort, organization research separation, draft preservation during tag assignment, research persistence after reload, tag create/edit/delete, English/Spanish routing, light/dark modes, Leaflet loading without external tiles, and the mobile sidebar sheet closing on navigation. At 390 px the page remained 390 px wide while the Table scrolled inside its content area. No complete accessibility audit or credentialed/live-service testing is claimed.

- [Run instructions and detailed boundaries](../../frontend/README.md)
- [Component provenance](../../frontend/qa/components.json)
- [Machine-readable verification](../../frontend/qa/validation.json)
- [React desktop screenshot](../../frontend/qa/react-desktop.png)
- [React mobile screenshot](../../frontend/qa/react-mobile.png)
- [React auction tab screenshot](../../frontend/qa/react-auction.png)

The old HTML mockups and screenshots remain editable historical design references. Statements in earlier documents that only a vanilla runtime exists are superseded by this delivery. No ZIP is produced.
