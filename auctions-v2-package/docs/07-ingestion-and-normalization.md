# Notice ingestion and normalization specification

## Source onboarding and provenance

No source connector has been implemented or authorized by this package. The official article referenced in [sources](12-sources-and-validation.md) supports designing for source-described bases, schedules and property identifiers, but it does not establish permission to scrape or redistribute notices. Source onboarding must record owner approval, access mechanism, rate budget, permitted reuse, privacy review, format samples and retention constraints. A 403 from the Boletín Judicial endpoint during research was not bypassed.

The adapter interface is discover(checkpoint), fetch(locator), parse(bytes), normalize(draft, jurisdictionConfig). It returns document bytes/hash, publication metadata, notice boundaries, normalized candidates and field evidence. Adapter configuration includes country, language, timezone, decimal conventions, supported notice taxonomy and parser version. The worker loads only the adapter for INSTANCE_COUNTRY at startup. Source onboarding and every ingestion run must match that country; SYSADMIN cannot choose another country through a source or job payload. A second country uses its own configured deployment and adapter rather than branching CR law into shared domain objects or mixing countries in one instance.

## Pipeline and state transitions

1. Discover approved locators using a monotonic checkpoint and overlap window. Record run ID and candidate locators before advancing the checkpoint.
2. Fetch allowlisted URLs with bounded redirects, timeout, content-size and MIME validation. Apply source rate budget, conditional requests and exponential backoff. Store original bytes under a content-addressed object key; record SHA-256 and fetch time.
3. Extract selectable text. Use OCR only when needed; preserve page numbers, bounding boxes and OCR confidence. Isolate PDF parsing from API processes and deny parser network access.
4. Segment logical notices and multi-asset descriptions. Preserve order and source page/span offsets. Blank scans, incomplete endings and inconsistent page sequences enter quarantine.
5. Classify relevant judicial auction notice types. Non-auction material is retained only if approved policy permits it, and is not published as a listing.
6. Normalize candidate fields deterministically where possible. Optional language-model extraction is untrusted structured assistance, versioned and validated, never a source of missing legal facts.
7. Resolve duplicates and candidate asset links. Link with source-supported registry identity where available; ambiguous matches require reviewer choice.
8. Run schema, cross-field and evidence validation. Critical ambiguity routes to review_required; corrupt or unsafe source routes to quarantined.
9. Reviewer checks critical fields against source spans, records corrections and reason, and publishes a new immutable notice revision and related projections in a transaction.
10. Write outbox publication event in the same transaction. Search projection updates and alert jobs consume at least once with idempotent handlers. Replays cannot send duplicate notifications.

States: discovered → fetched → extracted → review_required → published. Any pre-publication stage may enter quarantined with a reason and retry eligibility. A published record is never silently rewritten; source correction starts a new draft and keeps the existing revision with an update warning when material risk is identified.

## Field normalization rules

| Field | Rule | Review and display |
| --- | --- | --- |
| case number | Preserve original string plus jurisdiction-normalized search form | Never treat as globally unique asset identity |
| registry identity | Preserve punctuation and section metadata; normalize using adapter version | Missing or conflicting identity blocks automatic merge |
| base | Decimal string, explicit currency, associated event ordinal | “65.000.000,00” under CR conventions becomes 65000000.00 only with supporting context |
| currency | Derive only from explicit symbol/context with adapter evidence | Ambiguous dollar symbol requires review; no guessed CRC default in extraction |
| schedule | Parse original local text, precision and jurisdiction timezone | Unknown time stays date-only; invalid/ambiguous dates block release of the event |
| area | Preserve raw unit, convert only known units into m² with formula/version | Missing area is null; no inference from building type |
| location | Country and hierarchical codes from source-supported locality | Contradictory district/canton requires review |
| coordinates | Provider result with confidence, precision, source and timestamp | Municipality centroid never advertised as a parcel location |
| encumbrance text | Original source excerpt and locator | No automatic “clean title” label or guarantee |
| party names | Minimize exposure; apply approved privacy/redaction rules | Never use names for promotional targeting |
| status | Only supported cancellation/postponement/outcome updates | Date passing is not a completed sale |

