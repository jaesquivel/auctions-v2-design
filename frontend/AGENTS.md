<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->


## Active work scope — frontend only (13 November 2026)

The user's latest instruction supersedes earlier directions to keep legacy mockups or package documents synchronized. All future implementation, styling, tests, screenshots and new app documentation belong in `frontend/`. The old `auctions-v2-package/` is frozen as read-only historical reference: do not modify its mockups, regenerate its documents/index/manifest, or run tools that write into that package. Consult it only when useful for prior requirements. Do not mirror frontend changes back to it. Preserve this rule in project instructions; changes outside `frontend/` require a later explicit user request, except recording this scope in the root AGENTS.md. Continue using the canonical project directory and do not create ZIPs or commit/push unless requested.

Grid rows are always single line. Tags in list cells never wrap; overflow content truncates with full text available in titles/detail. This latest instruction supersedes the earlier deferral of single-line/truncation behavior. Column resizing and saved widths remain deferred. Detail-header tags may still wrap responsively.

Use the shared components/ui/data-table.tsx (shadcn Data Table pattern + TanStack Table 9.3.1) as the base for all data grids. This latest explicit user instruction supersedes the earlier no-TanStack implementation decision. Preserve manual server sorting/pagination and per-user visibility; do not paginate a server page again. All grids retain single-line/truncation rules; Tags still has no filtering, pagination or column selector. Sidebar sections are Auctions, Data Extraction, Configuration, System. System must be absent for non-SYSADMIN users, including organization ADMIN; retain the existing direct-route guard. Data Extraction review is an honest unconnected placeholder, not permission to publish or run ingestion.

The user explicitly requested full migration to Base UI. All app-owned shadcn components use official base-nova output in components/ui, backed by @base-ui/react. components.json must stay base-nova. Use render composition, Base UI callback/value APIs and the shared root TooltipProvider; do not reintroduce radix-ui, @radix-ui/*, asChild or a duplicate components/ui/base tree. Preserve existing Nova appearance and domain behavior. Generate stock primitives through shadcn CLI so font/menu/direction markers are resolved. Forms require explicit submit buttons; menu radio/checkbox items use closeOnClick according to the existing interaction (column selector stays open).

All table action columns are the rightmost column and remain pinned to the right during horizontal scrolling. Apply this in the shared DataTable; preserve the existing order of the remaining data columns (Tags first among data columns). Keep the action header visually untitled and do not add actions to tables that have none.

Container deployment targets linux/amd64. Use BUILD_STANDALONE=1 in the Docker builder, preserving normal local build/start. Keep the standalone Next output, public/static copies, non-root runtime and health endpoint. NEXT_PUBLIC values are build-time public arguments; Clerk secret is runtime-only. Never copy .env or credentials into image layers. Deployment documentation and validation must distinguish local standalone checks from actual image/container verification; never claim an image exists until the engine has built it.

Container scope is the Docker image and local Compose setup only. Keep hosting, domain, TLS and web-proxy infrastructure outside this project unless explicitly requested.
