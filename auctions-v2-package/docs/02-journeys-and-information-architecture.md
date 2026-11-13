# User journeys and information architecture

## Navigation and ownership

Public catalog routes use /[locale]/properties, /[locale]/vehicles, /[locale]/other, /assets/[id], and /notices/[id]. Authenticated routes use /workspace/[workspaceId]/overview, /searches, /members and /billing. Staff routes use /operations/review and /operations/sources. Locale segments are es or en. Stable record IDs are language-independent. An invalid locale resolves to the preferred supported locale, while a missing asset returns a genuine 404 with a search link.

Primary navigation: Properties, Vehicles, Other, Alerts and Team. Overview and Plans are secondary. Notice detail is reached from an asset or source-linked result, not hidden inside a generic file manager. Breadcrumbs preserve search context. Discovery displays the configured country as read-only context; no country selector exists in public, user or administrator screens. The organization context sits in the app shell; offer an organization switcher only when a user has multiple memberships. There is no Personal option. Changing the workspace clears private caches, closes open private overlays, and reloads entitlements before showing private content.

## J01 Discover and inspect

An anonymous researcher enters the CR-configured instance, chooses a location within Costa Rica and a base amount currency, and applies advanced filters. URL parameters store normalized state. The researcher changes from list to map without losing constraints, opens an asset, and follows the next scheduled event to the original notice. Returning restores the result position. If the source is stale or the date is uncertain, the warning sits beside the relevant field. If no result matches, offer “clear filters” and editable filters rather than invented recommendations. Signing in to tag preserves the pending asset and workspace selection after authentication.

## J00 Create or join an organization

After authentication, validate an invitation and join its organization before activation, or create a one-person organization and assign the new user ADMIN. The creation flow is proposed; mandatory organization membership is confirmed. Provision organization, membership and local application mapping idempotently. An invitation retry must not create an extra solo organization. If provisioning fails, show a recoverable onboarding state with no personal-mode fallback. A user with one organization sees its name as context; users with several can switch between memberships. Signing out remains available during onboarding.

## J02 Tag an auction item directly

A researcher opens an auction card or asset detail and chooses Assign tags. They select available organization tag IDs and apply the change immediately to that asset. There is no save, favorite or bookmark action. Tag filters in Discover retrieve matching items; clearing the filter restores the catalog. Removing the last tag leaves the auction item discoverable. Switching organizations changes visible assignments and available definitions and clears any old organization tag filter. Optional organization notes can be edited independently of tags.

## J02a Attach images

A member opens an auction item and selects Images. They attach allowed files and see upload/processing state, attribution and organization visibility. No list thumbnail or source-photo assumption is introduced. Failed or rejected files remain clearly separate from ready attachments. A member of a different organization sees that organization’s own attachment set, not these images. Original notice evidence remains in its existing source workflow. The local prototype previews selected files in the browser only; production object storage and validation remain implementation work.

## J03 Track a search

From valid filters, select “Save filters,” enter a title and daily digest preference, and confirm recipient identity from the signed-in account. On success show the normalized search summary and its execution context. The search is owned by the current user and remains visible in Alerts across organization switches. Only that user can change or delete it; organization ADMIN and SYSADMIN have no ownership shortcut. If context membership is lost, suspend execution and hide current organization-private filter values until the owner re-scopes or deletes the search. Pausing keeps the search; deleting removes it and cancels pending future deliveries. Alerts are based on new published revisions since the previous successful watermark, deduplicated by search, asset and revision. A notice correction can produce a clearly labeled update. No “urgent auction” email is inferred solely from a calendar calculation.

## J04 Collaborate

An ADMIN invites colleagues as ADMIN, MANAGER or USER and manages memberships and roles. Invitations bind to the organization and intended recipient and expire. MANAGER cannot invite/remove users or change roles. A solo organization has one ADMIN. Prevent removal or demotion of the final ADMIN until another ADMIN exists. A member cannot lose their final organization without another membership or approved account closure. SYSADMIN system capabilities remain independent of organization roles.

## J04a Manage operational tags

