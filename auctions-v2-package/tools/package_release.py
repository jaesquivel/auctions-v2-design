from pathlib import Path
import json, hashlib
from build_package import wrap

R = Path(__file__).resolve().parents[1]
labels = {
    "filters": "Separate filter view",
    "discover": "Properties listing",
    "vehicles": "Vehicles listing",
    "other": "Other listing",
    "map": "Conceptual map",
    "asset": "Asset detail",
    "asset-images": "Member Images tab",
    "notice": "Notice and evidence",
    "overview": "Workspace overview",
    "alerts": "Saved filters and alerts",
    "team": "Organization roles",
    "plans": "Plan proposals",
    "review": "Extraction review",
    "settings": "Operational settings as MANAGER",
    "system": "System access without SYSADMIN",
    "auth": "Clerk sign in concept",
}
body = '<h1>Desktop and mobile mockup gallery</h1><p>Spanish viewport snapshots of the editable prototype. Desktop is 1440 × 1000; mobile is 390 × 1000. Images show the top of each scrollable page. Open a snapshot at full size, or follow the corresponding interactive screen.</p><div class="notice">All listings, notices, amounts and schedules are fictional. Map layouts are schematic. Screens reflect a proposed design.</div>'
for key, label in labels.items():
    query = (
        "screen=discover&category=" + key
        if key in ["vehicles", "other"]
        else "screen=discover&view=map"
        if key == "map"
        else "screen=asset&tab=images"
        if key == "asset-images"
        else "screen=" + key
    )
    body += f'<h2>{label}</h2><p><a href="../mockups/index.html?{query}">Interactive Spanish</a> · <a href="../mockups/index.html?{query}&lang=en">Interactive English</a></p><div style="display:grid;grid-template-columns:minmax(0,3fr) minmax(0,1fr);gap:18px;align-items:start">'
    for device in ["desktop", "mobile"]:
        image = R / "qa" / f"{device}-{key}.jpg"
        if image.exists():
            body += f'<a href="{image.name}"><img src="{image.name}" alt="{label} {device} viewport" style="width:100%;border:1px solid #d4ddd7;border-radius:8px"><span>{device.title()} · open full size</span></a>'
    body += "</div>"
body += '<h2>Colored tags</h2><p>Assigned tag labels appear in the table. ADMIN/MANAGER can choose a definition color; USER assigns existing tags.</p><div class="grid"><a href="desktop-colored-tags.jpg"><img src="desktop-colored-tags.jpg" alt="Colored tag badges in item rows" style="width:100%"></a><a href="mobile-colored-tags.jpg"><img src="mobile-colored-tags.jpg" alt="Mobile single-line rows with colored tags" style="width:100%"></a></div>'
body += '<h2>Column tables and prioritized sorting</h2><p>Sortable headers and Add sort define ordered priorities. Production applies that order before paging; the offline adapter demonstrates the behavior.</p><a href="desktop-table-sort.jpg"><img src="desktop-table-sort.jpg" alt="Item table with two sort priorities" style="width:100%"></a>'
body += '<h2>Item pagination and selectable page size</h2><p>Server-side pagination is specified for all item listings. This offline preview simulates page 2 at size 5 over fictional fixtures. <a href="../mockups/index.html?screen=discover&amp;pageSize=5&amp;page=2">Interactive second page</a> · <a href="../data/item-page-example.json">Empty response example</a></p><div class="grid"><a href="desktop-pagination.jpg"><img src="desktop-pagination.jpg" alt="Desktop item pagination and page size" style="width:100%"></a><a href="mobile-pagination.jpg"><img src="mobile-pagination.jpg" alt="Mobile item pagination" style="width:100%"></a></div>'
body += '<h2>Localized name: Auctions / Remates</h2><p>The name follows the interface language and has no version badge. <a href="desktop-auth-en.jpg">English desktop sign-in</a> · <a href="mobile-auth-en.jpg">English mobile sign-in</a> · <a href="desktop-auth.jpg">Spanish sign-in</a>. Editable wordmarks for both languages are in <a href="../brand/index.html">Brand assets</a>.</p>'
body += '<h2>Save and retrieve in a separate filter view</h2><p>Open filters from the listing. Save creates a named draft; Retrieve loads one you own. Apply returns to results and Cancel leaves prior results intact.</p><div class="grid"><a href="desktop-filter-library.jpg"><img src="desktop-filter-library.jpg" alt="Dedicated filter view with Save and Retrieve" style="width:100%"></a><a href="mobile-filter-library.jpg"><img src="mobile-filter-library.jpg" alt="Mobile owned filter retrieval" style="width:100%"></a></div>'
body += '<h2>Grouped AND/OR filters</h2><p>Open the separate filter view to edit AND/OR groups, save named drafts and retrieve your own definitions. Draft edits are applied explicitly, and saved filters retain parentheses and ownership. <a href="../data/grouped-filter-examples.json">Editable JSON examples</a></p><div class="grid"><a href="desktop-grouped-filter.jpg"><img src="desktop-grouped-filter.jpg" alt="Desktop grouped Boolean filters" style="width:100%"></a><a href="mobile-grouped-filter.jpg"><img src="mobile-grouped-filter.jpg" alt="Mobile grouped Boolean filter builder" style="width:100%"></a></div>'
body += '<h2>Single filter form</h2><p>The grouped form is in a separate view opened from the listing; Save and Retrieve live there. No standalone Search action. <a href="mobile-filter-panel.jpg">Expanded mobile filter panel</a></p><a href="mobile-filter-panel.jpg"><img src="mobile-filter-panel.jpg" alt="Mobile filter form" style="max-width:390px;width:100%"></a>'
body += '<h2>Reference-based gavel logo</h2><p><a href="../brand/index.html">Preview editable light/dark logo assets</a> · <a href="../brand/README.md">Usage guidance</a></p><div class="grid"><a href="desktop-brand.jpg"><img src="desktop-brand.jpg" alt="Gavel brand variants" style="width:100%"></a><a href="mobile-auth.jpg"><img src="mobile-auth.jpg" alt="Gavel logo in mobile sign-in" style="width:100%"></a></div>'
body += '<h2>Solo organization</h2><p>A one-member organization uses the same roles and ownership model. Open Team and choose Solo organization in the organization switcher.</p><div class="grid">'
for device in ["desktop", "mobile"]:
    image = f"{device}-solo-team.jpg"
    body += f'<a href="{image}"><img src="{image}" alt="Solo organization {device}" style="width:100%;border:1px solid #d4ddd7;border-radius:8px"></a>'
