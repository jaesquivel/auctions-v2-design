# Base UI migration

The entire app-owned UI now uses shadcn Base UI Nova. User authorization: “Change everything that uses Radix to Base UI.” The Nova/Neutral/Geist appearance, domain layouts and agreed interactions remain.

- Regenerated all 30 stock component files through the official shadcn CLI with base-nova, resolving registry aliases, Lucide icons and generator font/menu/direction markers.
- Removed radix-ui and all Radix packages from the resolved dependency graph.
- Consolidated the seven isolated Sidebar components into the shared components/ui directory; one root Base UI TooltipProvider serves all components.
- Replaced asChild compositions with render. Link buttons use nativeButton=false and Next links.
- Select receives its label/value item collection and guards null changes. ToggleGroup uses an array value and multiple=false.
- Menu labels are inside Groups. Organization/account/appearance/locale selections close on click; the column selector intentionally stays open.
- Forms have explicit submit actions; confirmation actions explicitly close the controlled dialog after completion.
- Existing TanStack DataTable server pagination/sorting, user columns, truncation, tags, role guards and mobile navigation remain application compositions.

The previous shadcn-audit files are explicitly marked as a historical snapshot. Their mixed-foundation and raw-generator-marker findings are resolved by this migration; unrelated domain compositions were not redesigned.

Validation and browser coverage are recorded in validation.json. Credentialed Clerk flows remain untested without service keys. Third-party Clerk, Leaflet and Sonner remain their own libraries; no app-owned Radix controls remain. No changes were made to the old mockups and no commit/push was performed.