An ADMIN or MANAGER opens Organization settings and creates, renames or deactivates available tags. Definitions belong only to the active organization. Users assign/remove existing active tag IDs directly on auction items, without editing the available list. Rename preserves IDs and assignments. Deactivation hides a definition from new assignments while preserving history. Organization identity, users and billing controls are ADMIN-only. Instance country is never an organization setting.

## J05 Review extraction

A user with SYSADMIN opens a queued extraction, sees original text and field-level evidence side by side, adjusts a base or date, records a reason and publishes with an expected revision. A conflicting update returns 409, preserves the draft and requires reload and reconciliation. Unresolved critical ambiguity keeps the record quarantined. A correction appends a new revision and publication event; it never overwrites the evidence snapshot. The queue is independent of billing plans.

## J05a Configure and operate the system

A SYSADMIN opens System, sees the fixed-country profile as read-only context, and changes only approved system settings. The proposed first controls pause/resume ingestion and adjust source-check cadence. Saving includes the expected settings version; conflicts require reload. Starting a run accepts only an approved source ID for this instance, records an audit event and uses idempotency. ADMIN, MANAGER and USER without SYSADMIN see access denied, even on a paid plan. A SYSADMIN with organization USER still lacks organization settings/user-management authority.

## J06 Manage billing

An ADMIN opens Plans, reviews current entitlements and selects a proposed plan. In production a server-created checkout or billing portal session leads to the chosen provider; only verified provider events activate entitlements. A return URL alone does not activate a plan. On failed payment show grace/past-due state and the recovery action. The mockup only explains proposals and does not simulate successful charges.

## Route and state inventory

| Screen ID | Route or context | Principal content | Required states | Mockup |
| --- | --- | --- | --- | --- |
| S01 | /workspace/:id/overview | Research tag activity and source freshness | Empty, loaded, stale, denied | Overview |
| S02 | /properties, /vehicles, /other | Category-specific filters and list | Loading, loaded, empty, validation, offline | Discover list |
| S03 | /:listing?view=map | Same results on map, location precision | Missing coordinates, provider failure, selected pin | Discover map |
| S04 | /filters | Grouped terms, save and retrieve owned filters | Draft, applied, invalid, reset | Advanced filters |
| S05 | /assets/:id | Facts, events and evidence | Missing fields, stale, cancelled, source conflict, 404 | Asset |
| S06 | /notices/:id | Original notice, revision and extracted fields | OCR uncertainty, source unavailable, redacted | Notice |
| S17 | /assets/:id → Images tab | Organization member attachments | Empty, files selected, uploading, processing, rejected, ready, unauthorized | Images tab |
| S07 | Removed | No Saved auction-item screen; direct tagging lives in S02/S03/S05 | No favorite/save state | Removed by C13 |
| S08 | /searches | User-owned saved filters, context and notification settings | Paused, quota, delivery failure | Alerts |
| S09 | Clerk sign-in/up | Authentication and invitation continuation | Pending, MFA, invalid invitation, retry | Auth layout concept |
| S10 | /members | People, roles and invitation | Invited, expired, last-admin, denied | Team |
| S11 | /billing | Entitlements and billing status | Unpaid, active, past due, cancelling | Plans |
| S12 | /operations/review | Field evidence and publication | Queue empty, conflict, quarantined, published | Review |
| S13 | Profile/preferences | Locale and notification preferences | Unsaved, saved, failed | Spec only |
| S16 | /system | Fixed instance context, ingestion settings and operation controls | SYSADMIN allowed, missing grant denied, disabled ingestion, invalid cadence, version conflict | System |
| S15 | /workspace/:id/settings | Identity settings and available tags | ADMIN full settings, MANAGER operational controls, USER denied, duplicate/inactive tags | Settings |
| S14 | /operations/sources | Fetch failures and extraction metrics | Healthy, degraded, paused | Spec only |

Every implemented screen must include an accessible page title, meaningful loading feedback, an error with a recovery action, and permissions checked at its server boundary. Prototype state previews demonstrate empty, loading and source error on discovery; the remaining variants are specified here rather than claimed as completed designs.

## J07 Choose an auction listing — confirmed destinations, proposed behavior

