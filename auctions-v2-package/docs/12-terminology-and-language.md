# Terminology and language review

Reviewed 12 November 2026. Scope: English/Spanish interface strings and current Markdown design specifications, including requirements, journeys, screen guidance, data, ingestion, permissions and acceptance wording. Generated HTML is refreshed from Markdown. Historical screenshots and original source quotations are not relabeled. This is a product-language review, not a legal certification or a native-speaker usability study.

## Preferred product vocabulary

| English | Spanish | Meaning / use |
| --- | --- | --- |
| Auctions | Remates | Application name; no v2 suffix |
| Properties / Vehicles / Other | Propiedades / Vehículos / Otros | Main listings |
| Auction item | Bien en remate | The individual catalog record; not the entire auction |
| Auction | Remate | The proceeding/event grouping its items and rounds |
| Notice | Aviso | Confirmed app term; preserve edicto if present in original text |
| Notice reference | Referencia del aviso | Published notice reference, not an item identifier |
| Auction ID / Lot ID | Identificador del remate / del lote | Internal grouping IDs, not published notice references |
| Case number | Número de expediente | Judicial case identifier |
| Registration number | Número de finca | CR property label; country adapters may require different labels |
| Plate | Placa | Vehicle registration plate |
| General info / Auction | Información general / Remate | First and second item tabs |
| Registry info / Registry | Información registral / Registro | Stored extracted facts versus registry lookup; lookup remains unconnected |
| Location | Ubicación | Properties only |
| Round | Ronda | First, second or third scheduled round; distinct from a separate auction/item |
| Auction base | Base del remate | Published starting/base amount; not an offer submitted by a bidder |
| Next Auction | Próximo remate | Confirmed grid label, with round number |
| Participation Guarantee | Garantía de participación | Confirmed product label; preserve actual source terminology |
| Participation fee | Cuota de participación | Separate charge only if supported by source/rule; never synonymous with guarantee |
| Government-assessed tax value | Valor fiscal | Source government valuation for tax purposes |
| Appraisal value | Valor de avalúo | Editable research valuation; not government tax value |
| Market value | Valor de mercado | Editable research estimate; not a verified market price |
| Liens | Gravámenes | Source-reported text; absence never certifies clear title |
| Creditor / Debtor | Acreedor / Deudor | Preserve actual source roles; do not infer plaintiff/defendant |
| Auctioneer / Court | Rematador / Juzgado | Court shown for judicial auctions; preserve named institution and source role |
| Venue / Office | Sede / Oficina | Auction place versus responsible office; neither is the property's location |
| Publication | Publicación | Publication name, issue, date and source locator |
| Extraction notes | Notas de extracción | Read-only extraction/review annotations |
| Notes | Notas | Editable research notes, separate from extraction notes |
| Saved filters | Filtros guardados | User-owned definitions; no separate search feature |
| Tags | Etiquetas | Colored labels; no active/inactive status |
| Not reported | No indicado | Source value absent/unknown |
| Not available | No disponible | Calculation/integration cannot currently provide a result |
| Review status | Estado de revisión | Extraction workflow state; never certification of legal status |

## Writing rules

Use sentence case for ordinary labels, retaining the confirmed Next Auction and Participation Guarantee labels. Spanish consistently addresses the user as usted, normally through direct imperatives (Seleccione, Guarde, Aplique). Prefer short concrete verbs: Apply/Aplicar, Load/Cargar, Save/Guardar. Explain AND/OR as all/any in the filter editor; technical identifiers remain untranslated.

Organization ownership is enforced internally without ownership labels on tags, valuations, notes or images. Organization settings and a saved filter's applicable organization remain explicit where necessary. ADMIN, MANAGER, USER and SYSADMIN are stable role identifiers, not translated labels. Membership and a paid subscription are separate concepts. Alerts refer to notifications; subscription refers to the commercial plan.

Original notices and extracted quotations retain original language/spelling. Changing interface language does not translate source evidence. Preserve currencies and country-specific registry/authority names. Unknown, not applicable, zero, deleted and unavailable are distinct states. Do not label a record verified, legally clear, guaranteed, current or officially valued without supported evidence and a defined verification process.

## Corrections made

Standardized saved filters in documentation; retained existing search-named API paths, internal variables and schema identifiers to avoid an accidental contract migration. Clarified item-versus-auction labels, image limits and counts. Replaced ambiguous Auction reference with Auction ID for internal IDs. Replaced Base offer/Oferta base with Auction base/Base del remate to distinguish a published base from a bidder's offer. Simplified filter saving/loading copy, removed mixed tú/usted wording, and aligned review-status labels. Corrected stale descriptions of the Actions title, tag action, separate editor cancellation, schedule location and header tags. No original notice text was rewritten.

## Decisions retained and questions for later refinement

Confirmed user vocabulary Notice/Aviso, Round/Ronda, Participation Guarantee/Garantía de participación remains authoritative. Costa Rican source documents may use edicto, primera/segunda/tercera subasta or remate, and depósito de participación. These are source terms, not automatic UI replacements. No percentage or legal rule is established by this vocabulary review.

Proposed for country-adapter refinement: Auctioneer/Rematador should preserve the actual office-holder's role (for example, notary or other authorized official) instead of treating roles as interchangeable. Court/Juzgado may need a broader localized authority label for courts or tribunals. Liens/Gravámenes is suitable for the current field but should become Encumbrances if future scope includes restrictions beyond liens. Registry info versus Registry is retained as requested; usability testing should confirm that users understand the stored-facts/lookup distinction.

## Reference checks

Official Costa Rican judiciary material uses base para remate, valor fiscal, acreedor/deudor and related auction vocabulary. These checks support terminology only, not legal calculations or guarantees:

- [Poder Judicial: Manual de procedimientos relacionado con el trámite de remates](https://secretariacorte.poder-judicial.go.cr/index.php/informacion-general/documentos-interes?download=53806%3Amanual-de-procedimientos-relacionado-con-el-tramite-de-remates&start=30).
- [Poder Judicial: published auction procedure document](https://nexuspj.poder-judicial.go.cr/document/avi-1-0003-1455). Historical terminology reference; not used to establish current participation amounts.

## Verification and limits

Regenerate documents/index and validate the offline prototype and package links after editorial changes. Automated checks confirm existing behavior and structural consistency; they do not establish translation quality, legal adequacy or production behavior. Historical sections may retain implementation names and superseded decisions explicitly identified as history; current vocabulary in this document governs new work.
