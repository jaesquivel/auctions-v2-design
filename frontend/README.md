# Auctions / Remates — React preview

A real Next.js App Router application using the official shadcn/ui **Radix Nova** components and the b2fA Neutral/Geist preset. This is the preferred interactive preview. The older offline design package remains in `../auctions-v2-package`.

## Run locally

From this directory (Node.js 20.9+):

```sh
npm ci
npm run dev
```

Open [Remates in Spanish](http://127.0.0.1:3000/es/properties) or [Auctions in English](http://127.0.0.1:3000/en/properties). The server binds to 127.0.0.1. If port 3000 is in use, stop that preview before starting another instance.

To run the optimized build:

```sh
npm run build
npm start
```

## Libraries actually used

- Next.js 16.4.6, React/React DOM 19.3.1, TypeScript and Tailwind CSS 4.
- Official shadcn 4.23.0 source-owned `radix-nova` components under `components/ui`, including **Table** for every grid. New custom application grid logic; no v1 grid reuse and no TanStack/AG Grid engine.
- Radix primitives, Lucide React icons, Geist through `next/font/local`, class-variance-authority, clsx and tailwind-merge. The current official registry also imports its `cn` helper package.
- next-themes for light/dark/system, next-intl for `/es` and `/en` routes and messages, React Hook Form with Zod/resolvers, Sonner, Tailwind Typography and tw-animate-css.
- Leaflet/react-leaflet for the illustrative Properties map, dynamically loaded on the client.
- Clerk Next.js, UI/shadcn theme and es/en localization integration; credentials optional and absent by default.

`package-lock.json` records the resolved dependency graph. `components.json` records Radix/Nova. `qa/components.json` records the component file inventory and hashes. Generated component styling/interaction is retained; the registry's original mobile hook has a scoped lint exception for its initialization effect. Application compositions add domain behavior without replacing the primitive components.

## Working simulation

- 150 explicitly fictional records: 50 Properties, 50 Vehicles, 50 Other. No listing images.
- **Real server-side** grouped filtering, multi-sort and pagination through `POST /api/items/query`; clients receive the requested page rather than the whole catalog. Page sizes 5/10/25/50/100, nulls last, stable ID tie-breaker and exact decimal amount comparison. One currency is required for amount sorting/filtering.
- Filters are edited in a separate view. Save stores a validated user-owned draft; load restores a draft/context; Apply changes results; Cancel leaves the applied listing intact. AND/OR operators work at group and term levels.
- Per-demo-user/category visible columns persist in this browser. Column resizing, saved widths and custom truncation remain deferred. The stock Table may itself use its documented nowrap defaults; no custom one-line grid layout is added.
- Shared item view/edit screen, header tags, General info, Auction, Registry info, Notice, Registry, Properties-only Location, Images. Auction rounds, bases, optional calculated fictional participation costs, lot relationships and related item links are present.
- Notes, appraisal and market values are stored separately from immutable source data, under organization/item keys. Properties and Vehicles show optional government tax values.
- Original synthetic notice text is carried over intact from the earlier prototype. Source description/liens, parties/court/venue/office, reference/case, publication and extraction notes are read-only.
- Tags: 27 fictional team labels plus a solo label. Colored assignment uses approved stock Popover/Toggle composition with no checkmarks. Tag CRUD is inline/list based; no active field. Tags grid has no filters, pagination or column selector. Soft deletion preserves existing assignments.
- Images: JPEG/PNG/WebP, 10 MB each, 20 per item; browser object-URL previews and a Dialog viewer. No files are uploaded. Images survive tab changes during the current loaded app session and reset on reload; research and preferences persist in local storage.
- Overview, saved-filter alerts, organization settings, team-role simulation, plans and SYSADMIN operation previews. Demo profile menu switches users and roles. Every demo user operates within an organization.

## Persistence and security boundary

This is **not a production service**. Catalog/notice fixture routes are read-only and public to the local preview. Research, tags, roles and saved filters use `auctions-react-preview:v1` in this browser's local storage; image previews are memory-only. Demo role controls and organization separation demonstrate behavior, not security enforcement. Do not enter sensitive/private records or deploy this preview as an authenticated multi-tenant backend. The Java/Spring Boot, PostgreSQL, object storage, audited authorization and production contracts remain specified in the design package and are not implemented here.

All demo users can switch between the two fixed demo organizations. Demo 01 starts as MANAGER in the team and ADMIN in the solo organization; Demo 02 starts as USER. Saved filters/column choices stay tied to the selected demo user; notes and item tags use organization scope. This is independent from a real Clerk identity.

No bidding, payments, email delivery, invitations, ingestion jobs, legal verification or real registry lookup occurs. The app labels these boundaries. Subscription prices remain undecided. Notices and coordinates are fictional; participation cost examples are not country-law defaults.

## Optional service configuration

Copy `.env.example` to `.env.local` only if connecting your own approved services. Do not commit real keys.

Both `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` enable ClerkProvider, locale-specific Clerk UI/theme and middleware, with sign-in available at the profile control and `/es/auth`. No Clerk account/application is created automatically. Real Clerk sign-in is not a replacement for the unfinished backend organization/role mapping; demo research continues to use the selected preview context. Credentialed Clerk flows were not tested without keys.

Map tiles are **off by default**. Set both `NEXT_PUBLIC_MAP_TILE_URL` and `NEXT_PUBLIC_MAP_ATTRIBUTION` to an approved provider to enable them. Leaflet otherwise shows its map container and explicitly fictional demonstration points without external tile requests. No production geocoding or actual parcel coordinates are provided. Instance country is fixed to CR for these fixtures; there is no user/admin country selector. Another country needs an adapter and fixture/configuration work.

## Checks

```sh
npm run lint
npm run typecheck
npm test
npm run build
# With the local app running, include HTTP integration checks:
PREVIEW_TEST_URL=http://127.0.0.1:3000 npm test
```

12 domain tests plus 4 opt-in live API/route tests. Production build and lint/type checks pass. Browser review covers page-size/page transitions, filter save/apply/load, user ownership, column persistence, multi-sort, organization research separation, tag create/edit/delete, draft-preserving assignment, locale/theme switching, actual Leaflet loading, mobile table overflow and mobile sidebar-sheet navigation. It is not a full accessibility audit or test of live Clerk/payments/database/ingestion.

## Source map

- `app/[locale]/[[...path]]/page.tsx`: localized screen routes.
- `components/ui/`: official shadcn Radix Nova components.
- `components/item-grid.tsx`, `filter-editor.tsx`, `item-detail.tsx`, `tag-management.tsx`: application workflows.
- `lib/domain.ts`: schemas, grouping/sorting/paging, exact money and validation.
- `lib/catalog.ts`: server-only fixture adapter; replace with the future backend adapter.
- `lib/preview-store.tsx`: explicitly local demo persistence and scope simulation.
- `data/`: immutable fictional catalog and source notices; not public browser assets.
- `app/api/items/`: local Next Route Handlers, not the production Spring API.
- `messages/`: editable English/Spanish messages.
- `public/brand`, `public/fonts`: supplied logo and licensed self-hosted Geist.

No ZIP is generated. All project work stays under the canonical project directory.