Properties, Vehicles and Other are the first three primary navigation entries; Overview and Plans are secondary. Proposed routes are /[locale]/properties, /[locale]/vehicles and /[locale]/other. The root resolves to Properties. Legacy /discover redirects to Properties while preserving compatible filters. Shared /assets/[id] detail and /notices/[id] evidence routes remain stable. Detail breadcrumbs return to the item's category and restore its list context. An asset opened through a direct link activates its category navigation.

Switching listing resets draft/applied filters to that category, clears property-specific constraints and returns to list view. Clearing filters retains the current listing. Tags and member attachments remain attached to the same asset; switching sections does not mutate research. Saving a search captures its category with filters and retains user ownership across organization switches. Returning to a category cannot silently display another category's items. The editable offline prototype uses ?screen=discover&category=properties|vehicles|other rather than production route paths.

| Screen ID | Proposed route | Principal content | Required states | Mockup |
| --- | --- | --- | --- | --- |
| S02-P | /properties | Property auctions and property filters | Loaded, empty, loading, error | Properties |
| S02-V | /vehicles | Vehicle auctions and vehicle subtype | Loaded, empty, loading, error | Vehicles |
| S02-O | /other | Other auction items and compatible subtype | Loaded, empty, loading, error | Other |

Map views are proposed for source-reported asset or inspection locations with provenance and precision. A vehicle's court jurisdiction alone is not its physical location. Missing coordinates remain missing; no pin is invented. This revision demonstrates non-property listings with no mapped locations.

## Filter-only interaction — C19

In Properties, Vehicles or Other, open the separate filter view, set criteria and choose Apply and view results. On mobile the same form opens through Filters; there is no separate search bar above results. Proposed text/reference matching is one optional field inside that form. Enter submits that same filter form, not a second action. List/map views consume the identical applied definition. Save filters names and saves the validated editor draft; the owner manages them under My filters and alerts. Keep edits pending until Apply, and clearly preserve the current listing on Clear.

## J08 Build grouped filters

Open Filters, choose Add group and add its first term. Choose its field, comparison and value. Add terms and set All (AND) or Any (OR) for that group. Add another group and choose how to combine the groups. The operator selectors explicitly distinguish these two levels. Apply validates the complete draft; incomplete terms and empty groups show a recoverable error without replacing the previous results. Removing all groups and applying restores all items in the current category. Clear resets draft and applied filters for that category. Switching category resets both; switching organization clears private tag criteria and discards drafts.

Saving retains the complete applied structure. A summary uses parentheses around every group and explicit AND/OR connectors. Organization-private tag labels are hidden when the saved definition's execution context becomes unavailable. Ownership remains the user’s across organization switches. The existing user-owned saved-filter lifecycle and alerts remain intact.

## J09 Open, save and retrieve filters

From a listing choose Open filters. The separate view shows category and organization context, the grouped editor, Save filters and My saved filters. Edit without changing the existing applied definition. Save validates and asks for a name, then creates a new user-owned definition and leaves the editor open. No prior saved definition is silently overwritten.

Choose Retrieve on a saved definition to replace the current draft with its complete expression, category and original organization context. The record displays that context before retrieval; if membership or the definition is unavailable, retrieval is denied. Loading never applies results or changes the saved record. After review choose Apply and view results, or Cancel and return. Cancel restores the pre-editor organization and listing. Applying to the same category preserves list/map choice; applying another category opens that category's list. Direct entry to the filter route starts from current instance/organization context.

Proposed production route: /[locale]/filters with listing/return context; prototype route: ?screen=filters&category=properties|vehicles|other. S04 is now this separate filter view, including save/retrieve/validation states. Existing inline-pane and mobile-disclosure descriptions are superseded. Alerts can link to this view; its pause/delete controls remain separate from retrieval.

## J10 Browse server pages

Open a category listing and choose Items per page / Remates por página. The app requests page 1 at that size and displays the server's total, range and page count. Next/Previous request another page with identical filters and scope. Item detail and return retain page and size. Open the separate filter view; Cancel returns to the same page, while successful Apply resets to page 1 and retains size. Category/organization changes also reset page 1. Retrieving or saving a definition alone never stores or changes pagination.