body += "</div>"
for role in ["ADMIN", "USER"]:
    body += f'<h2>Settings as {role}</h2><p>Use the Role preview control to inspect this state in the interactive mockup.</p><div class="grid">'
    for device in ["desktop", "mobile"]:
        image = f"{device}-settings-{role}.jpg"
        body += f'<a href="{image}"><img src="{image}" alt="{role} settings {device}" style="width:100%;border:1px solid #d4ddd7;border-radius:8px"></a>'
    body += "</div>"
body += '<h2>SYSADMIN system configuration and operations</h2><p>In System role preview, select SYSADMIN. This grant is independent of the organization role. The example below uses organization USER plus SYSADMIN; country remains read-only. For extraction review, enable SYSADMIN first.</p><div class="grid">'
for device in ["desktop", "mobile"]:
    image = f"{device}-system-SYSADMIN.jpg"
    body += f'<a href="{image}"><img src="{image}" alt="SYSADMIN system controls {device}" style="width:100%;border:1px solid #d4ddd7;border-radius:8px"></a>'
body += "</div>"
body += '<h2>User-owned saved filters</h2><p>Save filters, then switch organizations: it remains in the same user’s Alerts, with its original execution context shown. This is separate from auction tagging; no Saved auction collection exists.</p><div class="grid">'
for device in ["desktop", "mobile"]:
    image = f"{device}-user-searches.jpg"
    body += f'<a href="{image}"><img src="{image}" alt="User-owned saved filters across organization switch {device}" style="width:100%;border:1px solid #d4ddd7;border-radius:8px"></a>'
body += "</div>"
(R / "qa/responsive-gallery.html").write_text(
    wrap("Responsive mockup gallery", body, "../docs/document.css")
)
files = sorted(
    p
    for p in R.rglob("*")
    if p.is_file() and p.name != "manifest.json" and "__pycache__" not in str(p)
)
manifest = {
    "package": "Auctions / Remates",
    "version": "1.4",
    "date": "2026-11-06",
    "fictionalData": True,
    "files": [
        {
            "path": str(p.relative_to(R)),
            "bytes": p.stat().st_size,
            "sha256": hashlib.sha256(p.read_bytes()).hexdigest(),
        }
        for p in files
    ],
}
(R / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")
print(
    json.dumps(
        {
            "directory": str(R),
            "fileCount": len(files) + 1,
            "updated": ["gallery", "manifest"],
            "archiveCreated": False,
        },
        indent=2,
    )
)
