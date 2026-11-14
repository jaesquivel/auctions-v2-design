<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->


## Active work scope — frontend only (13 November 2026)

The user's latest instruction supersedes earlier directions to keep legacy mockups or package documents synchronized. All future implementation, styling, tests, screenshots and new app documentation belong in `frontend/`. The old `auctions-v2-package/` is frozen as read-only historical reference: do not modify its mockups, regenerate its documents/index/manifest, or run tools that write into that package. Consult it only when useful for prior requirements. Do not mirror frontend changes back to it. Preserve this rule in project instructions; changes outside `frontend/` require a later explicit user request, except recording this scope in the root AGENTS.md. Continue using the canonical project directory and do not create ZIPs or commit/push unless requested.

Grid rows are always single line. Tags in list cells never wrap; overflow content truncates with full text available in titles/detail. This latest instruction supersedes the earlier deferral of single-line/truncation behavior. Column resizing and saved widths remain deferred. Detail-header tags may still wrap responsively.

Use the shared components/ui/data-table.tsx (shadcn Data Table pattern + TanStack Table 9.3.1) as the base for all data grids. This latest explicit user instruction supersedes the earlier no-TanStack implementation decision. Preserve manual server sorting/pagination and per-user visibility; do not paginate a server page again. All grids retain single-line/truncation rules; Tags still has no filtering, pagination or column selector. Sidebar sections are Auctions, Data Extraction, Configuration, System. System must be absent for non-SYSADMIN users, including organization ADMIN; retain the existing direct-route guard. Data Extraction review is an honest unconnected placeholder, not permission to publish or run ingestion.

The Sidebar uses the official shadcn Base UI/Nova component requested by the user, with isolated dependencies in components/ui/base and @base-ui/react. Preserve its render composition and dedicated TooltipProvider. Other UI components retain their existing Radix Nova foundation.