Proposed production listing URL parameters are page and pageSize. The offline preview supports ?screen=discover&pageSize=5&page=2; with six fictional properties this demonstrates the partial second page. Malformed values are a production 400; stale out-of-range pages are corrected as specified in the API contract. List/map switching retains the list position, but map clusters query the complete in-bounds matching set, not just the current page. S02-P/V/O include page-size, first/middle/last, empty, loading/error and changing-total states.

## Item table and prioritized sorting

Confirmed: use column-based tables for auction listings and allow sorting on one or more values. Common columns are item/reference, reported location, subtype, published base, next event and organization tags; Properties also has area. No listing imagery is introduced. On mobile, the single-line table scrolls horizontally and the same sorting controls stay available.

Click a sortable column header for a primary ascending/descending sort. Add sort appends a priority; users can select its field/direction or remove it. Numbered header indicators show priority. Sort happens on the server before item pagination, with nulls last and item ID as the final deterministic tie-breaker. Changing sort resets page 1 and preserves size. Distinct fields only, maximum five priorities proposed. Amount ordering requires a single-currency scope; never compare raw CRC/USD amounts. Area is property-only. Sort is request/presentation state outside the saved expression; saving sort preferences with definitions remains unconfirmed.

GET item listing endpoints accept sort as a JSON array of {field,direction} in priority order. Backend validates allowlisted fields/directions, compatible category and single-currency scope and binds/allowlists ordering rather than interpolating user SQL. Counts are unaffected by sort. Cache/request identity includes sort. The offline adapter demonstrates sorting before slicing; actual server ordering and stable database pagination remain production integration gates.

Acceptance: verify multi-value precedence, both directions, equal values/ID ties, null placement, page reset, currency/category constraints, accessible header controls and mobile labels. Use the mockup Add sort control rather than requiring a keyboard modifier.

## Item detail tabs

Confirmed order: General info, Registry info, Notice, Registry (public), Location (map), Images. Spanish: Información general, Información registral, Aviso, Registro (público), Ubicación (mapa), Imágenes. General info contains the unified view/edit information. Registry info shows available normalized identifiers; Registry (public) is a placeholder until a provider is connected, with no invented official results. Notice shows the preserved fictional source text. Location uses the schematic map only where sample mapping exists, otherwise an explicit missing-coordinate state. Images retains existing attachments. Tabs scroll horizontally on narrow screens and support Left/Right keyboard navigation.

### Category-aware tabs

Properties: General info, Registry info, Notice, Registry, Location, Images. Vehicles and Other omit Location and do not display location metadata/columns. Spanish labels are Información general, Información registral, Aviso, Registro, Ubicación, Imágenes. Remove the map/public parenthetical suffixes. Tabs use a shared baseline and selected underline, without filled button backgrounds or rounded button frames. Keyboard navigation follows only the visible category tabs; stale Location links fall back to General info for non-properties.

## Auction tab — second item tab

Confirmed: Auction / Remate is the second tab after General info for every item category. It contains round numbers, base offers with currencies, dates/times and configured timezone; whether this item is sold individually or as part of a lot; and links to the auction's other items. Lot references and links to fellow lot members appear when applicable. General info retains item attributes, editable notes/appraisal and tag labels; schedule and auction base information move into Auction. Remaining tabs follow Auction in their prior category-aware order.

Demonstration fields: auctionId, saleMode (individual/lot), lotId and existing auctionRounds. Five fictional items are grouped per auction example; generated examples 07 and 08 in each category share a lot and its schedule/base. Distinct individually sold items can retain their own schedules/base offers. These synthetic relationships are UI examples, not verified auction data. Open DEMO-A07, DEMO-V07 or DEMO-O07 for a lot example. Missing relationships or schedules must use explicit unknown/not-reported states, not inferred real-world facts.

Proposed production model: Auction groups source-evidenced sale units; a sale unit is individual or a lot and links its member assets. Round dates/times and base money attach to that sale unit, avoiding a duplicated lot price per member. Preserve source evidence, version changes and explicit currency; never sum member prices into a lot base or infer lot membership from proximity in a notice. Existing API/SQL grouping extensions remain implementation work; this prototype adds fixture relationships and UI without executing migrations or connecting a backend. Link resolution must preserve access checks and return an unavailable state for inaccessible items.