For multiple scheduled events, create one event per explicitly reported ordinal. Do not compute later event bases as a percentage of the first or infer dates from legal rules. If only one event is reported, only one is stored. Monetary punctuation needs both locale and currency evidence; conflicting separators require review. All machine confidence is a ranking aid; never label it as probability of legal correctness.

## Evidence contract

Each critical normalized field has {sourceDocumentId, noticeRevision, page, startOffset, endOffset, rawText, normalizedValue, parserVersion, confidence, reviewerId, reviewedAt}. Offsets refer to the versioned extracted-text snapshot, not arbitrary rendered PDF text. OCR boxes use page-relative normalized coordinates and reference the page hash. Original bytes and text hashes allow later audits. Unknown fields carry reason=absent/illegible/conflicting, not a fabricated value.

## Duplicate and correction strategy

Byte-identical documents deduplicate by source and SHA-256 while retaining fetch observations. A logical notice appearing on consecutive publication days may be linked as another publication occurrence; textual similarity alone does not delete it. Cross-document notice matching uses source identifiers, case, asset references and dates; review if identities disagree. A later cancellation links to the affected event with supporting source evidence, not merely to all assets in the same case. Alias/merge history makes wrongly merged assets reversible.

## Quality gates and evaluation

Proposed release evaluation uses at least 200 legally usable, independently labeled notice samples spanning native text, OCR, multiple assets, multiple currencies, cancellations and missing fields. Split by source document and publication date to avoid duplicate leakage. Report exact match for base/currency, event date/time precision, registry identity and evidence locator accuracy; report segmentation and asset-link precision/recall separately. Initial target is >=99% precision for critical fields among published records, with coverage disclosed. Human review is mandatory for critical fields until a measured release policy is approved. Neither this dataset nor the target has been achieved by this design package.

Schema failures, unsupported currency, invalid event chronology, missing evidence, mismatched country and unresolved identity cannot auto-publish. Reviewer changes include the raw value, new value and reason. A second reviewer is proposed for monetary or date changes after publication. Alert consumers receive revision type=new/correction/cancellation to avoid treating every update as a new opportunity.

## System operations authorization

SYSADMIN performs system ingestion configuration and operational tasks. Proposed pause/resume and cadence controls apply only to approved sources for the configured country. Starting or replaying work still requires source approval, idempotency, evidence retention and audit. SYSADMIN review/publication does not waive critical-field validation. Organization ADMIN/MANAGER operational settings such as available tags do not grant system ingestion control.

## Operations and recovery

Retry transient transport errors with jitter and a proposed maximum of five attempts; permanent format/security failures go directly to quarantine. The source checkpoint advances only after durable receipt, not after OCR success. Dead-letter work remains visible with source/run IDs, sanitized error and replay controls. A source outage marks freshness degraded but does not delete listings. Pause a connector when error rates or source responses require it. Reprocess immutable inputs with a new parser version into drafts, compare field diffs and require review before replacing published projections.

## Category classification and publication gate

The publication pipeline supports Properties, Vehicles and Other in the instance's single configured country. Proposed normalize output includes category, compatible subtype and field evidence. Capture the original category wording, mapping version and reviewer decision. Property identifiers and area apply only to Properties. Vehicle identifiers must be source-derived and privacy-reviewed; do not infer make, model, year or physical location. Other contains positively identified assets outside property/vehicle classes, such as equipment or inventory; it is not an uncertainty bucket.

Ambiguous category or incompatible subtype blocks publication and saved-search matching until reviewed. A notice containing several separable auction items can link to several assets, including different categories; preserve lot/group semantics and do not duplicate a joint lot as separately purchasable items. Category corrections create a reviewed revision, invalidate relevant listing caches and re-evaluate category-scoped saved searches using the existing deduplication rules. Preserve stable asset IDs, source evidence and private research.

## Filterable facts and unknown values

Ingestion continues publishing evidence-backed normalized facts; user filter groups do not alter source data or classification. Preserve null for missing base/area so isUnknown is explicit. Currency belongs to every normalized money value. A publication/correction re-evaluates the complete saved expression and existing deduplication watermark. A tag-assignment event alone does not fabricate a newly published auction. Classification gates and source evidence requirements remain unchanged.
