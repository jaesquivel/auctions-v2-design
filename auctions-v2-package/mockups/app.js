"use strict";
// All records are deliberately fictional. No source document, geocoder, payment or email is contacted.
const INSTANCE_CONFIG = Object.freeze({
  country: "CR",
  nameEs: "Costa Rica",
  nameEn: "Costa Rica",
  timezone: "America/Costa_Rica",
});
const DEMO_LISTINGS = [
  {
    id: "DEMO-A01",
    category: "properties",
    type: "house",
    region: "CR-SJ",
    locality: "Santa Ana, San José",
    titleEs: "Casa de ejemplo en Santa Ana",
    titleEn: "Example home in Santa Ana",
    area: "240",
    amount: "65000000.00",
    currency: "CRC",
    date: "2026-12-10",
    time: "10:00",
    quality: "reviewed",
    mapped: true,
    tags: ["residential"],
    color: 0,
  },
  {
    id: "DEMO-A02",
    category: "properties",
    type: "land",
    region: "CR-A",
    locality: "Grecia, Alajuela",
    titleEs: "Lote de ejemplo en Grecia",
    titleEn: "Example land in Grecia",
    area: "520",
    amount: "42000000.00",
    currency: "CRC",
    date: "2026-12-14",
    time: "09:30",
    quality: "needs_review",
    mapped: true,
    tags: ["land"],
    color: 1,
  },
  {
    id: "DEMO-A03",
    category: "properties",
    type: "apartment",
    region: "CR-H",
    locality: "Heredia, Heredia",
    titleEs: "Apartamento de ejemplo en Heredia",
    titleEn: "Example apartment in Heredia",
    area: "86",
    amount: "125000.00",
    currency: "USD",
    date: "2026-12-18",
    time: "11:00",
    quality: "reviewed",
    mapped: true,
    tags: ["residential"],
    color: 2,
  },
  {
    id: "DEMO-A04",
    category: "properties",
    type: "house",
    region: "CR-C",
    locality: "Cartago, Cartago",
    titleEs: "Casa de ejemplo en Cartago",
    titleEn: "Example home in Cartago",
    area: null,
    amount: "57500000.00",
    currency: "CRC",
    date: "2026-12-21",
    time: "08:30",
    quality: "reviewed",
    mapped: false,
    tags: ["residential"],
    color: 3,
  },
  {
    id: "DEMO-A05",
    category: "properties",
    type: "land",
    region: "CR-G",
    locality: "Liberia, Guanacaste",
    titleEs: "Terreno de ejemplo en Liberia",
    titleEn: "Example land in Liberia",
    area: "1800",
    amount: "98000000.00",
    currency: "CRC",
    date: "2027-01-07",
    time: "10:00",
    quality: "needs_review",
    mapped: true,
    tags: ["land"],
    color: 4,
  },
  {
    id: "DEMO-A06",
    category: "properties",
    type: "commercial",
    region: "CR-P",
    locality: "Esparza, Puntarenas",
    titleEs: "Local de ejemplo en Esparza",
    titleEn: "Example premises in Esparza",
    area: "165",
    amount: "87000000.00",
    currency: "CRC",
    date: "2027-01-12",
    time: "13:30",
    quality: "reviewed",
    mapped: true,
    tags: ["commercial"],
    color: 5,
  },
  {
    id: "DEMO-V01",
    category: "vehicles",
    type: "car",
    region: "CR-SJ",
    locality: "San José",
    titleEs: "Automóvil de ejemplo",
    titleEn: "Example car",
    area: null,
    amount: "6500000.00",
    currency: "CRC",
    date: "2026-12-11",
    time: "10:00",
    quality: "reviewed",
    mapped: false,
    tags: [],
    color: 0,
  },
  {
    id: "DEMO-V02",
    category: "vehicles",
    type: "motorcycle",
    region: "CR-A",
    locality: "Alajuela",
    titleEs: "Motocicleta de ejemplo",
    titleEn: "Example motorcycle",
    area: null,
    amount: "1800000.00",
    currency: "CRC",
    date: "2026-12-16",
    time: "09:00",
    quality: "needs_review",
    mapped: false,
    tags: [],
    color: 1,
  },
  {
    id: "DEMO-O01",
    category: "other",
    type: "equipment",
    region: "CR-H",
    locality: "Heredia",
    titleEs: "Equipo de ejemplo",
    titleEn: "Example equipment",
    area: null,
    amount: "3200000.00",
    currency: "CRC",
    date: "2026-12-15",
    time: "11:00",
    quality: "reviewed",
    mapped: false,
    tags: [],
    color: 2,
  },
  {
    id: "DEMO-O02",
    category: "other",
    type: "inventory",
    region: "CR-C",
    locality: "Cartago",
    titleEs: "Lote de inventario de ejemplo",
    titleEn: "Example inventory lot",
    area: null,
    amount: "900000.00",
    currency: "CRC",
    date: "2026-12-22",
    time: "10:30",
    quality: "needs_review",
    mapped: false,
    tags: [],
    color: 3,
  },
];
// Deterministic demonstration catalog: 50 records per category. These are not real auctions.
// Generated records intentionally have no map coordinates; the map retains only its schematic examples.
const SAMPLE_REGIONS = [
  ["CR-SJ", "San José"],
  ["CR-A", "Alajuela"],
  ["CR-H", "Heredia"],
  ["CR-C", "Cartago"],
  ["CR-G", "Guanacaste"],
  ["CR-P", "Puntarenas"],
  ["CR-L", "Limón"],
];
const SAMPLE_CATEGORIES = [
  {
    category: "properties",
    prefix: "A",
    es: "Inmueble",
    en: "Property",
    types: ["house", "land", "apartment", "commercial"],
  },
  {
    category: "vehicles",
    prefix: "V",
    es: "Vehículo",
    en: "Vehicle",
    types: ["car", "motorcycle", "truck", "vehicle_other"],
  },
  {
    category: "other",
    prefix: "O",
    es: "Bien",
    en: "Asset",
    types: ["equipment", "inventory", "other"],
  },
];
for (const sample of SAMPLE_CATEGORIES) {
  const existing = DEMO_LISTINGS.filter(
    (item) => item.category === sample.category,
  ).length;
  for (let number = existing + 1; number <= 50; number++) {
    const index = number - 1;
    const [region, locality] = SAMPLE_REGIONS[index % SAMPLE_REGIONS.length];
    const usd = number % 6 === 0;
    const base =
      sample.category === "properties"
        ? 25000000
        : sample.category === "vehicles"
          ? 1200000
          : 300000;
    DEMO_LISTINGS.push({
      id: `DEMO-${sample.prefix}${String(number).padStart(2, "0")}`,
      category: sample.category,
      type: sample.types[index % sample.types.length],
      region,
      locality,
      titleEs: `${sample.es} de demostración ${String(number).padStart(2, "0")}`,
      titleEn: `Demonstration ${sample.en.toLowerCase()} ${String(number).padStart(2, "0")}`,
      area:
        sample.category === "properties" && number % 9 !== 0
          ? String(70 + number * 31)
          : null,
      amount: (
        (base +
          number * (sample.category === "properties" ? 1350000 : 175000)) /
        (usd ? 500 : 1)
      ).toFixed(2),
      currency: usd ? "USD" : "CRC",
      date: new Date(Date.UTC(2027, 0, number)).toISOString().slice(0, 10),
      time: ["08:30", "09:00", "10:00", "11:30", "13:00"][index % 5],
      quality: number % 3 === 0 ? "needs_review" : "reviewed",
      mapped: false,
      tags: [],
      color: index % 5,
    });
  }
}
// Fictional next-event round; production must use the round from the linked notice event.
DEMO_LISTINGS.forEach((item, index) => {
  item.nextAuctionRound = (index % 3) + 1;
  // Demonstration spacing only: real schedules come from notice events, never this formula.
  item.auctionRounds = [1, 2, 3].map((round) => ({
    round,
    time: item.time,
    timezone: INSTANCE_CONFIG.timezone,
    // Illustrative amounts only; no legal reduction schedule is implied.
    baseOffer: {
      amount: (
        Number(item.amount) +
        (round - item.nextAuctionRound) * (item.currency === "USD" ? 100 : 1000)
      ).toFixed(2),
      currency: item.currency,
    },
    date: new Date(
      Date.parse(item.date + "T12:00:00Z") +
        (round - item.nextAuctionRound) * 14 * 86400000,
    )
      .toISOString()
      .slice(0, 10),
  }));
});
// Clearly fictional identifiers; never real registry numbers or license plates.
DEMO_LISTINGS.forEach((item) => {
  if (item.category === "properties")
    item.registrationNumber = `DEMO-REG-${item.id.slice(-3)}`;
  if (item.category === "vehicles")
    item.plate = `DEMO-PLATE-${item.id.slice(-3)}`;
});
// Fictional auction and sale-unit relationships for the Auction tab.
for (const category of ["properties", "vehicles", "other"]) {
  const items = DEMO_LISTINGS.filter((item) => item.category === category);
  items.forEach((item, index) => {
    item.auctionId = `DEMO-AUCTION-${category}-${Math.floor(index / 5) + 1}`;
    item.saleMode = "individual";
    item.lotId = null;
  });
  // Two generated examples sold as one lot; keep their shared schedule/base coherent.
  const members = items.slice(6, 8),
    lead = members[0];
  for (const item of members) {
    item.saleMode = "lot";
    item.lotId = `DEMO-LOT-${category}-02`;
    item.auctionRounds = JSON.parse(JSON.stringify(lead.auctionRounds));
    item.date = lead.date;
    item.time = lead.time;
    item.nextAuctionRound = lead.nextAuctionRound;
    item.amount = lead.amount;
    item.currency = lead.currency;
  }
}
// Synthetic notice terms only. No Costa Rican statutory formula is configured.
for(const item of DEMO_LISTINGS.filter(item=>["DEMO-A07","DEMO-A08"].includes(item.id))) {
  item.roundCostRules={
    guarantee:{kind:"percentOfBase",basisPoints:1000,rounding:"halfUp",currency:"CRC",source:"notice",reference:"DEMO-NOTICE-TERMS-A07",verified:true},
    participationFee:{kind:"fixed",amount:"5000.00",currency:"CRC",source:"notice",reference:"DEMO-NOTICE-TERMS-A07",verified:true},
  };
}
const ORIGINAL_LISTINGS = JSON.parse(JSON.stringify(DEMO_LISTINGS));
const COPY = {
  es: {
    pagination: "Paginación de remates",
    pageSize: "Remates por página",
    previousPage: "Anterior",
    nextPage: "Siguiente",
    pageLabel: "Página",
    ofLabel: "de",
    showing: "Mostrando",
    noPages: "Sin páginas",
    appName: "Remates",
    openFilters: "Abrir filtros",
    filterView: "Filtros del listado",
    filterViewHelp:
      "Edite grupos, guarde filtros con nombre o recupere los suyos. Los resultados cambian al aplicar.",
    applyReturn: "Aplicar y ver resultados",
    cancelFilters: "Cancelar y volver",
    savedFiltersPanel: "Mis filtros guardados",
    retrieveFilter: "Recuperar",
    noSavedFilters: "Todavía no tiene filtros guardados.",
    saveDraftHelp:
      "Guardar conserva este borrador validado como una nueva definición de su cuenta; no cambia los resultados.",
    draftSummary: "Borrador de filtros",
    draftCategory: "Sección del borrador",
    contextLoadHelp:
      "Recuperar restaura la sección y la organización indicadas. Revise el borrador antes de aplicar.",
    retrievedFilter: "Filtros recuperados en el borrador",
    retrieveDenied:
      "No se pueden recuperar estos filtros: revise propiedad, organización y disponibilidad.",
    manageFilters: "Abrir mis filtros",
    draftOnly: "Borrador: los resultados anteriores siguen vigentes.",
    combineGroups: "Combinar grupos",
    combineTerms: "Combinar términos",
    allAnd: "Todos (AND)",
    anyOr: "Cualquiera (OR)",
    group: "Grupo",
    term: "Término",
    field: "Campo",
    comparison: "Condición",
    value: "Valor",
    addGroup: "Agregar grupo",
    addTerm: "Agregar término",
    removeGroup: "Eliminar grupo",
    removeTerm: "Eliminar término",
    noGroups: "Sin grupos: se muestran todos los bienes de esta sección.",
    expressionHelp:
      "Combine términos dentro de cada grupo y luego combine los grupos. Los cambios se aplican al pulsar Aplicar y ver resultados.",
    invalidExpression:
      "Revise grupos y términos: valores completos, condiciones compatibles y límites de 10 grupos / 20 términos por grupo / 100 términos en total.",
    contains: "Contiene",
    eq: "Es igual a",
    gte: "Mayor o igual que",
    lte: "Menor o igual que",
    isUnknown: "No indicado",
    baseField: "Base publicada (con moneda)",
    areaField: "Área m²",
    qualityField: "Estado de extracción",
    expressionPreview: "Filtros aplicados",
    textFilter: "Texto o referencia",
    home: "Inicio de Remates",
    properties: "Propiedades",
    vehicles: "Vehículos",
    other: "Otros",
    car: "Automóvil",
    motorcycle: "Motocicleta",
    truck: "Camión",
    vehicle_other: "Otro vehículo",
    equipment: "Equipo",
    inventory: "Inventario",
    listingIntro:
      "Consulte remates, asigne etiquetas y revise el aviso original.",
    auctionType: "Tipo",
    allTypes: "Cualquier tipo",
    assignTags: "Asignar etiquetas",
    applyTags: "Aplicar etiquetas",
    organizationTags: "Etiquetas",
    allOrganizationTags: "Todas las etiquetas",
    noAssignedTags: "Sin etiquetas asignadas",
    organizationResearch: "Etiquetas",
    taggedCount: "Remates con etiquetas",
    searchContext: "Contexto de ejecución",
    contextUnavailable: "Contexto no disponible",
    ownerOnlySearch: "Filtros de su cuenta",
    overviewTab: "Información",
    imagesTab: "Imágenes",
    imagesTitle: "Imágenes del remate",
    imagesHelp: "Imágenes adjuntas. No son evidencia oficial del aviso.",
    attachImages: "Adjuntar imágenes",
    imageFiles: "Seleccione archivos de imagen",
    imageLimits:
      "JPEG, PNG o WebP · máximo propuesto 10 MB por archivo y 20 adjuntos por remate",
    imagesEmpty: "Todavía no hay imágenes adjuntas",
    imagesEmptyHelp: "Puede adjuntar imágenes aquí.",
    imageError:
      "Revise el formato, el tamaño de 10 MB y el límite de 20 imágenes.",
    imageAdded: "Imágenes agregadas a la demostración local",
    imageLocalOnly:
      "Demostración local: los archivos seleccionados se previsualizan en este navegador; no se suben a un servidor.",
    uploadedBy: "Adjuntado por",
    noNotes: "Sin notas.",
    systemDemo:
      "Simulación local. No se cambia ningún servicio ni se ejecuta una ingesta real.",
    systemControls: "Controles de ingesta",
    instanceCountry: "País de la instancia",
    system: "Sistema",
    systemTitle: "Configuración del sistema",
    systemSub: "Administre la instancia y sus procesos de ingesta.",
    systemRolePreview: "Vista de rol de sistema",
    noSystemRole: "Sin rol de sistema",
    systemRequired:
      "Se requiere SYSADMIN para configurar el sistema y realizar estas operaciones.",
    ingestionEnabled: "Ingesta habilitada",
    sourceCheckInterval: "Intervalo de consulta de fuentes en minutos",
    saveSystemSettings: "Guardar configuración del sistema",
    runIngestion: "Ejecutar ingesta de ejemplo",
    systemSettingsSaved: "Configuración de sistema guardada en la demostración",
    systemTaskQueued: "Proceso ficticio agregado a la cola",
    systemValidation:
      "Use un intervalo entero de 15 a 1440 minutos y solo los campos permitidos.",
    systemConflict:
      "La configuración cambió. Recargue los valores antes de guardar.",
    ingestionPaused:
      "La ingesta está pausada. Habilítela antes de iniciar un proceso.",
    sourceAdapter: "Adaptador de fuentes",
    lastRun: "Último proceso de ejemplo",
    operationsStatus: "Operaciones de la instancia",
    queued: "En cola",
    noRuns: "No se han iniciado procesos en esta demostración.",
    settings: "Configuración",
    settingsTitle: "Configuración de la organización",
    settingsSub:
      "ADMIN administra la organización. MANAGER gestiona opciones operativas.",
    tagCatalog: "Etiquetas",
    tagHelp:
      "ADMIN y MANAGER administran esta lista. Los usuarios seleccionan etiquetas existentes.",
    tagLabel: "Nombre de la etiqueta",
    addTag: "Agregar etiqueta",
    renameTag: "Renombrar",
    deactivateTag: "Desactivar",
    reactivateTag: "Reactivar",
    inactiveTag: "Inactiva",
    orgName: "Nombre de la organización",
    saveSettings: "Guardar configuración",
    manageUsers: "Administrar usuarios",
    manageBilling: "Administrar facturación",
    permissionDenied: "Su rol no permite cambiar esta configuración.",
    tagDuplicate: "Ya existe una etiqueta con ese nombre.",
    invalidTag: "Use un nombre de 1 a 40 caracteres.",
    tagUpdated: "Lista de etiquetas actualizada",
    settingsSaved: "Configuración de ejemplo guardada",
    tagSelectionHelp: "Seleccione etiquetas de la lista.",
    noTags:
      "No hay etiquetas disponibles. Un ADMIN o MANAGER puede agregarlas.",
    tagArchivedHelp:
      "Las etiquetas eliminadas conservan sus asignaciones anteriores.",
    researchProposal:
      "Los permisos de investigación de USER son una propuesta pendiente de confirmación.",
    overview: "Resumen",
    discover: "Explorar",
    alerts: "Alertas",
    team: "Equipo",
    plans: "Planes",
    review: "Revisión",
    auth: "Ingresar",
    workspace: "ORGANIZACIÓN",
    operations: "OPERACIONES",
    solo: "Organización individual",
    org: "Organización de ejemplo",
    demo: "Demostración con datos ficticios · Sin remates reales",
    guide: "Guía del prototipo",
    research: "INVESTIGACIÓN DE REMATES",
    title: "Encuentre su próxima oportunidad",
    subtitle:
      "Explore inmuebles, compare información y consulte la fuente original.",
    country: "Costa Rica",
    filters: "Filtros",
    clear: "Limpiar",
    province: "Provincia",
    all: "Todas",
    type: "Tipo de inmueble",
    anyType: "Cualquier tipo",
    currency: "Moneda de la base",
    allCurrencies: "Todas las monedas",
    min: "Desde",
    max: "Hasta",
    advanced: "Filtros avanzados",
    areaMin: "Área mínima m²",
    areaMax: "Área máxima m²",
    unknownArea: "Incluir área no indicada",
    reviewedOnly: "Solo extracciones revisadas",
    apply: "Aplicar filtros",
    result: "remate de ejemplo",
    results: "remates de ejemplo",
    list: "Lista",
    map: "Mapa",
    saveSearch: "Guardar filtros",
    base: "Base publicada",
    nextEvent: "Próximo remate",
    auctionRound: "Ronda",
    round1: "Primera ronda",
    round2: "Segunda ronda",
    round3: "Tercera ronda",
    columns: "Columnas",
    resetColumns: "Restablecer columnas",
    columnsSaved: "Selección guardada para tu usuario",
    source: "Ver aviso",
    area: "Área",
    notReported: "No indicado",
    reviewed: "Extracción revisada",
    needsReview: "Requiere revisión",
    view: "Ver detalle",
    illustration: "Ilustración conceptual",
    house: "Casa",
    land: "Terreno",
    apartment: "Apartamento",
    commercial: "Comercial",
    save: "Guardar",
    fiction:
      "Todos los datos de esta ficha son ficticios. Consulte la fuente y el expediente antes de decidir.",
    back: "Volver a explorar",
    assetInfo: "Información del bien",
    reference: "Referencia de ejemplo",
    location: "Ubicación",
    quality: "Estado de extracción",
    events: "Eventos publicados",
    firstEvent: "Primera fecha de ejemplo",
    timezone: "Hora de Costa Rica · UTC−06:00",
    evidence: "Evidencia y procedencia",
    sourceDate: "Publicación ficticia: 2 nov 2026",
    checked: "Consulta ficticia: 5 nov 2026, 10:00",
    sourceCaution:
      "La revisión comprueba la transcripción; no certifica la situación jurídica del bien.",
    sourceTitle: "Aviso de demostración",
    original: "Texto sintético en español · No es un documento judicial",
    revision: "Revisión",
    extract: "Campos extraídos",
    raw: "Texto de ejemplo, página 1",
    noPhoto: "No se ha aportado una fotografía de la propiedad.",
    mapConcept: "Mapa conceptual · No geográfico",
    mapWarning: "Ubicaciones ficticias; no usar para llegar al bien.",
    approximate: "Ubicación aproximada",
    withoutMap: "sin ubicación representable",
    selectPin: "Seleccione un punto para ver el bien.",
    openAsset: "Abrir remate",
    welcome: "Su espacio de investigación",
    overviewSub: "Organice oportunidades y mantenga la fuente a la vista.",
    featureTitle: "Una buena decisión empieza con la fuente.",
    featureBody:
      "Explore los datos publicados y conserve sus notas en un espacio privado. Las fechas y bases de esta demostración no corresponden a remates reales.",
    start: "Explorar remates",
    recent: "Ejemplos para explorar",
    activeSearches: "Filtros activos",
    catalog: "Remates de ejemplo",
    private: "Privado para el espacio seleccionado",
    tags: "Etiquetas privadas",
    editTags: "Editar etiquetas",
    alertsTitle: "Mis filtros y alertas",
    alertsSub: "Filtros de su cuenta y su contexto de ejecución.",
    emptyAlerts: "No hay filtros guardados",
    emptyAlertsBody:
      "Aplique filtros en Explorar y seleccione Guardar filtros.",
    paused: "Pausada",
    active: "Activa",
    pause: "Pausar",
    resume: "Reanudar",
    delete: "Eliminar",
    daily: "Resumen diario por correo · Solo demostración",
    teamTitle: "Un equipo, una investigación compartida",
    teamSub: "Roles claros para organizar el trabajo de su organización.",
    invite: "Invitar integrante",
    ADMIN: "ADMIN",
    MANAGER: "MANAGER",
    USER: "USER",
    rolePreview: "Vista de rol",
    readOnly: "El rol actual no tiene acceso a las funciones de investigación.",
    planTitle: "Elija cómo investigar",
    planSub:
      "Propuesta de funcionalidades. Precios, cupos y proveedor pendientes de aprobación.",
    pricePending: "Precio por definir",
    explore: "Explorar",
    researchPlan: "Investigar",
    teamPlan: "Equipo",
    publicCatalog: "Catálogo público y avisos",
    searchMaps: "Filtros y mapas",
    sourceLinks: "Acceso a evidencia de origen",
    savedSearches: "Filtros y alertas",
    sharedSpace: "Espacio de investigación compartido",
    roles: "Roles e invitaciones",
    orgBilling: "Facturación de la organización",
    proposal: "Propuesta",
    reviewPlan: "Revisar propuesta",
    noCharge: "Este prototipo no cobra ni activa una suscripción.",
    reviewTitle: "Revise los datos antes de publicar",
    reviewSub:
      "Una corrección conserva su evidencia y genera una revisión nueva.",
    queue: "Cola de revisión",
    critical: "Campos críticos",
    reason: "Motivo de la corrección",
    publish: "Publicar revisión de ejemplo",
    publishDone: "Revisión de ejemplo publicada localmente",
    reasonPlaceholder: "Describa qué comprobó en el texto de ejemplo",
    validation:
      "Revise el monto y escriba un motivo de al menos 10 caracteres.",
    next: "Siguiente",
    loading: "Cargando ejemplos…",
    empty: "No hay resultados con estos filtros",
    emptyBody: "Pruebe otra ubicación o amplíe el rango de la base.",
    sourceError:
      "No se pudo consultar la fuente. Los datos mostrados son ejemplos almacenados.",
    reset: "Restablecer filtros",
    state: "Estado de vista",
    normal: "Normal",
    emptyState: "Vacío",
    loadingState: "Cargando",
    errorState: "Error de fuente",
    close: "Cerrar",
    searchName: "Nombre de los filtros",
    create: "Guardar filtros de ejemplo",
    searchCreated: "Filtros de ejemplo guardados",
    nameRequired: "Escriba un nombre para los filtros.",
    noEmail: "La demostración no envía correos ni guarda datos al recargar.",
    inviteBoundary:
      "En producción, Clerk gestiona esta invitación después de validar permisos y destinatario. Aquí no se envía ningún mensaje.",
    planBoundary:
      "Las funciones y el precio deben aprobarse antes de conectar un proveedor de pagos.",
    authTitle: "Continúe su investigación",
    authBody:
      "Acceda a su organización mediante Clerk. Si trabaja solo, utilizará una organización individual. La autenticación real aún no está conectada.",
    email: "Correo electrónico",
    continue: "Continuar con Clerk",
    authBoundary:
      "Integración pendiente. Este prototipo no recoge credenciales ni crea cuentas.",
    session: "SESIÓN DE DEMOSTRACIÓN",
    footer: "Remates · Diseño propuesto · 5 nov 2026",
    originalLink:
      "El texto completo es sintético; no existe un enlace a un aviso real.",
    noEdit: "Su rol actual permite consultar este espacio.",
    moneyError:
      "Elija una moneda y use un rango válido. El mínimo no puede superar el máximo.",
    filterSummary: "Filtros guardados",
    allAssets: "Todos los remates",
    notes: "Notas",
    change: "Cambiar",
    tagPrompt: "Separe las etiquetas con comas",
    notePrompt: "Agregue una nota privada de ejemplo",
    demoUser: "Persona de ejemplo",
    attention: "Consulte siempre la fuente",
    remaining: "Áreas, imágenes y ubicaciones son ilustrativas.",
  },
  en: {
    pagination: "Auction item pagination",
    pageSize: "Items per page",
    previousPage: "Previous",
    nextPage: "Next",
    pageLabel: "Page",
    ofLabel: "of",
    showing: "Showing",
    noPages: "No pages",
    appName: "Auctions",
    openFilters: "Open filters",
    filterView: "Listing filters",
    filterViewHelp:
      "Edit groups, save named filters or retrieve your own. Results change when you apply.",
    applyReturn: "Apply and view results",
    cancelFilters: "Cancel and return",
    savedFiltersPanel: "My saved filters",
    retrieveFilter: "Retrieve",
    noSavedFilters: "You have no saved filters yet.",
    saveDraftHelp:
      "Save stores this validated draft as a new definition owned by your account; results stay unchanged.",
    draftSummary: "Filter draft",
    draftCategory: "Draft listing",
    contextLoadHelp:
      "Retrieve restores the listing and organization shown. Review the draft before applying.",
    retrievedFilter: "Saved filters loaded into the draft",
    retrieveDenied:
      "Cannot retrieve these filters: check ownership, organization and availability.",
    manageFilters: "Open my filters",
    draftOnly: "Draft: previous results remain in effect.",
    combineGroups: "Combine groups",
    combineTerms: "Combine terms",
    allAnd: "All (AND)",
    anyOr: "Any (OR)",
    group: "Group",
    term: "Term",
    field: "Field",
    comparison: "Condition",
    value: "Value",
    addGroup: "Add group",
    addTerm: "Add term",
    removeGroup: "Remove group",
    removeTerm: "Remove term",
    noGroups: "No groups: all items in this listing are shown.",
    expressionHelp:
      "Combine terms within each group, then combine the groups. Edits take effect with Apply and view results.",
    invalidExpression:
      "Check groups and terms: complete values, compatible conditions and limits of 10 groups / 20 terms per group / 100 terms total.",
    contains: "Contains",
    eq: "Equals",
    gte: "At least",
    lte: "At most",
    isUnknown: "Not reported",
    baseField: "Published base (with currency)",
    areaField: "Area m²",
    qualityField: "Extraction quality",
    expressionPreview: "Applied filters",
    textFilter: "Text or reference",
    home: "Auctions home",
    properties: "Properties",
    vehicles: "Vehicles",
    other: "Other",
    car: "Car",
    motorcycle: "Motorcycle",
    truck: "Truck",
    vehicle_other: "Other vehicle",
    equipment: "Equipment",
    inventory: "Inventory",
    listingIntro:
      "Explore auction items, assign tags and inspect the original notice.",
    auctionType: "Type",
    allTypes: "Any type",
    assignTags: "Assign tags",
    applyTags: "Apply tags",
    organizationTags: "Tags",
    allOrganizationTags: "All tags",
    noAssignedTags: "No tags assigned",
    organizationResearch: "Tags",
    taggedCount: "Tagged auction items",
    searchContext: "Execution context",
    contextUnavailable: "Context unavailable",
    ownerOnlySearch: "Filters owned by your account",
    overviewTab: "Overview",
    imagesTab: "Images",
    imagesTitle: "Auction item images",
    imagesHelp: "Attached images. These are not official notice evidence.",
    attachImages: "Attach images",
    imageFiles: "Choose image files",
    imageLimits:
      "JPEG, PNG or WebP · proposed limits of 10 MB per file and 20 attachments per auction item",
    imagesEmpty: "No images attached yet",
    imagesEmptyHelp: "You can attach images here.",
    imageError: "Check the allowed format, 10 MB size and 20-image limit.",
    imageAdded: "Images added to the local demonstration",
    imageLocalOnly:
      "Local demonstration: selected files are previewed in this browser and are not uploaded to a server.",
    uploadedBy: "Attached by",
    noNotes: "No notes yet.",
    systemDemo:
      "Local simulation. No service is changed and no real ingestion is run.",
    systemControls: "Ingestion controls",
    instanceCountry: "Instance country",
    system: "System",
    systemTitle: "System settings",
    systemSub: "Manage the instance and its ingestion processes.",
    systemRolePreview: "System role preview",
    noSystemRole: "No system role",
    systemRequired:
      "SYSADMIN is required to configure the system and perform these operations.",
    ingestionEnabled: "Ingestion enabled",
    sourceCheckInterval: "Source check interval in minutes",
    saveSystemSettings: "Save system settings",
    runIngestion: "Run example ingestion",
    systemSettingsSaved: "System settings saved in the demonstration",
    systemTaskQueued: "Fictional process queued",
    systemValidation:
      "Use an integer interval from 15 to 1440 minutes and only the allowed fields.",
    systemConflict: "Settings have changed. Reload the values before saving.",
    ingestionPaused:
      "Ingestion is paused. Enable it before starting a process.",
    sourceAdapter: "Source adapter",
    lastRun: "Last example process",
    operationsStatus: "Instance operations",
    queued: "Queued",
    noRuns: "No processes have been started in this demonstration.",
    settings: "Settings",
    settingsTitle: "Organization settings",
    settingsSub:
      "ADMIN manages the organization. MANAGER manages operational options.",
    tagCatalog: "Tags",
    tagHelp: "ADMIN and MANAGER manage this list. Users select existing tags.",
    tagLabel: "Tag name",
    addTag: "Add tag",
    renameTag: "Rename",
    deactivateTag: "Deactivate",
    reactivateTag: "Reactivate",
    inactiveTag: "Inactive",
    orgName: "Organization name",
    saveSettings: "Save settings",
    manageUsers: "Manage users",
    manageBilling: "Manage billing",
    permissionDenied: "Your role cannot change these settings.",
    tagDuplicate: "A tag with this name already exists.",
    invalidTag: "Use a name of 1 to 40 characters.",
    tagUpdated: "Tag list updated",
    settingsSaved: "Example settings saved",
    tagSelectionHelp: "Choose tags from the available list.",
    noTags: "No tags are available. An ADMIN or MANAGER can add them.",
    tagArchivedHelp: "Deleted tags retain their previous assignments.",
    researchProposal:
      "USER research permissions are proposed and await confirmation.",
    overview: "Overview",
    discover: "Discover",
    alerts: "Alerts",
    team: "Team",
    plans: "Plans",
    review: "Review",
    auth: "Sign in",
    workspace: "ORGANIZATION",
    operations: "OPERATIONS",
    solo: "Solo organization",
    org: "Demo organization",
    demo: "Demonstration with fictional data · No real auctions",
    guide: "Prototype guide",
    research: "AUCTION RESEARCH",
    title: "Find your next opportunity",
    subtitle:
      "Explore properties, compare information and consult the original source.",
    country: "Costa Rica",
    filters: "Filters",
    clear: "Clear",
    province: "Province",
    all: "All provinces",
    type: "Property type",
    anyType: "Any property type",
    currency: "Published base currency",
    allCurrencies: "All currencies",
    min: "Minimum",
    max: "Maximum",
    advanced: "Advanced filters",
    areaMin: "Minimum area m²",
    areaMax: "Maximum area m²",
    unknownArea: "Include unreported area",
    reviewedOnly: "Reviewed extractions only",
    apply: "Apply filters",
    result: "example auction item",
    results: "example auction items",
    list: "List",
    map: "Map",
    saveSearch: "Save filters",
    base: "Published base",
    nextEvent: "Next Auction",
    auctionRound: "Round",
    round1: "First round",
    round2: "Second round",
    round3: "Third round",
    columns: "Columns",
    resetColumns: "Reset columns",
    columnsSaved: "Selection saved for your user",
    source: "View notice",
    area: "Area",
    notReported: "Not reported",
    reviewed: "Reviewed extraction",
    needsReview: "Needs review",
    view: "View details",
    illustration: "Conceptual illustration",
    house: "House",
    land: "Land",
    apartment: "Apartment",
    commercial: "Commercial",
    save: "Save",
    fiction:
      "All details on this page are fictional. Consult the source and case file before deciding.",
    back: "Back to discovery",
    assetInfo: "Item information",
    reference: "Example reference",
    location: "Location",
    quality: "Extraction status",
    events: "Published events",
    firstEvent: "First example schedule",
    timezone: "Costa Rica time · UTC−06:00",
    evidence: "Evidence and provenance",
    sourceDate: "Fictional publication: 2 Nov 2026",
    checked: "Fictional check: 5 Nov 2026, 10:00",
    sourceCaution:
      "Review checks the transcription; it does not certify the legal condition of the item.",
    sourceTitle: "Demonstration notice",
    original: "Synthetic Spanish text · Not a judicial document",
    revision: "Revision",
    extract: "Extracted fields",
    raw: "Example text, page 1",
    noPhoto: "No property photograph has been provided.",
    mapConcept: "Conceptual map · Not geographic",
    mapWarning: "Fictional locations; do not use for navigation.",
    approximate: "Approximate location",
    withoutMap: "without a representable location",
    selectPin: "Select a point to inspect the auction item.",
    openAsset: "Open item",
    welcome: "Your research workspace",
    overviewSub: "Organize opportunities and keep the source in view.",
    featureTitle: "A sound decision starts with the source.",
    featureBody:
      "Explore published information and keep notes in a private workspace. Dates and amounts in this demonstration do not correspond to real auctions.",
    start: "Explore auctions",
    recent: "Examples to explore",
    activeSearches: "Active filters",
    catalog: "Example auction items",
    private: "Private to the selected workspace",
    tags: "Private tags",
    editTags: "Edit tags",
    alertsTitle: "My filters and alerts",
    alertsSub: "Filters owned by your account and their execution context.",
    emptyAlerts: "No saved filters",
    emptyAlertsBody: "Apply filters in Discover and choose Save filters.",
    paused: "Paused",
    active: "Active",
    pause: "Pause",
    resume: "Resume",
    delete: "Delete",
    daily: "Daily email digest · Demonstration only",
    teamTitle: "One team, shared research",
    teamSub: "Clear roles to organize your organization’s work.",
    invite: "Invite member",
    ADMIN: "ADMIN",
    MANAGER: "MANAGER",
    USER: "USER",
    rolePreview: "Role preview",
    readOnly: "The current role does not have research access.",
    planTitle: "Choose how you research",
    planSub: "Proposed features. Prices, limits and provider await approval.",
    pricePending: "Price to be defined",
    explore: "Explore",
    researchPlan: "Research",
    teamPlan: "Team",
    publicCatalog: "Public catalog and notices",
    searchMaps: "Filters and maps",
    sourceLinks: "Access to source evidence",
    savedSearches: "Saved filters and alerts",
    sharedSpace: "Shared research workspace",
    roles: "Roles and invitations",
    orgBilling: "Organization billing",
    proposal: "Proposal",
    reviewPlan: "Review proposal",
    noCharge: "This prototype does not charge or activate a subscription.",
    reviewTitle: "Review the data before publication",
    reviewSub: "A correction retains its evidence and creates a new revision.",
    queue: "Review queue",
    critical: "Critical fields",
    reason: "Reason for correction",
    publish: "Publish example revision",
    publishDone: "Example revision published locally",
    reasonPlaceholder: "Describe what you checked in the sample text",
    validation:
      "Check the amount and enter a reason of at least 10 characters.",
    next: "Next",
    loading: "Loading examples…",
    empty: "No results match these filters",
    emptyBody: "Try another location or a wider base amount range.",
    sourceError:
      "The source could not be checked. Displayed records are stored examples.",
    reset: "Reset filters",
    state: "Preview state",
    normal: "Normal",
    emptyState: "Empty",
    loadingState: "Loading",
    errorState: "Source error",
    close: "Close",
    searchName: "Filter name",
    create: "Save example filters",
    searchCreated: "Example filters saved",
    nameRequired: "Enter a name for these filters.",
    noEmail: "The demonstration sends no emails and resets on reload.",
    inviteBoundary:
      "In production, Clerk manages this invitation after permission and recipient validation. No message is sent here.",
    planBoundary:
      "Features and pricing require approval before connecting a payment provider.",
    authTitle: "Continue your research",
    authBody:
      "Access your organization through Clerk. Solo users work in a one-person organization. Real authentication is not connected yet.",
    email: "Email address",
    continue: "Continue with Clerk",
    authBoundary:
      "Integration pending. This prototype collects no credentials and creates no accounts.",
    session: "DEMONSTRATION SESSION",
    footer: "Auctions · Proposed design · 5 Nov 2026",
    originalLink:
      "The entire text is synthetic; there is no link to a real notice.",
    noEdit: "Your current role allows reading this workspace.",
    moneyError:
      "Choose a currency and use a valid range. Minimum cannot exceed maximum.",
    filterSummary: "Saved filters",
    allAssets: "All auction items",
    notes: "Notes",
    change: "Change",
    tagPrompt: "Separate tags with commas",
    notePrompt: "Add a private example note",
    demoUser: "Example person",
    attention: "Always consult the source",
    remaining: "Areas, artwork and locations are illustrative.",
  },
};
const CATEGORIES = ["properties", "vehicles", "other"];
const CATEGORY_TYPES = {
  properties: ["house", "land", "apartment", "commercial"],
  vehicles: ["car", "motorcycle", "truck", "vehicle_other"],
  other: ["equipment", "inventory", "other"],
};
const initialFilter = (category = "properties") => ({
  schemaVersion: 3,
  category,
  expression: { operator: "AND", groups: [] },
});
const COLOR_SCHEMES = [
  "forest",
  "ocean",
  "slate",
  "terracotta",
  "warm-blue",
  "navy",
  "studio",
  "studio-warm-blue",
  "harbor",
];
function storedColorScheme() {
  try {
    const value = localStorage.getItem("auctions-color-scheme");
    return COLOR_SCHEMES.includes(value) ? value : "forest";
  } catch {
    return "forest";
  }
}
function setColorScheme(value) {
  if (!COLOR_SCHEMES.includes(value)) return false;
  state.colorScheme = value;
  try {
    localStorage.setItem("auctions-color-scheme", value);
  } catch {}
  return true;
}
function storedTheme() {
  try {
    const value = localStorage.getItem("auctions-theme");
    return ["light", "dark", "system"].includes(value) ? value : "system";
  } catch {
    return "system";
  }
}
function setTheme(value) {
  if (!["light", "dark", "system"].includes(value)) return false;
  state.theme = value;
  try {
    localStorage.setItem("auctions-theme", value);
  } catch {}
  return true;
}
function effectiveTheme() {
  return state.theme === "system"
    ? window.matchMedia?.("(prefers-color-scheme: dark)")?.matches
      ? "dark"
      : "light"
    : state.theme;
}
const state = {
  theme: storedTheme(),
  colorScheme: storedColorScheme(),
  lang: "es",
  screen: "discover",
  view: "list",
  page: 1,
  pageSize: 25,
  sort: [{ field: "date", direction: "asc" }],
  workspace: "org",
  role: "MANAGER",
  systemRole: null,
  systemSettings: {
    ingestionEnabled: true,
    sourceCheckIntervalMinutes: 60,
    version: 1,
  },
  lastSystemRun: null,
  nextSystemRun: 1,
  selected: "DEMO-A01",
  mapSelected: "DEMO-A01",
  filters: initialFilter(),
  filterDraft: null,
  filterReturn: null,
  preview: "normal",
  roles: { org: "MANAGER", solo: "ADMIN" },
  organizationNames: {},
  tagDefinitions: {
    org: [
      {
        id: "DEMO-TAG-O1",
        label: "Pendiente de estudio",
        color: "amber",
      },
      {
        id: "DEMO-TAG-O2",
        label: "Consultar fuente",
        color: "blue",
      },
    ],
    solo: [
      {
        id: "DEMO-TAG-S1",
        label: "Revisar documentos",
        color: "purple",
      },
    ],
  },
  nextTagId: 1,
  userId: "DEMO-USER-01",
  nextSearchId: 1,
  itemTab: "overview",
  images: {},
  nextImageId: 1,
  tags: {
    "orgDEMO-A01": ["DEMO-TAG-O1", "DEMO-TAG-O2"],
    "orgDEMO-A02": ["DEMO-TAG-O2", "DEMO-TAG-O1"],
  },
  notes: {},
  propertyResearch: {},
  searches: [],
  revision: 1,
  reviewAmount: "65000000.00",
  reviewReason: "",
};
// Additional fictional labels for testing the long tag catalog and picker.
state.tagDefinitions.org.push(
  ...Array.from({ length: 25 }, (_, index) => ({
    id: `DEMO-TAG-TEST-${String(index + 1).padStart(2, "0")}`,
    label: `Prueba ${String(index + 1).padStart(2, "0")}${index % 5 === 0 ? " · Seguimiento de documentación pendiente" : index % 3 === 0 ? " · Revisión adicional" : ""}`,
    color: ["gray", "blue", "green", "amber", "red", "purple"][index % 6],
  })),
);
const app = document.getElementById("app");
const t = (k) => COPY[state.lang][k] || k;
const esc = (v) =>
  String(v ?? "").replace(
    /[&<>"']/g,
    (x) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        x
      ],
  );
const title = (a) => (state.lang === "es" ? a.titleEs : a.titleEn);
const money = (a) =>
  `${a.currency} ${new Intl.NumberFormat(state.lang === "es" ? "es-CR" : "en-US", { maximumFractionDigits: 0 }).format(Number(a.amount))}`;
const date = (a) =>
  new Intl.DateTimeFormat(state.lang === "es" ? "es-CR" : "en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "America/Costa_Rica",
  }).format(new Date(a.date + "T12:00:00-06:00"));
const current = () =>
  DEMO_LISTINGS.find((x) => x.id === state.selected) || DEMO_LISTINGS[0];
const canEdit = () => ["ADMIN", "MANAGER", "USER"].includes(state.role);
const canAdmin = () => state.role === "ADMIN";
const canManageTags = () => ["ADMIN", "MANAGER"].includes(state.role);
const canSystem = () =>
  state.systemRole === "SYSADMIN" &&
  ["ADMIN", "MANAGER", "USER"].includes(state.role);

const organizationName = () =>
  state.organizationNames[state.workspace] || t(state.workspace);
const normalizedTagLabel = (label) =>
  label.normalize("NFKC").trim().replace(/\s+/g, " ").toLowerCase();
const orgTags = () => state.tagDefinitions[state.workspace];
const TAG_COLORS = ["gray", "blue", "green", "amber", "red", "purple"];
function tagColorOptions(selected = "gray") {
  return options(
    TAG_COLORS.map((color, i) => [
      color,
      (state.lang === "es"
        ? ["Gris", "Azul", "Verde", "Ámbar", "Rojo", "Morado"]
        : ["Gray", "Blue", "Green", "Amber", "Red", "Purple"])[i],
    ]),
    selected,
  );
}
function createOrganizationTag(label, color = "gray") {
  if (!canManageTags()) return { ok: false, error: "permissionDenied" };
  if (!TAG_COLORS.includes(color)) return { ok: false, error: "invalidTag" };
  label = String(label).trim().replace(/\s+/g, " ");
  if (
    !label ||
    Array.from(label).length > 40 ||
    Array.from(normalizedTagLabel(label)).length > 40
  )
    return { ok: false, error: "invalidTag" };
  if (
    orgTags().some(
      (x) => normalizedTagLabel(x.label) === normalizedTagLabel(label),
    )
  )
    return { ok: false, error: "tagDuplicate" };
  const item = {
    id: "DEMO-TAG-" + state.workspace + "-" + state.nextTagId++,
    label,
    color,
  };
  orgTags().push(item);
  return { ok: true, item };
}
function updateOrganizationTag(id, patch) {
  if (!canManageTags()) return { ok: false, error: "permissionDenied" };
  const item = orgTags().find((x) => x.id === id);
  if (!item || item.deleted) return { ok: false, error: "invalidTag" };
  if (Object.keys(patch).some((k) => !["label", "color"].includes(k)))
    return { ok: false, error: "invalidTag" };
  const label = ("label" in patch ? String(patch.label) : item.label)
    .trim()
    .replace(/\s+/g, " ");
  if (!label || Array.from(label).length > 40)
    return { ok: false, error: "invalidTag" };
  if (
    orgTags().some(
      (x) =>
        x.id !== id &&
        normalizedTagLabel(x.label) === normalizedTagLabel(label),
    )
  )
    return { ok: false, error: "tagDuplicate" };
  if ("color" in patch && !TAG_COLORS.includes(patch.color))
    return { ok: false, error: "invalidTag" };
  if ("color" in patch) item.color = patch.color;
  item.label = label;
  return { ok: true, item };
}
function deleteOrganizationTag(id) {
  if (!canManageTags()) return { ok: false, error: "permissionDenied" };
  const tag = orgTags().find((tag) => tag.id === id && !tag.deleted);
  if (!tag) return { ok: false, error: "invalidTag" };
  tag.deleted = true;
  return { ok: true };
}
function updateOrganizationName(name) {
  if (!canAdmin()) return { ok: false, error: "permissionDenied" };
  name = String(name).trim();
  if (!name || name.length > 100) return { ok: false, error: "invalidTag" };
  state.organizationNames[state.workspace] = name;
  return { ok: true };
}
function assignOrganizationTags(assetId, ids, note) {
  if (!canEdit()) return { ok: false, error: "permissionDenied" };
  if (
    !DEMO_LISTINGS.some((x) => x.id === assetId) ||
    !Array.isArray(ids) ||
    ids.length > 20
  )
    return { ok: false, error: "invalidTag" };
  const key = state.workspace + assetId,
    previous = state.tags[key] || [];
  if (
    ids.some(
      (id) =>
        !orgTags().some(
          (tag) => tag.id === id && (!tag.deleted || previous.includes(id)),
        ),
    )
  )
    return { ok: false, error: "invalidTag" };
  state.tags[key] = [...new Set(ids)];
  if (note !== undefined) state.notes[key] = String(note).slice(0, 10000);
  return { ok: true };
}
function assignedTagLabels(assetId) {
  return (state.tags[state.workspace + assetId] || [])
    .map((id) => {
      const tag = orgTags().find((x) => x.id === id);
      return tag ? tag.label : "";
    })
    .filter(Boolean)
    .join(", ");
}

const taggedAssetCount = () =>
  DEMO_LISTINGS.filter(
    (a) => (state.tags[state.workspace + a.id] || []).length > 0,
  ).length;
const canUseSearchContext = (context) =>
  !!context && ["ADMIN", "MANAGER", "USER"].includes(state.roles[context]);
const ownedSearch = (id) =>
  state.searches.find((x) => x.id === id && x.ownerUserId === state.userId);
function createOwnedSearch(name, filter, context) {
  if (!canEdit() || !canUseSearchContext(context))
    return { ok: false, error: "permissionDenied" };
  name = String(name).trim();
  if (!name || name.length > 100) return { ok: false, error: "nameRequired" };
  if (!validateFilter(filter, context))
    return { ok: false, error: "invalidExpression" };
  const search = {
    id: "SEARCH-" + state.nextSearchId++,
    ownerUserId: state.userId,
    contextWorkspace: context,
    title: name,
    filter: canonicalFilter(filter),
    enabled: true,
  };
  state.searches.push(search);
  return { ok: true, search };
}
function toggleOwnedSearch(id) {
  const search = ownedSearch(id);
  if (!search || !canEdit()) return { ok: false, error: "permissionDenied" };
  search.enabled = !search.enabled;
  return { ok: true };
}
function deleteOwnedSearch(id) {
  if (!ownedSearch(id) || !canEdit())
    return { ok: false, error: "permissionDenied" };
  state.searches = state.searches.filter((x) => x.id !== id);
  return { ok: true };
}
function attachAuctionImages(assetId, files) {
  if (!canEdit()) return { ok: false, error: "permissionDenied" };
  if (!DEMO_LISTINGS.some((x) => x.id === assetId))
    return { ok: false, error: "imageError" };
  files = Array.from(files);
  const key = state.workspace + assetId,
    existing = state.images[key] || [];
  if (
    !files.length ||
    existing.length + files.length > 20 ||
    files.some(
      (f) =>
        !["image/jpeg", "image/png", "image/webp"].includes(f.type) ||
        f.size < 1 ||
        f.size > 10485760,
    )
  )
    return { ok: false, error: "imageError" };
  const added = files.map((f) => ({
    id: "DEMO-IMAGE-" + state.nextImageId++,
    name: f.name,
    type: f.type,
    size: f.size,
    uploaderId: state.userId,
    url:
      typeof URL !== "undefined" && URL.createObjectURL
        ? URL.createObjectURL(f)
        : "",
  }));
  state.images[key] = [...existing, ...added];
  return { ok: true };
}
function tagBadges(assetId) {
  return (state.tags[state.workspace + assetId] || [])
    .map((id) => {
      const tag = orgTags().find((x) => x.id === id);
      return tag
        ? `<span class="badge tag-badge tag-${TAG_COLORS.includes(tag.color) ? tag.color : "gray"}" title="${esc(tag.label)}">${esc(tag.label)}</span>`
        : "";
    })
    .join("");
}

function toast(msg) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.style.display = "block";
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => (el.style.display = "none"), 3500);
}
function showDialog(titleText, html) {
  document.getElementById("dialog-title").textContent = titleText;
  document.getElementById("dialog-body").innerHTML = html;
  document.getElementById("dialog-close").textContent = t("close");
  document.getElementById("notice").showModal();
}
function selectCategory(category) {
  if (!CATEGORIES.includes(category)) return false;
  if (
    state.screen === "filters" &&
    state.filterReturn &&
    canUseSearchContext(state.filterReturn.workspace)
  ) {
    state.workspace = state.filterReturn.workspace;
    state.role = state.roles[state.workspace];
  }
  state.filters = initialFilter(category);
  state.sort = state.sort.filter((r) => !["area", "amount"].includes(r.field));
  state.page = 1;
  state.filterDraft = null;
  state.preview = "normal";
  state.view = "list";
  state.filterReturn = null;
  navigate("discover");
  return true;
}
function navigate(screen, id) {
  if (screen === "property-edit") screen = "asset";
  if (
    state.screen === "filters" &&
    screen !== "filters" &&
    state.filterReturn
  ) {
    if (canUseSearchContext(state.filterReturn.workspace)) {
      state.workspace = state.filterReturn.workspace;
      state.role = state.roles[state.workspace];
    }
    state.filterDraft = null;
    state.filterReturn = null;
  }
  state.screen = screen;
  if (id) {
    state.selected = id;
    const item = DEMO_LISTINGS.find((a) => a.id === id);
    if (item && item.category !== state.filters.category) {
      state.filters = initialFilter(item.category);
      state.page = 1;
      state.filterDraft = null;
    }
  }
  if (screen === "asset") state.itemTab = "overview";
  render();
  window.scrollTo({ top: 0, behavior: "instant" });
}
function badge(a) {
  return `<span class="badge ${a.quality === "reviewed" ? "" : "warning"}">${t(a.quality === "reviewed" ? "reviewed" : "needsReview")}</span>`;
}
function card(a) {
  return `<article class="auction-row"><div><div class="card-meta">${t(a.type)} · ${a.id}</div><button class="title-link" data-screen="asset" data-id="${a.id}">${esc(title(a))}</button><div class="location">⌖ ${esc(a.locality)}</div></div><div><div class="price-label">${t("base")}</div><div class="price">${money(a)}</div></div><div class="row-facts">${a.category === "properties" ? `<span>${t("area")}: ${a.area ? a.area + " m²" : t("notReported")}</span>` : ""}<span>${t("nextEvent")}: ${nextAuctionDisplay(a)}</span>${badge(a)}</div><div class="row-tags">${tagLabelsButton(a.id)}<div class="actions"><button class="ghost" data-screen="notice" data-id="${a.id}">${t("source")} ↗</button></div></div></article>`;
}
function heading(key, sub, tools = "") {
  return `<div class="heading"><div><div class="eyebrow">${t("research")}</div><h1>${t(key)}</h1><p class="muted">${t(sub)}</p></div>${tools ? `<div class="heading-tools">${tools}</div>` : ""}</div>`;
}
function options(values, selected) {
  return values
    .map(
      ([v, label]) =>
        `<option value="${v}" ${v === selected ? "selected" : ""}>${esc(label)}</option>`,
    )
    .join("");
}

const cloneFilter = (f) => JSON.parse(JSON.stringify(f));
const fieldDefinitions = (category) => ({
  text: ["contains"],
  region: ["eq"],
  type: ["eq"],
  organizationTag: ["eq"],
  currency: ["eq"],
  base: ["eq", "gte", "lte", "isUnknown"],
  ...(category === "properties"
    ? { area: ["eq", "gte", "lte", "isUnknown"] }
    : {}),
  quality: ["eq"],
});
const fieldLabel = (field) =>
  t(
    {
      text: "textFilter",
      region: "province",
      type: "auctionType",
      organizationTag: "organizationTags",
      currency: "currency",
      base: "baseField",
      area: "areaField",
      quality: "qualityField",
    }[field],
  );
const regionOptions = [
  ["CR-SJ", "San José"],
  ["CR-A", "Alajuela"],
  ["CR-C", "Cartago"],
  ["CR-H", "Heredia"],
  ["CR-G", "Guanacaste"],
  ["CR-P", "Puntarenas"],
  ["CR-L", "Limón"],
];
const decimalValue = (v) =>
  typeof v === "string" && /^\d+(\.\d{1,4})?$/.test(v) && v.length <= 24;
const moneyValue = (v) =>
  v &&
  typeof v === "object" &&
  !Array.isArray(v) &&
  Object.keys(v).sort().join(",") === "amount,currency" &&
  typeof v.amount === "string" &&
  /^\d+(\.\d{1,2})?$/.test(v.amount) &&
  v.amount.length <= 24 &&
  ["CRC", "USD"].includes(v.currency);
function validateFilter(f, context = state.workspace) {
  if (
    !f ||
    f.schemaVersion !== 3 ||
    !CATEGORIES.includes(f.category) ||
    Object.keys(f).some(
      (k) => !["schemaVersion", "category", "expression"].includes(k),
    )
  )
    return false;
  const e = f.expression;
  if (
    !e ||
    !["AND", "OR"].includes(e.operator) ||
    !Array.isArray(e.groups) ||
    e.groups.length > 10 ||
    Object.keys(e).some((k) => !["operator", "groups"].includes(k))
  )
    return false;
  let count = 0;
  return e.groups.every(
    (g) =>
      g &&
      ["AND", "OR"].includes(g.operator) &&
      Array.isArray(g.terms) &&
      g.terms.length >= 1 &&
      g.terms.length <= 20 &&
      Object.keys(g).every((k) => ["operator", "terms"].includes(k)) &&
      g.terms.every((term) => {
        if (
          ++count > 100 ||
          !term ||
          Object.keys(term).some(
            (k) => !["field", "operator", "value"].includes(k),
          ) ||
          !Object.hasOwn(fieldDefinitions(f.category), term.field) ||
          !fieldDefinitions(f.category)[term.field].includes(term.operator)
        )
          return false;
        const v = term.value;
        if (term.operator === "isUnknown") return !("value" in term);
        if (term.field === "text")
          return (
            typeof v === "string" && v.trim().length > 0 && v.length <= 200
          );
        if (term.field === "region")
          return regionOptions.some((x) => x[0] === v);
        if (term.field === "type")
          return CATEGORY_TYPES[f.category].includes(v);
        if (term.field === "organizationTag")
          return !!state.tagDefinitions[context]?.some((x) => x.id === v);
        if (term.field === "currency") return ["CRC", "USD"].includes(v);
        if (term.field === "quality")
          return ["reviewed", "needs_review"].includes(v);
        if (term.field === "base") return moneyValue(v);
        return term.field === "area" && decimalValue(v);
      }),
  );
}
const normalizedText = (v) =>
  String(v)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
function matchesTerm(a, term) {
  const v = term.value;
  if (term.field === "text")
    return normalizedText(
      [a.id, a.locality, a.titleEs, a.titleEn].join(" "),
    ).includes(normalizedText(v.trim()));
  if (term.field === "organizationTag")
    return (state.tags[state.workspace + a.id] || []).includes(v);
  const actual = {
    region: a.region,
    type: a.type,
    currency: a.currency,
    quality: a.quality,
    area: a.area,
    base: a.amount,
  }[term.field];
  if (term.operator === "isUnknown")
    return actual === null || actual === undefined;
  if (actual === null || actual === undefined) return false;
  if (term.field === "base" && a.currency !== v.currency) return false;
  const right = term.field === "base" ? v.amount : v;
  if (["area", "base"].includes(term.field)) {
    if (term.operator === "gte") return Number(actual) >= Number(right);
    if (term.operator === "lte") return Number(actual) <= Number(right);
    return Number(actual) === Number(right);
  }
  return actual === right;
}
function canonicalFilter(f) {
  const result = cloneFilter(f);
  for (const g of result.expression.groups)
    for (const term of g.terms) {
      if (term.field === "text" && typeof term.value === "string")
        term.value = term.value.trim();
      if (term.field === "base" && moneyValue(term.value)) {
        const parts = term.value.amount.split(".");
        term.value.amount = parts[0] + "." + (parts[1] || "").padEnd(2, "0");
      }
    }
  return result;
}
function matchesExpression(a, e) {
  if (!e.groups.length) return true;
  const matchGroup = (g) =>
    g.operator === "AND"
      ? g.terms.every((term) => matchesTerm(a, term))
      : g.terms.some((term) => matchesTerm(a, term));
  return e.operator === "AND"
    ? e.groups.every(matchGroup)
    : e.groups.some(matchGroup);
}
function filtered() {
  const f = state.filters;
  if (!validateFilter(f)) return [];
  return DEMO_LISTINGS.filter(
    (a) => a.category === f.category && matchesExpression(a, f.expression),
  );
}

const sortFields = ["date", "amount", "locality", "type", "area"];
function sortedItems(items) {
  return [...items].sort((a, b) => {
    for (const rule of state.sort) {
      let x = a[rule.field],
        y = b[rule.field];
      if (x == null || y == null) {
        if (x == null && y != null) return 1;
        if (y == null && x != null) return -1;
        continue;
      }
      const cmp = ["amount", "area"].includes(rule.field)
        ? Number(x) - Number(y)
        : String(x).localeCompare(String(y), state.lang);
      if (cmp) return rule.direction === "asc" ? cmp : -cmp;
    }
    return a.id.localeCompare(b.id);
  });
}
function setSort(rules) {
  if (
    !Array.isArray(rules) ||
    rules.length > 5 ||
    new Set(rules.map((r) => r.field)).size !== rules.length ||
    rules.some(
      (r) =>
        !sortFields.includes(r.field) ||
        !["asc", "desc"].includes(r.direction) ||
        (r.field === "area" && state.filters.category !== "properties"),
    )
  )
    return false;
  if (
    rules.some((r) => r.field === "amount") &&
    new Set(filtered().map((a) => a.currency)).size > 1
  )
    return false;
  state.sort = rules;
  state.page = 1;
  return true;
}
const sortLabel = (f) =>
  t(
    {
      date: "nextEvent",
      amount: "base",
      locality: "location",
      type: "auctionType",
      area: "area",
    }[f],
  );
function sortControls() {
  return `<div class="sort-controls"><strong>${state.lang === "es" ? "Ordenar por" : "Sort by"}</strong>${state.sort
    .map(
      (r, i) =>
        `<div><label for="sort-field-${i}">${state.lang === "es" ? "Prioridad" : "Priority"} ${i + 1}</label><select id="sort-field-${i}" data-sort-field="${i}">${options(
          sortFields
            .filter(
              (f) => f !== "area" || state.filters.category === "properties",
            )
            .map((f) => [f, sortLabel(f)]),
          r.field,
        )}</select><select aria-label="${state.lang === "es" ? "Dirección" : "Direction"} ${i + 1}" data-sort-direction="${i}">${options(
          [
            ["asc", state.lang === "es" ? "Ascendente" : "Ascending"],
            ["desc", state.lang === "es" ? "Descendente" : "Descending"],
          ],
          r.direction,
        )}</select><button data-remove-sort="${i}" aria-label="${state.lang === "es" ? "Eliminar orden" : "Remove sort"} ${i + 1}">×</button></div>`,
    )
    .join(
      "",
    )}<button data-add-sort ${state.sort.length >= sortFields.filter((f) => (f !== "area" || state.filters.category === "properties") && (f !== "amount" || new Set(filtered().map((a) => a.currency)).size <= 1)).length ? "disabled" : ""}>${icon("Plus")} ${state.lang === "es" ? "Agregar orden" : "Add sort"}</button>${columnMenu()}<p id="sort-error" role="alert"></p></div>`;
}
// BEGIN GENERATED LUCIDE ICONS
const LUCIDE_ICONS = {
  Building2:
    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-building-complex lucide-building-2 ui-icon action-icon" aria-hidden="true" focusable="false"><path d="M10 12h4"></path><path d="M10 8h4"></path><path d="M14 21v-3a2 2 0 0 0-4 0v3"></path><path d="M6 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2"></path><path d="M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16"></path></svg>',
  Car: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-car ui-icon action-icon" aria-hidden="true" focusable="false"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"></path><circle cx="7" cy="17" r="2"></circle><path d="M9 17h6"></path><circle cx="17" cy="17" r="2"></circle></svg>',
  Package:
    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-package ui-icon action-icon" aria-hidden="true" focusable="false"><path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"></path><path d="M12 22V12"></path><polyline points="3.29 7 12 12 20.71 7"></polyline><path d="m7.5 4.27 9 5.15"></path></svg>',
  Bell: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bell ui-icon action-icon" aria-hidden="true" focusable="false"><path d="M10.268 21a2 2 0 0 0 3.464 0"></path><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"></path></svg>',
  Users:
    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-users ui-icon action-icon" aria-hidden="true" focusable="false"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><path d="M16 3.128a4 4 0 0 1 0 7.744"></path><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><circle cx="9" cy="7" r="4"></circle></svg>',
  Settings:
    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-settings ui-icon action-icon" aria-hidden="true" focusable="false"><path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"></path><circle cx="12" cy="12" r="3"></circle></svg>',
  Tags: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-tags ui-icon action-icon" aria-hidden="true" focusable="false"><path d="M13.172 2a2 2 0 0 1 1.414.586l6.71 6.71a2.4 2.4 0 0 1 0 3.408l-4.592 4.592a2.4 2.4 0 0 1-3.408 0l-6.71-6.71A2 2 0 0 1 6 9.172V3a1 1 0 0 1 1-1z"></path><path d="M2 7v6.172a2 2 0 0 0 .586 1.414l6.71 6.71a2.4 2.4 0 0 0 3.191.193"></path><circle cx="10.5" cy="6.5" r=".5" fill="currentColor"></circle></svg>',
  ClipboardCheck:
    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clipboard-check ui-icon action-icon" aria-hidden="true" focusable="false"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"></rect><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><path d="m9 14 2 2 4-4"></path></svg>',
  Eye: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-eye ui-icon action-icon" aria-hidden="true" focusable="false"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"></path><circle cx="12" cy="12" r="3"></circle></svg>',
  Tag: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-tag ui-icon action-icon" aria-hidden="true" focusable="false"><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"></path><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"></circle></svg>',
  FileText:
    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-text ui-icon action-icon" aria-hidden="true" focusable="false"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"></path><path d="M14 2v5a1 1 0 0 0 1 1h5"></path><path d="M10 9H8"></path><path d="M16 13H8"></path><path d="M16 17H8"></path></svg>',
  Plus: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus ui-icon action-icon" aria-hidden="true" focusable="false"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>',
  Pencil:
    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pencil ui-icon action-icon" aria-hidden="true" focusable="false"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"></path><path d="m15 5 4 4"></path></svg>',
  Trash2:
    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash lucide-trash-2 ui-icon action-icon" aria-hidden="true" focusable="false"><path d="M10 11v6"></path><path d="M14 11v6"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path><path d="M3 6h18"></path><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>',
  Save: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-save ui-icon action-icon" aria-hidden="true" focusable="false"><path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"></path><path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7"></path><path d="M7 3v4a1 1 0 0 0 1 1h7"></path></svg>',
  X: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x ui-icon action-icon" aria-hidden="true" focusable="false"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>',
  ArrowLeft:
    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-left ui-icon action-icon" aria-hidden="true" focusable="false"><path d="m12 19-7-7 7-7"></path><path d="M19 12H5"></path></svg>',
  ArrowRight:
    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-right ui-icon action-icon" aria-hidden="true" focusable="false"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>',
  ExternalLink:
    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-external-link ui-icon action-icon" aria-hidden="true" focusable="false"><path d="M15 3h6v6"></path><path d="M10 14 21 3"></path><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path></svg>',
  SlidersHorizontal:
    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sliders-horizontal ui-icon action-icon" aria-hidden="true" focusable="false"><path d="M10 5H3"></path><path d="M12 19H3"></path><path d="M14 3v4"></path><path d="M16 17v4"></path><path d="M21 12h-9"></path><path d="M21 19h-5"></path><path d="M21 5h-7"></path><path d="M8 10v4"></path><path d="M8 12H3"></path></svg>',
  List: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-list ui-icon action-icon" aria-hidden="true" focusable="false"><path d="M3 5h.01"></path><path d="M3 12h.01"></path><path d="M3 19h.01"></path><path d="M8 5h13"></path><path d="M8 12h13"></path><path d="M8 19h13"></path></svg>',
  MapPin:
    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin ui-icon action-icon" aria-hidden="true" focusable="false"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path><circle cx="12" cy="10" r="3"></circle></svg>',
  ColumnsSettings:
    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-columns-3-cog lucide-columns-settings lucide-table-config ui-icon action-icon" aria-hidden="true" focusable="false"><path d="M10.6 21H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v5.6"></path><path d="m14.305 19.53.923-.382"></path><path d="M15 3v7.6"></path><path d="m15.229 16.852-.924-.383"></path><path d="m16.852 15.228-.383-.923"></path><path d="m16.852 20.772-.383.924"></path><path d="m19.148 15.228.383-.923"></path><path d="m19.53 21.696-.382-.924"></path><path d="m20.773 16.852.922-.383"></path><path d="m20.773 19.148.922.383"></path><path d="M9 3v18"></path><circle cx="18" cy="18" r="3"></circle></svg>',
  LayoutDashboard:
    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-layout-dashboard ui-icon action-icon" aria-hidden="true" focusable="false"><rect width="7" height="9" x="3" y="3" rx="1"></rect><rect width="7" height="5" x="14" y="3" rx="1"></rect><rect width="7" height="9" x="14" y="12" rx="1"></rect><rect width="7" height="5" x="3" y="16" rx="1"></rect></svg>',
  CreditCard:
    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-credit-card ui-icon action-icon" aria-hidden="true" focusable="false"><rect width="20" height="14" x="2" y="5" rx="2"></rect><line x1="2" x2="22" y1="10" y2="10"></line><path d="M6 14h2"></path></svg>',
  ArrowUp:
    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-up ui-icon action-icon" aria-hidden="true" focusable="false"><path d="m5 12 7-7 7 7"></path><path d="M12 19V5"></path></svg>',
  ArrowDown:
    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-down ui-icon action-icon" aria-hidden="true" focusable="false"><path d="M12 5v14"></path><path d="m19 12-7 7-7-7"></path></svg>',
  Check:
    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check ui-icon action-icon" aria-hidden="true" focusable="false"><path d="M20 6 9 17l-5-5"></path></svg>',
  TriangleAlert:
    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-triangle-exclamation-point lucide-alert-triangle lucide-triangle-alert ui-icon action-icon" aria-hidden="true" focusable="false"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path></svg>',
  Circle:
    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle ui-icon action-icon" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="10"></circle></svg>',
  Menu: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-menu ui-icon action-icon" aria-hidden="true" focusable="false"><path d="M4 5h16"></path><path d="M4 12h16"></path><path d="M4 19h16"></path></svg>',
};
// END GENERATED LUCIDE ICONS
function icon(name) {
  return LUCIDE_ICONS[name] || "";
}
// Replace legacy decorative glyphs in text nodes only, preserving labels and HTML attributes.
function lucideMarkup(markup) {
  const glyphs = {
    "←": "ArrowLeft",
    "→": "ArrowRight",
    "↗": "ExternalLink",
    "⌖": "MapPin",
    "×": "X",
    "↑": "ArrowUp",
    "↓": "ArrowDown",
    "✓": "Check",
    "⚠": "TriangleAlert",
    "☰": "Menu",
    "●": "Circle",
    "▧": "ClipboardCheck",
    "▤": "List",
    "◇": "Tags",
    "⚙": "Settings",
    "＋": "Plus",
    "☷": "SlidersHorizontal",
  };
  return markup
    .split(/(<[^>]+>)/g)
    .map((part) =>
      part.startsWith("<")
        ? part
        : part.replace(/[←→↗⌖×↑↓✓⚠☰●▧▤◇⚙＋☷]/g, (glyph) =>
            icon(glyphs[glyph]),
          ),
    )
    .join("");
}
function rowActionIcon(kind) {
  return icon({ open: "Eye", tags: "Tag", notice: "FileText" }[kind]);
}
function itemActionButtons(item) {
  return (item.category === "properties" ? ["open"] : ["open", "notice"])
    .map((kind) => {
      const labels =
          state.lang === "es"
            ? { open: "Abrir bien", tags: "Etiquetas", notice: "Ver aviso" }
            : { open: "Open item", tags: "Tags", notice: "View notice" },
        label =
          kind === "open" && item.category === "properties"
            ? state.lang === "es"
              ? "Editar propiedad"
              : "Edit property"
            : labels[kind];
      return `<button class="icon-action" title="${label}" aria-label="${label}: ${esc(item.id)}" ${kind === "tags" ? `data-tags="${item.id}"` : `data-screen="${kind === "open" ? "asset" : "notice"}" data-id="${item.id}"`}>${kind === "open" && item.category === "properties" ? icon("Pencil") : rowActionIcon(kind)}</button>`;
    })
    .join("");
}
function tagLabelsButton(id, compact = false) {
  const labels = assignedTagLabels(id);
  return `<button type="button" class="tag-label-trigger ${compact ? "row-tag-badges" : "auction-tags"}" data-tags="${id}" data-tag-labels="${id}" data-compact="${compact}" aria-label="${t("assignTags")}: ${esc(id)}" aria-haspopup="dialog" aria-controls="tag-picker" title="${esc(labels || t("assignTags"))}" ${canEdit() ? "" : "disabled"}>${(compact ? listTagBadges(id) : tagBadges(id)) || t("noAssignedTags")}</button>`;
}
function openTagPicker(trigger) {
  if (!canEdit()) return;
  const id = trigger.dataset.tags,
    workspace = state.workspace;
  if (!DEMO_LISTINGS.some((item) => item.id === id)) return;
  const picker = document.getElementById("tag-picker");
  const selected = state.tags[workspace + id] || [];
  const choices = orgTags().filter(
    (tag) => !tag.deleted || selected.includes(tag.id),
  );
  picker.innerHTML = `<div class="tag-picker-heading"><strong>${t("organizationTags")}</strong><button type="button" id="tag-picker-close" aria-label="${state.lang === "es" ? "Cerrar" : "Close"}">${icon("X")}</button></div><div class="tag-picker-options">${choices.map((tag) => `<button type="button" class="tag-picker-option" data-picker-tag="${tag.id}" aria-pressed="${selected.includes(tag.id)}"><span class="badge tag-badge tag-${TAG_COLORS.includes(tag.color) ? tag.color : "gray"}">${esc(tag.label)}</span></button>`).join("") || `<p class="muted">${t("noTags")}</p>`}</div><p id="tag-picker-error" class="danger" role="alert"></p>`;
  picker.setAttribute("aria-label", t("assignTags"));
  const bounds = trigger.getBoundingClientRect();
  picker.style.left =
    Math.max(8, Math.min(bounds.left, window.innerWidth - 310)) + "px";
  picker.style.top =
    Math.max(8, Math.min(bounds.bottom + 6, window.innerHeight - 330)) + "px";
  picker.showPopover();
  document.getElementById("tag-picker-close").onclick = () => {
    picker.hidePopover();
    trigger.focus();
  };
  picker.querySelectorAll("[data-picker-tag]").forEach(
    (option) =>
      (option.onclick = () => {
        if (workspace !== state.workspace) {
          picker.hidePopover();
          return;
        }
        const current = state.tags[workspace + id] || [],
          tagId = option.dataset.pickerTag;
        const ids = current.includes(tagId)
          ? current.filter((value) => value !== tagId)
          : [...current, tagId];
        const result = assignOrganizationTags(id, ids);
        if (!result.ok) {
          document.getElementById("tag-picker-error").textContent = t(
            result.error,
          );
          return;
        }
        option.setAttribute("aria-pressed", String(ids.includes(tagId)));
        document.getElementById("tag-picker-error").textContent = "";
        // Refresh only tag labels: unsaved property-form inputs remain intact.
        app.querySelectorAll("[data-tag-labels]").forEach((button) => {
          if (button.dataset.tagLabels !== id) return;
          button.innerHTML =
            button.dataset.compact === "true"
              ? listTagBadges(id)
              : tagBadges(id) || t("noAssignedTags");
          button.title = assignedTagLabels(id) || t("assignTags");
        });
      }),
  );
}
function listTagBadges(assetId) {
  const ids = state.tags[state.workspace + assetId] || [],
    labels = assignedTagLabels(assetId);
  if (!ids.length) return "—";
  return (
    ids
      .slice(0, 2)
      .map((id) => {
        const tag = orgTags().find((x) => x.id === id);
        return tag
          ? `<span class="badge tag-badge tag-${TAG_COLORS.includes(tag.color) ? tag.color : "gray"}" title="${esc(tag.label)}">${esc(tag.label)}</span>`
          : "";
      })
      .join("") +
    (ids.length > 2
      ? `<span class="tag-more" title="${esc(labels)}">+${ids.length - 2}</span>`
      : "")
  );
}
function auctionRoundLabel(item) {
  return `${t("auctionRound")} ${Number.isInteger(item.nextAuctionRound) && item.nextAuctionRound > 0 ? item.nextAuctionRound : t("notReported")}`;
}
function nextAuctionDisplay(item) {
  return `${date(item)} · ${esc(auctionRoundLabel(item))}`;
}
const ROUND_COLUMNS = ["round1", "round2", "round3"];
const ROUND_DETAIL_COLUMNS = ROUND_COLUMNS.flatMap((key) => [
  key + "Time",
  key + "Base",
]);
function roundDetail(item, column) {
  const match = /^round([123])(Time|Base)$/.exec(column);
  const event =
    match &&
    (item.auctionRounds || []).find(
      (event) => event.round === Number(match[1]),
    );
  if (!event) return t("notReported");
  if (match[2] === "Time")
    return event.time ? esc(event.time) : t("notReported");
  const offer = event.baseOffer;
  return offer && offer.amount != null && offer.currency
    ? money(offer)
    : t("notReported");
}
function roundDate(item, column) {
  const event = (item.auctionRounds || []).find(
    (event) => event.round === Number(column.slice(-1)),
  );
  return event?.date ? date({ date: event.date }) : t("notReported");
}
function migrateColumnSelection(value) {
  return Array.isArray(value)
    ? [
        ...new Set(
          value.flatMap((key) =>
            key === "otherRounds" ? ROUND_COLUMNS : [key],
          ),
        ),
      ]
    : value;
}
const COLUMN_KEYS = [
  "tags",
  "registrationNumber",
  "plate",
  "locality",
  "item",
  "reference",
  "type",
  "area",
  "amount",
  "date",
  "round1",
  "round1Time",
  "round1Base",
  "round2",
  "round2Time",
  "round2Base",
  "round3",
  "round3Time",
  "round3Base",
  "actions",
];
const columnPreferenceCache = new Map();
function availableColumns(category = state.filters.category) {
  return COLUMN_KEYS.filter(
    (key) =>
      ((key !== "area" && key !== "registrationNumber") ||
        category === "properties") &&
      (key !== "plate" || category === "vehicles"),
  );
}
function defaultColumns(category = state.filters.category) {
  return availableColumns(category).filter(
    (key) =>
      !ROUND_COLUMNS.includes(key) && !ROUND_DETAIL_COLUMNS.includes(key),
  );
}
function columnPreferenceKey() {
  return `auctions-columns:v1:${encodeURIComponent(state.userId)}:${state.filters.category}`;
}
function validColumnSelection(value) {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    new Set(value).size === value.length &&
    value.every((key) => availableColumns().includes(key)) &&
    value.some((key) => key !== "actions")
  );
}
function visibleColumns() {
  const key = columnPreferenceKey();
  if (!columnPreferenceCache.has(key)) {
    let saved;
    try {
      saved = migrateColumnSelection(JSON.parse(localStorage.getItem(key)));
      const identifier =
        state.filters.category === "properties"
          ? "registrationNumber"
          : state.filters.category === "vehicles"
            ? "plate"
            : null;
      if (
        Array.isArray(saved) &&
        saved.includes("reference") &&
        identifier &&
        !saved.includes(identifier)
      )
        saved.push(identifier);
    } catch (_) {}
    columnPreferenceCache.set(
      key,
      validColumnSelection(saved) ? saved : defaultColumns(),
    );
  }
  return availableColumns().filter((column) =>
    columnPreferenceCache.get(key).includes(column),
  );
}
function saveVisibleColumns(columns) {
  if (!validColumnSelection(columns)) return false;
  const ordered = availableColumns().filter((key) => columns.includes(key));
  columnPreferenceCache.set(columnPreferenceKey(), ordered);
  try {
    localStorage.setItem(columnPreferenceKey(), JSON.stringify(ordered));
  } catch (_) {}
  return true;
}
function columnLabel(key) {
  if (key === "registrationNumber")
    return state.lang === "es" ? "Número de finca" : "Registration number";
  if (key === "plate") return state.lang === "es" ? "Placa" : "Plate";
  if (key === "reference")
    return state.lang === "es" ? "Referencia" : "Reference";
  if (key === "item") return state.lang === "es" ? "Bien" : "Item";
  if (key === "actions")
    return state.lang === "es" ? "Controles del bien" : "Item controls";
  if (key === "tags") return t("organizationTags");
  if (ROUND_COLUMNS.includes(key)) return t(key);
  if (ROUND_DETAIL_COLUMNS.includes(key)) {
    const label = key.endsWith("Time")
      ? state.lang === "es"
        ? "Hora"
        : "Time"
      : state.lang === "es"
        ? "Oferta base"
        : "Base offer";
    return `${t(key.slice(0, 6))} · ${label}`;
  }
  return sortLabel(key);
}
function columnMenu() {
  const selected = visibleColumns();
  return `<details class="column-menu" id="column-menu"><summary>${icon("ColumnsSettings")} ${t("columns")}</summary><div class="column-menu-panel"><fieldset><legend>${t("columns")}</legend>${availableColumns()
    .map(
      (key) =>
        `<label><input type="checkbox" data-column="${key}" ${selected.includes(key) ? "checked" : ""} ${key !== "actions" && selected.includes(key) && selected.filter((value) => value !== "actions").length === 1 ? "disabled" : ""}>${esc(columnLabel(key))}</label>`,
    )
    .join(
      "",
    )}</fieldset><button type="button" id="reset-columns">${t("resetColumns")}</button><p class="muted">${state.lang === "es" ? "Preferencia de usuario · este navegador" : "User preference · this browser"}</p></div></details>`;
}
function itemTable(items) {
  const cols = visibleColumns();
  const label = (key) => (key === "actions" ? "" : columnLabel(key));
  return `<div class="table-scroll" tabindex="0" role="region" aria-label="${state.lang === "es" ? "Listado de remates; desplazamiento horizontal" : "Auction list; horizontal scrolling"}"><table class="items-table single-line-table" style="min-width:${cols.reduce((width, key) => width + ({ registrationNumber: 185, plate: 175, reference: 95, item: 190, locality: 110, type: 90, area: 70, amount: 115, date: 210, tags: 170, actions: 175 }[key] || 145), 0)}px"><thead><tr>${cols
    .map((f) => {
      const rule = state.sort.find((r) => r.field === f),
        idx = state.sort.findIndex((r) => r.field === f);
      return `<th scope="col" class="col-${f}" ${f === "actions" ? `aria-label="${state.lang === "es" ? "Controles del bien" : "Item controls"}"` : ""} ${rule && state.sort.length === 1 ? `aria-sort="${rule.direction === "asc" ? "ascending" : "descending"}"` : ""}>${sortFields.includes(f) ? `<button title="${esc(sortLabel(f))}" data-sort-header="${f}">${label(f)} ${rule ? `${idx + 1} ${rule.direction === "asc" ? "↑" : "↓"}` : ""}</button>` : label(f)}</th>`;
    })
    .join(
      "",
    )}</tr></thead><tbody>${items.map((item) => `<tr class="auction-row">${cols.map((f) => `<td class="col-${f}">${f === "registrationNumber" || f === "plate" ? esc(item[f] || t("notReported")) : f === "reference" ? esc(item.id) : f === "item" ? `<button class="title-link" title="${esc(title(item))}" data-screen="asset" data-id="${item.id}">${esc(title(item))}</button>` : f === "tags" ? `${tagLabelsButton(item.id, true)}` : f === "actions" ? `<div class="row-actions">${itemActionButtons(item)}</div>` : f === "amount" ? money(item) : f === "date" ? nextAuctionDisplay(item) : ROUND_COLUMNS.includes(f) ? roundDate(item, f) : ROUND_DETAIL_COLUMNS.includes(f) ? roundDetail(item, f) : f === "area" ? (item.area ? item.area + " m²" : t("notReported")) : f === "type" ? t(item.type) : `<span title="${esc(item.locality)}">${esc(item.locality)}</span>`}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
}
function bindSort() {
  const change = (rules) => {
    if (setSort(rules)) render();
    else {
      render();
      document.getElementById("sort-error").textContent =
        state.lang === "es"
          ? "Use campos distintos y una sola moneda para ordenar bases."
          : "Use distinct fields and a single currency to sort amounts.";
    }
  };
  app.querySelectorAll("[data-sort-header]").forEach(
    (el) =>
      (el.onclick = () => {
        const old = state.sort.find((r) => r.field === el.dataset.sortHeader);
        change([
          {
            field: el.dataset.sortHeader,
            direction: old?.direction === "asc" ? "desc" : "asc",
          },
        ]);
      }),
  );
  app.querySelectorAll("[data-sort-field],[data-sort-direction]").forEach(
    (el) =>
      (el.onchange = (e) => {
        const rules = JSON.parse(JSON.stringify(state.sort)),
          i = Number(el.dataset.sortField ?? el.dataset.sortDirection);
        rules[i][el.dataset.sortField !== undefined ? "field" : "direction"] =
          e.target.value;
        change(rules);
      }),
  );
  app
    .querySelectorAll("[data-remove-sort]")
    .forEach(
      (el) =>
        (el.onclick = () =>
          change(
            state.sort.filter((r, i) => i !== Number(el.dataset.removeSort)),
          )),
    );
  app.querySelectorAll("[data-add-sort]").forEach(
    (el) =>
      (el.onclick = () => {
        const field = sortFields.find(
          (f) =>
            !state.sort.some((r) => r.field === f) &&
            (f !== "amount" ||
              new Set(filtered().map((a) => a.currency)).size <= 1) &&
            (f !== "area" || state.filters.category === "properties"),
        );
        if (field) change([...state.sort, { field, direction: "asc" }]);
      }),
  );
}

const ITEM_PAGE_SIZES = [5, 10, 25, 50, 100];
// Offline design adapter only. Production requests a bounded page from Spring;
// it must not download all matches or slice a complete catalog in the browser.
function simulateItemPage(page, pageSize, matches = filtered()) {
  if (
    !Number.isInteger(page) ||
    page < 1 ||
    !ITEM_PAGE_SIZES.includes(pageSize)
  )
    return { ok: false, error: "INVALID_PAGINATION" };
  matches = sortedItems(matches);
  const totalItems = matches.length,
    totalPages = Math.ceil(totalItems / pageSize);
  return {
    ok: true,
    items: matches.slice((page - 1) * pageSize, page * pageSize),
    page,
    pageSize,
    totalItems,
    totalPages,
    hasPrevious: totalPages > 0 && page > 1,
    hasNext: page < totalPages,
    snapshotAt: "2026-11-06T12:00:00-06:00",
  };
}
function currentItemPage() {
  state.sort = state.sort.filter(
    (r) =>
      (r.field !== "area" || state.filters.category === "properties") &&
      (r.field !== "amount" ||
        new Set(filtered().map((a) => a.currency)).size <= 1),
  );
  let response = simulateItemPage(state.page, state.pageSize);
  const last = Math.max(1, response.totalPages);
  if (response.ok && state.page > last) {
    state.page = last;
    response = simulateItemPage(state.page, state.pageSize);
  }
  return response;
}
function setItemPage(page) {
  const meta = currentItemPage();
  if (
    !Number.isInteger(page) ||
    page < 1 ||
    page > Math.max(1, meta.totalPages)
  )
    return false;
  state.page = page;
  return true;
}
function setItemPageSize(size) {
  if (!ITEM_PAGE_SIZES.includes(size)) return false;
  state.pageSize = size;
  state.page = 1;
  return true;
}
function itemPagination(meta) {
  const start =
      meta.totalItems && meta.items.length
        ? (meta.page - 1) * meta.pageSize + 1
        : 0,
    end = start ? start + meta.items.length - 1 : 0,
    blocked = state.preview !== "normal";
  return `<nav class="item-pagination" aria-label="${t("pagination")}"><div class="page-size-control"><label for="page-size">${t("pageSize")}</label><select id="page-size" ${state.preview === "loading" ? "disabled" : ""}>${options(
    ITEM_PAGE_SIZES.map((x) => [String(x), String(x)]),
    String(state.pageSize),
  )}</select></div><span class="page-range" role="status">${t("showing")} ${start}–${end} ${t("ofLabel")} ${meta.totalItems}</span><div class="page-navigation"><button data-page-previous ${blocked || !meta.hasPrevious ? "disabled" : ""}>← ${t("previousPage")}</button><span>${meta.totalPages ? t("pageLabel") + " " + meta.page + " " + t("ofLabel") + " " + meta.totalPages : t("noPages")}</span><button data-page-next ${blocked || !meta.hasNext ? "disabled" : ""}>${t("nextPage")} →</button></div></nav>`;
}

function newTerm() {
  return { field: "text", operator: "contains", value: "" };
}
function draftFilter() {
  if (!state.filterDraft) state.filterDraft = cloneFilter(state.filters);
  return state.filterDraft;
}
function termValueControl(term, gi, ti) {
  const attrs = `data-group="${gi}" data-term="${ti}" data-prop="value" id="term-${gi}-${ti}-value"`;
  let values;
  if (term.field === "region") values = regionOptions;
  if (term.field === "type")
    values = CATEGORY_TYPES[draftFilter().category].map((x) => [x, t(x)]);
  if (term.field === "organizationTag")
    values = orgTags().map((x) => [x.id, x.label]);
  if (term.field === "currency")
    values = [
      ["CRC", "CRC"],
      ["USD", "USD"],
    ];
  if (term.field === "quality")
    values = [
      ["reviewed", t("reviewed")],
      ["needs_review", t("needsReview")],
    ];
  if (term.operator === "isUnknown") return "";
  if (values)
    return `<label for="term-${gi}-${ti}-value">${t("value")}</label><select ${attrs}>${options([["", "—"], ...values], term.value)}</select>`;
  if (term.field === "base")
    return `<label for="term-${gi}-${ti}-value">${t("value")}</label><input ${attrs} type="number" min="0" step="0.01" value="${esc(term.value?.amount || "")}"><label for="term-${gi}-${ti}-currency">${t("currency")}</label><select id="term-${gi}-${ti}-currency" data-group="${gi}" data-term="${ti}" data-prop="moneyCurrency">${options(
      [
        ["CRC", "CRC"],
        ["USD", "USD"],
      ],
      term.value?.currency || "CRC",
    )}</select>`;
  return `<label for="term-${gi}-${ti}-value">${t("value")}</label><input ${attrs} ${term.field === "area" ? 'type="number" min="0" step="0.0001"' : 'maxlength="200"'} value="${esc(term.value || "")}">`;
}
function filterPanel() {
  const f = draftFilter();
  return `<section class="filter editor-panel" aria-label="${t("filters")}"><form id="filter-form" novalidate><h3>${t("filters")} <button type="button" class="ghost" data-action="reset">${t("clear")}</button></h3><p class="filter-help">${t("expressionHelp")}</p><label for="groups-operator">${t("combineGroups")}</label><select id="groups-operator">${options(
    [
      ["AND", t("allAnd")],
      ["OR", t("anyOr")],
    ],
    f.expression.operator,
  )}</select>${!f.expression.groups.length ? `<p class="filter-help">${t("noGroups")}</p>` : ""}${f.expression.groups
    .map(
      (g, gi) =>
        `<fieldset class="expression-group"><legend>${t("group")} ${gi + 1}</legend><label for="group-${gi}-operator">${t("combineTerms")}</label><select id="group-${gi}-operator" data-group-op="${gi}">${options(
          [
            ["AND", t("allAnd")],
            ["OR", t("anyOr")],
          ],
          g.operator,
        )}</select>${g.terms
          .map(
            (term, ti) =>
              `<div class="expression-term"><div class="term-heading"><strong>${t("term")} ${ti + 1}</strong><button type="button" class="ghost danger" data-remove-term="${gi}:${ti}" aria-label="${t("removeTerm")} ${gi + 1}.${ti + 1}">×</button></div><label for="term-${gi}-${ti}-field">${t("field")}</label><select id="term-${gi}-${ti}-field" data-group="${gi}" data-term="${ti}" data-prop="field">${options(
                Object.keys(fieldDefinitions(f.category)).map((x) => [
                  x,
                  fieldLabel(x),
                ]),
                term.field,
              )}</select><label for="term-${gi}-${ti}-operator">${t("comparison")}</label><select id="term-${gi}-${ti}-operator" data-group="${gi}" data-term="${ti}" data-prop="operator">${options(
                fieldDefinitions(f.category)[term.field].map((x) => [x, t(x)]),
                term.operator,
              )}</select>${termValueControl(term, gi, ti)}</div>`,
          )
          .join(
            "",
          )}<button type="button" class="full" data-add-term="${gi}" ${g.terms.length >= 20 || f.expression.groups.reduce((n, x) => n + x.terms.length, 0) >= 100 ? "disabled" : ""}>${icon("Plus")} ${t("addTerm")}</button><button type="button" class="ghost danger full" data-remove-group="${gi}">${t("removeGroup")}</button></fieldset>`,
    )
    .join(
      "",
    )}<button type="button" class="full" data-add-group ${f.expression.groups.length >= 10 || f.expression.groups.reduce((n, x) => n + x.terms.length, 0) >= 100 ? "disabled" : ""}>${icon("Plus")} ${t("addGroup")}</button><p id="filter-error" role="alert" class="danger filter-help"></p><button type="submit" class="primary full">${t("applyReturn")}</button><p class="filter-help"><strong>${t("draftSummary")}</strong><br><span id="draft-summary">${esc(summary(f))}</span></p></form></section>`;
}
function bindFilterBuilder() {
  const form = document.getElementById("filter-form");
  if (!form) return;
  const updateDraftSummary = () => {
    document.getElementById("draft-summary").textContent =
      summary(draftFilter());
  };
  document.getElementById("groups-operator").onchange = (e) => {
    draftFilter().expression.operator = e.target.value;
    updateDraftSummary();
  };
  app.querySelectorAll("[data-group-op]").forEach(
    (el) =>
      (el.onchange = (e) => {
        draftFilter().expression.groups[Number(el.dataset.groupOp)].operator =
          e.target.value;
        updateDraftSummary();
      }),
  );
  app.querySelectorAll("[data-prop]").forEach((el) => {
    const change = (e) => {
      const term =
          draftFilter().expression.groups[Number(el.dataset.group)].terms[
            Number(el.dataset.term)
          ],
        prop = el.dataset.prop;
      if (prop === "field") {
        term.field = e.target.value;
        term.operator = fieldDefinitions(draftFilter().category)[term.field][0];
        term.value =
          term.field === "base" ? { amount: "", currency: "CRC" } : "";
        render();
      } else if (prop === "operator") {
        term.operator = e.target.value;
        if (term.operator === "isUnknown") delete term.value;
        else if (term.value === undefined)
          term.value =
            term.field === "base" ? { amount: "", currency: "CRC" } : "";
        render();
      } else if (prop === "moneyCurrency") term.value.currency = e.target.value;
      else if (term.field === "base") term.value.amount = e.target.value;
      else term.value = e.target.value;
      updateDraftSummary();
    };
    if (el.tagName === "INPUT") el.oninput = change;
    else el.onchange = change;
  });
  app.querySelectorAll("[data-add-group]").forEach(
    (el) =>
      (el.onclick = () => {
        if (
          draftFilter().expression.groups.length < 10 &&
          draftFilter().expression.groups.reduce(
            (n, x) => n + x.terms.length,
            0,
          ) < 100
        )
          draftFilter().expression.groups.push({
            operator: "AND",
            terms: [newTerm()],
          });
        render();
      }),
  );
  app.querySelectorAll("[data-add-term]").forEach(
    (el) =>
      (el.onclick = () => {
        const f = draftFilter(),
          g = f.expression.groups[Number(el.dataset.addTerm)];
        if (
          g.terms.length < 20 &&
          f.expression.groups.reduce((n, x) => n + x.terms.length, 0) < 100
        )
          g.terms.push(newTerm());
        render();
      }),
  );
  app.querySelectorAll("[data-remove-term]").forEach(
    (el) =>
      (el.onclick = () => {
        const [gi, ti] = el.dataset.removeTerm.split(":").map(Number);
        draftFilter().expression.groups[gi].terms.splice(ti, 1);
        render();
      }),
  );
  app.querySelectorAll("[data-remove-group]").forEach(
    (el) =>
      (el.onclick = () => {
        draftFilter().expression.groups.splice(
          Number(el.dataset.removeGroup),
          1,
        );
        render();
      }),
  );
  form.onsubmit = (e) => {
    e.preventDefault();
    if (!validateFilter(draftFilter())) {
      document.getElementById("filter-error").textContent =
        t("invalidExpression");
      return;
    }
    applyFilterEditor();
  };
}

function openFilterEditor() {
  state.filterReturn = { workspace: state.workspace, role: state.role };
  state.filterDraft = cloneFilter(state.filters);
  navigate("filters");
}
function cancelFilterEditor() {
  if (state.filterReturn && canUseSearchContext(state.filterReturn.workspace)) {
    state.workspace = state.filterReturn.workspace;
    state.role = state.roles[state.workspace];
  }
  state.filterDraft = null;
  state.filterReturn = null;
  navigate("discover");
}
function applyFilterEditor() {
  if (!validateFilter(draftFilter()))
    return { ok: false, error: "invalidExpression" };
  if (state.filters.category !== draftFilter().category) state.view = "list";
  state.filters = canonicalFilter(draftFilter());
  state.page = 1;
  state.filterDraft = null;
  state.filterReturn = null;
  state.preview = "normal";
  navigate("discover");
  return { ok: true };
}
function retrieveOwnedFilter(id) {
  const item = ownedSearch(id);
  if (
    !item ||
    !canEdit() ||
    !canUseSearchContext(item.contextWorkspace) ||
    !validateFilter(item.filter, item.contextWorkspace)
  )
    return { ok: false, error: "retrieveDenied" };
  if (!state.filterReturn)
    state.filterReturn = { workspace: state.workspace, role: state.role };
  state.workspace = item.contextWorkspace;
  state.role = state.roles[state.workspace];
  state.filterDraft = cloneFilter(item.filter);
  state.screen = "filters";
  return { ok: true };
}
function filterEditor() {
  const draft = draftFilter(),
    saved = state.searches.filter((x) => x.ownerUserId === state.userId);
  return (
    heading(
      "filterView",
      "filterViewHelp",
      `<button class="ghost" data-action="cancel-filters">← ${t("cancelFilters")}</button><button data-action="save-search" ${canEdit() ? "" : "disabled"}>${icon("Plus")} ${t("saveSearch")}</button>`,
    ) +
    `<div class="editor-context"><span class="badge neutral">${t("draftCategory")}: ${t(draft.category)}</span><span>${esc(organizationName())}</span><span>${t("draftOnly")}</span></div><div class="filter-editor"><div>${filterPanel()}</div><aside class="panel saved-filter-panel"><h2>${t("savedFiltersPanel")}</h2><p class="filter-help">${t("saveDraftHelp")}</p><p class="filter-help">${t("contextLoadHelp")}</p>${!saved.length ? `<p class="muted">${t("noSavedFilters")}</p>` : saved.map((item) => `<article class="saved-filter-card"><h3>${esc(item.title)}</h3><p class="filter-help">${esc(canUseSearchContext(item.contextWorkspace) ? state.organizationNames[item.contextWorkspace] || t(item.contextWorkspace) : t("contextUnavailable"))} · ${t(item.filter.category)}</p><p class="filter-help">${esc(summary(item.filter, item.contextWorkspace))}</p><button data-retrieve-filter="${item.id}" ${canEdit() && canUseSearchContext(item.contextWorkspace) ? "" : "disabled"}>${t("retrieveFilter")}</button></article>`).join("")}</aside></div>`
  );
}
function empty(titleKey, bodyKey, action = "discover") {
  return `<div class="empty"><div class="big">⌕</div><h2>${t(titleKey)}</h2><p>${t(bodyKey)}</p><button class="primary" ${action === "filters" ? 'data-action="open-filters"' : action === "reset" ? 'data-action="reset"' : `data-screen="${action}"`}>${t(action === "filters" ? "openFilters" : action === "reset" ? "reset" : "start")}</button></div>`;
}
function mapView(items) {
  const mapped = items.filter((a) => a.mapped);
  const select = mapped.find((x) => x.id === state.mapSelected) || mapped[0];
  const pins = [
    [28, 39],
    [57, 30],
    [63, 59],
    [39, 69],
    [79, 40],
  ];
  return `<div class="map-layout"><div class="map" aria-label="${t("mapConcept")}"><svg viewBox="0 0 800 500" preserveAspectRatio="none" aria-hidden="true"><rect width="800" height="500" fill="#e8eddf"/><path d="M0 30L170 0L250 180L100 250L0 190ZM500 0L800 0V180L640 210ZM370 310L560 270L680 500H300Z" fill="#d7e2cd"/><path d="M0 395Q180 290 330 340T800 290" fill="none" stroke="#b9d5d6" stroke-width="27"/><g fill="none" stroke="#fffdf2" stroke-width="16"><path d="M-20 220L840 100M120 -20L650 540M-20 40L820 470M-20 440L820 220M390 -10L250 510M680 -20L480 520"/></g><g fill="none" stroke="#d1cbb8" stroke-width="2"><path d="M-20 220L840 100M120 -20L650 540M-20 40L820 470M-20 440L820 220M390 -10L250 510M680 -20L480 520"/></g></svg><div class="map-label"><span><strong>${t("mapConcept")}</strong><br>${t("mapWarning")}</span><span>${items.length - mapped.length} ${t("withoutMap")}</span></div>${mapped.map((a, i) => `<button data-pin="${a.id}" class="pin ${select?.id === a.id ? "active" : ""}" style="left:${pins[i][0]}%;top:${pins[i][1]}%" aria-label="${esc(title(a))} · ${money(a)}" aria-pressed="${select?.id === a.id}">${money(a)}</button>`).join("")}<div class="map-footer">${t("approximate")} · ${t("remaining")}</div></div>${select ? `<div class="map-selection"><div><span class="badge neutral">${t("approximate")}</span><h3 style="margin-top:12px">${esc(title(select))}</h3><span class="muted">${select.locality} · ${money(select)}</span></div><button class="primary" data-screen="asset" data-id="${select.id}">${t("openAsset")} →</button></div>` : ""}</div>`;
}
function discovery() {
  const page = currentItemPage(),
    items = state.view === "map" ? filtered() : page.items,
    total = page.totalItems,
    displayPage =
      state.preview === "empty"
        ? {
            ...page,
            items: [],
            totalItems: 0,
            totalPages: 0,
            hasPrevious: false,
            hasNext: false,
          }
        : page;
  return (
    heading(
      state.filters.category,
      "listingIntro",
      `<span class="badge neutral country-context">${esc(state.lang === "es" ? INSTANCE_CONFIG.nameEs : INSTANCE_CONFIG.nameEn)} · ${INSTANCE_CONFIG.country}</span><button data-action="open-filters">${icon("SlidersHorizontal")} ${t("openFilters")}</button>`,
    ) +
    `<div class="listing-content"><section aria-label="${t("results")}"><div class="results-top"><div class="result-count" aria-live="polite">${state.preview === "empty" ? 0 : total} ${t((state.preview === "empty" ? 0 : total) === 1 ? "result" : "results")}</div><div class="view-switch"><button data-view="list" class="${state.view === "list" ? "active" : ""}" aria-pressed="${state.view === "list"}">${icon("List")} ${t("list")}</button><button data-view="map" class="${state.view === "map" ? "active" : ""}" aria-pressed="${state.view === "map"}">${icon("MapPin")} ${t("map")}</button></div></div>${state.view === "list" ? sortControls() + itemPagination(displayPage) : ""}${state.filters.expression.groups.length ? `<div class="applied-expression" role="status"><strong>${t("expressionPreview")}</strong><p>${esc(summary(state.filters))}</p></div>` : ""}${state.preview === "error" ? `<div class="notice" role="alert">${t("sourceError")}</div>` : ""}${state.preview === "loading" ? `<p role="status" class="muted">${t("loading")}</p><div class="grid" aria-hidden="true"><div class="skeleton"></div><div class="skeleton"></div></div>` : state.preview === "empty" || !items.length ? empty("empty", "emptyBody", "filters") : state.view === "map" ? mapView(items) : `${itemTable(items)}`}</section></div>`
  );
}
function overview() {
  return (
    heading("welcome", "overviewSub") +
    `<div class="feature"><div><h2>${t("featureTitle")}</h2><p>${t("featureBody")}</p></div><button data-screen="discover">${t("start")} →</button></div><div class="kpis">${[
      [taggedAssetCount(), "taggedCount"],
      [
        state.searches.filter(
          (x) =>
            x.ownerUserId === state.userId &&
            x.enabled &&
            canUseSearchContext(x.contextWorkspace),
        ).length,
        "activeSearches",
      ],
      [DEMO_LISTINGS.length, "catalog"],
    ]
      .map(
        ([n, k]) =>
          `<div class="kpi"><span>${t(k)}</span><strong>${n.toString().padStart(2, "0")}</strong><span>${t("proposal")}</span></div>`,
      )
      .join(
        "",
      )}</div><div class="section-title"><h2>${t("recent")}</h2><button class="ghost" data-screen="discover">${t("discover")} →</button></div><div class="auction-list">${DEMO_LISTINGS.slice(0, 2).map(card).join("")}</div>`
  );
}
function savePropertyResearch(id, workspace, input) {
  if (workspace !== state.workspace || !canEdit())
    return { ok: false, error: "permissionDenied" };
  const item = DEMO_LISTINGS.find(
    (item) => item.id === id && item.category === "properties",
  );
  if (!item || typeof input.notes !== "string" || input.notes.length > 10000)
    return { ok: false, error: "invalidResearch" };
  const amount = String(input.appraisalAmount ?? "").trim(),
    currency = input.appraisalCurrency;
  if (
    amount &&
    (!/^(0|[1-9][0-9]{0,13})(\.[0-9]{1,2})?$/.test(amount) ||
      !["CRC", "USD"].includes(currency))
  )
    return { ok: false, error: "invalidResearch" };
  state.notes[workspace + id] = input.notes;
  state.propertyResearch[workspace + id] = {
    appraisal: amount
      ? {
          amount:
            amount.split(".")[0] +
            "." +
            (amount.split(".")[1] || "").padEnd(2, "0"),
          currency,
        }
      : null,
  };
  return { ok: true };
}
function propertyResearchForm(item) {
  if (item.category !== "properties" || !canEdit()) return "";
  const es = state.lang === "es",
    L = (en, spanish) => (es ? spanish : en);
  const data = state.propertyResearch[state.workspace + item.id] || {};
  return `<form class="panel" id="property-research-form" data-workspace="${state.workspace}" data-id="${item.id}"><h2>${L("Additional information", "Información adicional")}</h2><label for="property-notes">${L("Notes", "Notas")}</label><textarea id="property-notes" maxlength="10000" rows="6">${esc(state.notes[state.workspace + item.id] || "")}</textarea><div class="two" style="margin-top:20px"><div><label for="property-appraisal">${L("Appraisal amount", "Monto del avalúo")}</label><input id="property-appraisal" type="text" inputmode="decimal" value="${esc(data.appraisal?.amount || "")}" placeholder="0.00"></div><div><label for="property-appraisal-currency">${L("Currency", "Moneda")}</label><select id="property-appraisal-currency">${options(
    [
      ["CRC", "CRC"],
      ["USD", "USD"],
    ],
    data.appraisal?.currency || item.currency,
  )}</select></div></div><p id="property-research-error" class="danger" role="alert"></p><div class="actions" style="margin-top:20px"><button class="primary">${icon("Save")} ${t("save")}</button><button type="button" data-reset-property-research>${L("Cancel", "Cancelar")}</button></div></form>`;
}
function bindPropertyResearch() {
  app
    .querySelectorAll("[data-reset-property-research]")
    .forEach((button) => (button.onclick = () => render()));
  const form = document.getElementById("property-research-form");
  if (!form) return;
  form.onsubmit = (event) => {
    event.preventDefault();
    const result = savePropertyResearch(
      form.dataset.id,
      form.dataset.workspace,
      {
        notes: document.getElementById("property-notes").value,
        appraisalAmount: document.getElementById("property-appraisal").value,
        appraisalCurrency: document.getElementById(
          "property-appraisal-currency",
        ).value,
      },
    );
    if (!result.ok) {
      document.getElementById("property-research-error").textContent =
        result.error === "permissionDenied"
          ? t(result.error)
          : state.lang === "es"
            ? "Verifica las notas y el monto: usa un valor no negativo con hasta dos decimales."
            : "Check the notes and amount: use a non-negative value with up to two decimal places.";
      return;
    }
    render();
    toast(state.lang === "es" ? "Cambios guardados" : "Changes saved");
  };
}
const ITEM_TABS = [
  "overview",
  "auction",
  "registry-info",
  "notice",
  "public-registry",
  "location",
  "images",
];
function availableItemTabs() {
  return ITEM_TABS.filter(
    (tab) => tab !== "location" || current().category === "properties",
  );
}
function itemTabLabel(tab) {
  return (
    state.lang === "es"
      ? {
          overview: "Información general",
          auction: "Remate",
          "registry-info": "Información registral",
          notice: "Aviso",
          "public-registry": "Registro",
          location: "Ubicación",
          images: "Imágenes",
        }
      : {
          overview: "General info",
          auction: "Auction",
          "registry-info": "Registry info",
          notice: "Notice",
          "public-registry": "Registry",
          location: "Location",
          images: "Images",
        }
  )[tab];
}
function calculateRoundCost(event, rule) {
  if(!rule?.verified || !["notice","countryRule"].includes(rule.source) || !rule.reference || !rule.currency)return null;
  const parse=value=>typeof value==="string"&&/^(0|[1-9]\d{0,13})(\.\d{1,2})?$/.test(value)?BigInt(value.split(".")[0])*100n+BigInt((value.split(".")[1]||"").padEnd(2,"0")):null;
  let minor;
  if(rule.kind==="fixed")minor=parse(rule.amount);
  else if(rule.kind==="percentOfBase"&&rule.rounding==="halfUp"&&Number.isInteger(rule.basisPoints)&&rule.basisPoints>=0&&rule.basisPoints<=10000&&event.baseOffer?.currency===rule.currency){
    const base=parse(event.baseOffer.amount);if(base===null)return null;
    minor=(base*BigInt(rule.basisPoints)+5000n)/10000n;
  } else return null;
  return minor===null?null:{amount:String(minor/100n)+"."+String(minor%100n).padStart(2,"0"),currency:rule.currency,source:rule.source,reference:rule.reference};
}
function roundCostCell(item,event,key) {
  const result=calculateRoundCost(event,item.roundCostRules?.[key]);
  if(!result)return `<span class="muted">${state.lang==="es"?"No disponible":"Not available"}</span>`;
  const source=state.lang==="es"?(result.source==="notice"?"Calculado según aviso":"Calculado según regla del país"):(result.source==="notice"?"Calculated from notice":"Calculated from country rule");
  return `<span title="${esc(source+": "+result.reference)}">${esc(result.currency)} ${new Intl.NumberFormat(state.lang==="es"?"es-CR":"en-US",{minimumFractionDigits:2,maximumFractionDigits:2}).format(Number(result.amount))}</span>`;
}
function auctionPanel(item) {
  const es = state.lang === "es",
    L = (en, spanish) => (es ? spanish : en);
  const related = item.auctionId
    ? DEMO_LISTINGS.filter(
        (other) => other.auctionId === item.auctionId && other.id !== item.id,
      )
    : [];
  const lotMembers = item.lotId
    ? related.filter((other) => other.lotId === item.lotId)
    : [];
  const itemLinks = (items) =>
    items.length
      ? `<ul class="auction-related-items">${items.map((other) => `<li><button class="title-link" data-screen="asset" data-id="${other.id}">${esc(other.registrationNumber || other.plate || other.id)} · ${esc(title(other))} ${icon("ArrowRight")}</button></li>`).join("")}</ul>`
      : `<p class="muted">${L("No other linked items.", "No hay otros bienes vinculados.")}</p>`;
  return `<div class="panel"><h2>${L("Auction", "Remate")}</h2><dl class="fact-grid"><div><dt>${L("Auction reference", "Referencia del remate")}</dt><dd>${esc(item.auctionId || t("notReported"))}</dd></div><div><dt>${L("Sale format", "Modalidad de venta")}</dt><dd>${item.saleMode === "lot" ? L("Part of a lot — sold together", "Parte de un lote — venta conjunta") : item.saleMode === "individual" ? L("Sold as one item", "Venta individual") : t("notReported")}</dd></div>${item.lotId ? `<div><dt>${L("Lot reference", "Referencia del lote")}</dt><dd>${esc(item.lotId)}</dd></div>` : ""}</dl></div><section class="panel"><h2>${L("Rounds", "Rondas")}</h2><p class="muted">${item.saleMode === "lot" ? L("Base offers apply to the whole lot.", "Las ofertas base corresponden al lote completo.") : L("Base offers apply to this item.", "Las ofertas base corresponden a este bien.")}</p><div class="table-scroll" tabindex="0" role="region" aria-label="${L("Auction rounds", "Rondas del remate")}"><table class="items-table single-line-table" data-grid-key="auction-rounds"><thead><tr><th>${L("Round", "Ronda")}</th><th>${L("Date", "Fecha")}</th><th>${L("Time", "Hora")}</th><th>${L("Base offer", "Oferta base")}</th><th>${L("Participation Guarantee", "Garantía de participación")}</th><th>${L("Participation fee", "Cuota de participación")}</th></tr></thead><tbody>${(item.auctionRounds || []).map((event) => `<tr><td>${esc(event.round)}${event.round === item.nextAuctionRound ? ` · ${t("nextEvent")}` : ""}</td><td>${event.date ? date({ date: event.date }) : t("notReported")}</td><td>${esc(event.time || t("notReported"))}</td><td>${event.baseOffer ? money(event.baseOffer) : t("notReported")}</td><td>${roundCostCell(item,event,"guarantee")}</td><td>${roundCostCell(item,event,"participationFee")}</td></tr>`).join("") || `<tr><td colspan="6">${t("notReported")}</td></tr>`}</tbody></table></div><p class="muted" style="margin-top:12px">${t("timezone")}</p></section>${item.lotId ? `<section class="panel"><h2>${L("Other items in this lot", "Otros bienes de este lote")}</h2>${itemLinks(lotMembers)}</section>` : ""}<section class="panel"><h2>${L("Other items in this auction", "Otros bienes de este remate")}</h2>${itemLinks(related)}</section>`;
}
function asset() {
  const a = current();
  if (!availableItemTabs().includes(state.itemTab)) state.itemTab = "overview";
  const overview = `<div class="panel"><h2>${t("assetInfo")}</h2><dl class="fact-grid">${[
    ["reference", a.registrationNumber || a.plate || a.id],
    ["auctionType", t(a.type)],
    ...(a.category === "properties"
      ? [
          ["area", a.area ? a.area + " m²" : t("notReported")],
          ["location", a.locality],
        ]
      : []),
    ["quality", t(a.quality === "reviewed" ? "reviewed" : "needsReview")],
  ]
    .map(
      ([key, value]) => `<div><dt>${t(key)}</dt><dd>${esc(value)}</dd></div>`,
    )
    .join(
      "",
    )}</dl></div>${propertyResearchForm(a)}<div class="panel"><h2>${t("organizationResearch")}</h2>${tagLabelsButton(a.id)}${a.category === "properties" && canEdit() ? "" : `<p class="muted">${esc(state.notes[state.workspace + a.id] || t("noNotes"))}</p>`}</div>`;
  const es = state.lang === "es";
  const registryPanel = `<div class="panel"><h2>${itemTabLabel("registry-info")}</h2><dl class="fact-grid"><div><dt>${a.category === "vehicles" ? (es ? "Placa" : "Plate") : es ? "Número de finca" : "Registration number"}</dt><dd>${esc(a.registrationNumber || a.plate || t("notReported"))}</dd></div></dl><p class="muted">${es ? "No hay más datos registrales disponibles en este ejemplo." : "No additional registry information is available in this example."}</p></div>`;
  const publicRegistryPanel = `<div class="panel"><h2>${itemTabLabel("public-registry")}</h2><p class="muted">${es ? "La consulta del registro público aún no está conectada. No se muestran resultados oficiales." : "Public registry lookup is not connected yet. No official results are displayed."}</p></div>`;
  const noticePanel = `<article class="panel"><h2>${itemTabLabel("notice")}</h2><p class="muted">${t("originalLink")}</p><div class="notice-text" lang="es">${esc(noticeText(a))}</div></article>`;
  const locationPanel = `<div class="panel"><h2>${itemTabLabel("location")}</h2><p>${esc(a.locality)}</p></div>${a.mapped ? mapView([a]) : `<div class="notice">${es ? "No hay coordenadas disponibles para este bien." : "Coordinates are not available for this item."}</div>`}`;
  const images = state.images[state.workspace + a.id] || [];
  const imagePanel = `<div class="panel"><h2>${t("imagesTitle")}</h2><p class="muted">${t("imagesHelp")}</p><div class="notice">${t("imageLocalOnly")}</div><form id="image-upload-form"><label for="auction-image-files">${t("imageFiles")}</label><input id="auction-image-files" name="images" type="file" accept="image/jpeg,image/png,image/webp" multiple ${canEdit() ? "" : "disabled"}><p class="muted" style="margin-top:10px">${t("imageLimits")}</p><p id="image-error" role="alert" class="danger"></p><button class="primary" ${canEdit() ? "" : "disabled"}>${t("attachImages")}</button></form></div>${images.length ? `<div class="media-grid">${images.map((img) => `<figure class="panel"><img src="${esc(img.url)}" alt="${esc(img.name)}"><figcaption><strong>${esc(img.name)}</strong><p class="muted">${t("uploadedBy")}: ${esc(img.uploaderId)}</p></figcaption></figure>`).join("")}</div>` : `<div class="empty"><h2>${t("imagesEmpty")}</h2><p>${t("imagesEmptyHelp")}</p></div>`}`;
  return (
    `<div class="breadcrumb"><button class="ghost" data-screen="discover">← ${t("back")}</button><span>/ ${a.id}</span></div>` +
    heading("assetInfo", "fiction", ``) +
    `<h2 style="font-size:25px;margin-bottom:20px">${esc(title(a))}</h2><div class="item-tabs" role="tablist" aria-label="${t("assetInfo")}">${availableItemTabs()
      .map(
        (tab) =>
          `<button id="item-tab-${tab}" role="tab" aria-selected="${state.itemTab === tab}" aria-controls="item-tab-panel" data-item-tab="${tab}" tabindex="${state.itemTab === tab ? 0 : -1}">${itemTabLabel(tab)}${tab === "images" ? " (" + images.length + ")" : ""}</button>`,
      )
      .join(
        "",
      )}</div><section id="item-tab-panel" role="tabpanel" aria-labelledby="item-tab-${state.itemTab}">${{ overview, auction: auctionPanel(a), "registry-info": registryPanel, notice: noticePanel, "public-registry": publicRegistryPanel, location: locationPanel, images: imagePanel }[state.itemTab] || overview}</section>`
  );
}
function noticeText(a) {
  a = ORIGINAL_LISTINGS.find((x) => x.id === a.id) || a;
  return `AVISO SINTÉTICO DE DEMOSTRACIÓN\n\nReferencia ficticia ${a.id}. En un juzgado de ejemplo, se anuncia únicamente para fines de diseño un bien de tipo ${COPY.es[a.type].toLowerCase()}, ubicado de forma ilustrativa en ${a.locality}.\n\nLa base de ejemplo es ${a.currency} ${a.amount}. La fecha ficticia de primera subasta es ${a.date}, a las ${a.time}, hora de Costa Rica. ${a.category === "properties" ? (a.area ? "El área de ejemplo es " + a.area + " metros cuadrados." : "La superficie no consta en este ejemplo.") : "No se han aportado atributos adicionales en esta demostración."}\n\nNo se identifica una finca real, un expediente real ni personas reales. Este texto no produce efectos jurídicos, no acredita condiciones de un bien y no constituye una convocatoria a remate.${a.roundCostRules?"\n\nCláusula de prueba ficticia DEMO-NOTICE-TERMS-A07: para cada ronda del lote, garantía del 10% de la base con redondeo al centavo más cercano (mitades hacia arriba); cuota de participación de CRC 5000.00 por ronda. Solo para demostrar cálculos, no corresponde a una norma ni a un remate real.":""}\n\nFIN DEL TEXTO SINTÉTICO.`;
}
function notice() {
  const a = current();
  return (
    `<div class="breadcrumb"><button class="ghost" data-screen="asset" data-id="${a.id}">← ${esc(title(a))}</button><span>/ ${t("source")}</span></div>` +
    heading(
      "sourceTitle",
      "original",
      `<span class="badge neutral">${t("revision")} ${state.revision}</span>`,
    ) +
    `<div class="notice">${t("originalLink")}</div><div class="detail-columns"><article class="panel"><div class="eyebrow">DEMO-NOTICE-${a.id.slice(-2)} · ES</div><h2>${t("sourceTitle")}</h2><p class="muted">${t("raw")}</p><div class="notice-text" lang="es">${esc(noticeText(a)).replace(esc(a.currency + " " + a.amount), `<mark>${esc(a.currency + " " + a.amount)}</mark>`)}</div></article><aside><div class="panel"><h2>${t("extract")}</h2>${[["base", money(a)], ["nextEvent", date(a) + " · " + a.time], ...(a.category === "properties" ? [["area", a.area ? a.area + " m²" : t("notReported")]] : []), ["location", a.locality]].map(([k, v]) => `<div class="evidence-row"><small>${t(k)}</small><strong>${esc(v)}</strong><p>${t("raw")}</p></div>`).join("")}</div><div class="notice">${t("sourceCaution")}</div></aside></div>`
  );
}
function summary(f, context = state.workspace) {
  const termText = (term) => {
    const v = term.value;
    if (term.field === "organizationTag")
      return canUseSearchContext(context)
        ? fieldLabel(term.field) +
            " " +
            (state.tagDefinitions[context]?.find((x) => x.id === v)?.label ||
              t("contextUnavailable"))
        : t("contextUnavailable");
    let value =
      term.field === "base"
        ? v?.currency + " " + v?.amount
        : term.field === "region"
          ? regionOptions.find((x) => x[0] === v)?.[1] || v
          : term.field === "type"
            ? t(v)
            : term.field === "quality"
              ? t(v === "reviewed" ? "reviewed" : "needsReview")
              : String(v ?? "");
    return (
      fieldLabel(term.field) +
      " " +
      t(term.operator) +
      (term.operator === "isUnknown" ? "" : " " + value)
    );
  };
  return (
    t(f.category) +
    " · " +
    (!f.expression.groups.length
      ? t("noGroups")
      : f.expression.groups
          .map(
            (g) =>
              "(" + g.terms.map(termText).join(" " + g.operator + " ") + ")",
          )
          .join(" " + f.expression.operator + " "))
  );
}
function alerts() {
  const searches = state.searches.filter((x) => x.ownerUserId === state.userId);
  return (
    heading(
      "alertsTitle",
      "alertsSub",
      `<button class="primary" data-action="open-filters">${t("manageFilters")}</button>`,
    ) +
    `<div class="notice">${t("noEmail")}</div>` +
    (!searches.length
      ? empty("emptyAlerts", "emptyAlertsBody")
      : `<div class="panel">${searches.map((s) => `<div class="list-row"><div><span class="badge ${s.enabled ? "" : "neutral"}">${t(s.enabled && canUseSearchContext(s.contextWorkspace) ? "active" : "paused")}</span><h3 style="margin-top:10px">${esc(s.title)}</h3><p>${esc(summary(s.filter, s.contextWorkspace))}</p><p style="margin-top:6px">${t("daily")}</p><p>${t("ownerOnlySearch")} · ${t("searchContext")}: ${esc(canUseSearchContext(s.contextWorkspace) ? state.organizationNames[s.contextWorkspace] || t(s.contextWorkspace) : t("contextUnavailable"))}</p></div><div class="actions"><button data-toggle-search="${s.id}" ${canEdit() ? "" : "disabled"}>${t(s.enabled ? "pause" : "resume")}</button><button data-delete-search="${s.id}" class="danger" ${canEdit() ? "" : "disabled"}>${t("delete")}</button></div></div>`).join("")}</div>`)
  );
}
function team() {
  return (
    heading(
      "teamTitle",
      "teamSub",
      `<button data-screen="settings">${t("settings")}</button><button class="primary" data-action="invite" ${canAdmin() ? "" : "disabled"}>${icon("Plus")} ${t("invite")}</button>`,
    ) +
    `<div class="notice">${t("proposal")} · ${t("inviteBoundary")}</div><div class="panel"><h2>${esc(organizationName())}</h2>${(state.workspace ===
    "solo"
      ? [["DE", "Persona demo 01", "persona01@example.invalid", "ADMIN"]]
      : [
          ["DE", "Persona demo 01", "persona01@example.invalid", "ADMIN"],
          ["AN", "Persona demo 02", "persona02@example.invalid", "MANAGER"],
          ["LE", "Persona demo 03", "persona03@example.invalid", "USER"],
        ]
    )
      .map(
        ([i, n, e, r]) =>
          `<div class="member"><div class="avatar">${i}</div><div><strong>${n}</strong><small>${e}</small></div><span class="badge neutral">${t(r)}</span><button class="ghost" data-action="role-boundary" ${state.role === "ADMIN" ? "" : "disabled"}>${t("change")}</button></div>`,
      )
      .join("")}</div>`
  );
}
function plans() {
  return (
    heading("planTitle", "planSub") +
    `<div class="plans">${[
      ["explore", ["publicCatalog", "searchMaps", "sourceLinks"]],
      ["researchPlan", ["publicCatalog", "organizationTags", "savedSearches"]],
      ["teamPlan", ["sharedSpace", "roles", "orgBilling"]],
    ]
      .map(
        ([name, features], i) =>
          `<section class="plan ${i === 1 ? "recommended" : ""}"><div class="eyebrow">${t("proposal")}</div><h3>${t(name)}</h3><div class="pricing">${t("pricePending")}</div><p class="muted">${t("noCharge")}</p><ul>${features.map((f) => `<li>${t(f)}</li>`).join("")}</ul><button class="${i === 1 ? "primary" : ""} full" data-action="plan">${t("reviewPlan")}</button></section>`,
      )
      .join("")}</div>`
  );
}
function review() {
  if (!canSystem())
    return (
      heading("reviewTitle", "reviewSub") +
      `<div class="notice" role="alert">${t("systemRequired")}</div>`
    );
  const a = DEMO_LISTINGS[0];
  return (
    heading(
      "reviewTitle",
      "reviewSub",
      `<span class="badge warning">DEMO-Q01 · ${t("revision")} ${state.revision}</span>`,
    ) +
    `<div class="notice">${t("fiction")} ${t("sourceCaution")}</div><div class="detail-columns"><article class="panel"><div class="eyebrow">${t("evidence")} · ${t("raw")}</div><div class="notice-text" lang="es">${esc(noticeText({ ...a, amount: "65000000.00" }))}</div></article><form id="review-form" class="panel review-form"><h2>${t("critical")}</h2><div class="field"><label for="review-amount">${t("base")} · CRC</label><input id="review-amount" name="amount" type="number" min="0" step="0.01" required value="${esc(state.reviewAmount)}"></div><div class="field"><label for="review-date">${t("nextEvent")}</label><input id="review-date" type="text" value="2026-12-10 10:00 UTC−06:00" readonly></div><div class="field"><label for="review-reason">${t("reason")}</label><textarea id="review-reason" name="reason" required minlength="10" placeholder="${t("reasonPlaceholder")}">${esc(state.reviewReason)}</textarea></div><p id="review-error" role="alert" class="danger"></p><button class="primary full">${t("publish")}</button><div class="source-line">${t("proposal")} · SYSADMIN · Demonstration<br>${t("noEmail")}</div></form></div>`
  );
}

function tagManagement() {
  const es = state.lang === "es",
    L = (en, spanish) => (es ? spanish : en);
  const top = `<div class="heading"><div><h1>${t("tagCatalog")}</h1><p class="muted">${L("Maintain tags and colors.", "Administra las etiquetas y colores.")}</p></div>${canManageTags() && state.screen !== "tag-new" ? `<button class="primary" data-screen="tag-new">${icon("Plus")} ${L("Create tag", "Crear etiqueta")}</button>` : ""}</div>`;
  if (!canManageTags())
    return (
      top + `<div class="notice" role="alert">${t("permissionDenied")}</div>`
    );
  const fields = (tag) =>
    `<div><label for="definition-label">${t("tagLabel")}</label><input id="definition-label" name="label" maxlength="40" required value="${esc(tag?.label || "")}"></div><div><label for="definition-color">Color</label><select id="definition-color" name="color">${tagColorOptions(tag?.color || "gray")}</select></div>`;
  if (state.screen === "tag-new")
    return (
      top +
      `<form id="tag-editor-form" class="panel tag-editor"><h2>${L("Create tag", "Crear etiqueta")}</h2>${fields(null)}<p id="definition-error" class="danger" role="alert"></p><div class="actions"><button class="primary">${icon("Save")} ${t("save")}</button><button type="button" data-screen="tags">${L("Cancel", "Cancelar")}</button></div></form>`
    );
  const editing = orgTags().find(
    (tag) => tag.id === state.editingTag && !tag.deleted,
  );
  const usage = (id) =>
    Object.entries(state.tags).filter(
      ([key, ids]) =>
        key.startsWith(state.workspace + "DEMO-") && ids.includes(id),
    ).length;
  state.tagSort ||= [{ field: "label", direction: 1 }];
  const records = orgTags()
    .filter((tag) => !tag.deleted)
    .sort((a, b) => {
      for (const rule of state.tagSort) {
        const diff =
          rule.field === "label"
            ? a.label.localeCompare(b.label)
            : usage(a.id) - usage(b.id);
        if (diff) return diff * rule.direction;
      }
      return a.id.localeCompare(b.id);
    });
  const rows = records;
  return (
    top +
    `<p class="muted">${L("Shift-click a heading to add a sort priority.", "Mayús + clic en un encabezado para agregar prioridad de orden.")}</p><div class="table-scroll" role="region" tabindex="0" aria-label="${t("tagCatalog")}"><table class="items-table single-line-table tag-admin-table"><thead><tr><th class="col-tag-label"><button data-tag-sort="label">${t("tagLabel")} ${state.tagSort.some((r) => r.field === "label") ? icon(state.tagSort.find((r) => r.field === "label").direction === 1 ? "ArrowUp" : "ArrowDown") : ""}</button></th><th class="col-tag-usage"><button data-tag-sort="usage">${L("Assigned items", "Bienes asignados")} ${state.tagSort.some((r) => r.field === "usage") ? icon(state.tagSort.find((r) => r.field === "usage").direction === 1 ? "ArrowUp" : "ArrowDown") : ""}</button></th><th class="col-actions" aria-label="${L("Item controls", "Controles")}"></th></tr></thead><tbody>${rows.map((tag) => `<tr class="auction-row"><td class="col-tag-label">${editing?.id === tag.id ? `<form id="tag-editor-form" class="tag-inline-editor">${fields(tag)}<p id="definition-error" class="danger" role="alert"></p><div class="actions"><button class="primary">${icon("Save")} ${t("save")}</button><button type="button" data-cancel-tag-edit>${L("Cancel", "Cancelar")}</button></div></form>` : `<span class="badge tag-badge tag-${tag.color || "gray"}">${esc(tag.label)}</span>`}</td><td class="col-tag-usage">${usage(tag.id)}</td><td class="col-actions"><div class="row-actions"><button class="icon-action" title="${L("Edit", "Editar")}" aria-label="${L("Edit", "Editar")}: ${esc(tag.label)}" data-edit-definition="${tag.id}">${icon("Pencil")}</button><button class="icon-action danger" title="${L("Delete", "Eliminar")}" aria-label="${L("Delete", "Eliminar")}: ${esc(tag.label)}" data-delete-definition="${tag.id}">${icon("Trash2")}</button></div></td></tr>`).join("") || `<tr><td colspan="3">${L("No tags yet. Create your first tag.", "Aún no hay etiquetas. Crea la primera.")}</td></tr>`}</tbody></table></div><p class="muted" style="margin-top:16px">${L("Deleted tags retain existing assignments and filter references for history.", "Las etiquetas eliminadas conservan sus asignaciones y referencias de filtros para el historial.")}</p>`
  );
}
function bindTagManagement() {
  app.querySelectorAll("[data-tag-sort]").forEach(
    (button) =>
      (button.onclick = (e) => {
        const field = button.dataset.tagSort,
          old = state.tagSort.find((rule) => rule.field === field),
          rule = { field, direction: old ? -old.direction : 1 };
        state.tagSort = e.shiftKey
          ? [...state.tagSort.filter((r) => r.field !== field), rule]
          : [rule];
        state.editingTag = null;
        render();
      }),
  );
  app.querySelectorAll("[data-edit-definition]").forEach(
    (button) =>
      (button.onclick = () => {
        state.editingTag = button.dataset.editDefinition;
        render();
        document.getElementById("definition-label")?.focus();
      }),
  );
  const cancel = app.querySelector?.("[data-cancel-tag-edit]");
  if (cancel)
    cancel.onclick = () => {
      state.editingTag = null;
      render();
    };
  const form = document.getElementById("tag-editor-form");
  if (form)
    form.onsubmit = (event) => {
      event.preventDefault();
      const label = document.getElementById("definition-label").value,
        color = document.getElementById("definition-color").value;
      const result =
        state.screen === "tag-new"
          ? createOrganizationTag(label, color)
          : updateOrganizationTag(state.editingTag, { label, color });
      if (!result.ok) {
        document.getElementById("definition-error").textContent = t(
          result.error,
        );
        return;
      }
      state.editingTag = null;
      navigate("tags");
      toast(t("tagUpdated"));
    };
  app.querySelectorAll("[data-delete-definition]").forEach(
    (button) =>
      (button.onclick = () => {
        const workspace = state.workspace,
          tag = orgTags().find(
            (tag) => tag.id === button.dataset.deleteDefinition && !tag.deleted,
          );
        if (!tag || !canManageTags()) return;
        const es = state.lang === "es";
        showDialog(
          es ? "Eliminar etiqueta" : "Delete tag",
          `<p>${es ? "¿Eliminar" : "Delete"} <strong>${esc(tag.label)}</strong>?</p><p class="muted">${es ? "Se conservan las asignaciones y referencias existentes para el historial." : "Existing assignments and references are preserved for history."}</p><div class="actions"><button type="button" class="danger" id="confirm-tag-delete">${icon("Trash2")} ${es ? "Eliminar etiqueta" : "Delete tag"}</button><button type="button" id="cancel-tag-delete">${es ? "Cancelar" : "Cancel"}</button></div>`,
        );
        document.getElementById("cancel-tag-delete").onclick = () =>
          document.getElementById("notice").close();
        document.getElementById("confirm-tag-delete").onclick = () => {
          if (state.workspace !== workspace) return;
          const result = deleteOrganizationTag(tag.id);
          if (!result.ok) {
            toast(t(result.error));
            return;
          }
          document.getElementById("notice").close();
          state.editingTag = null;
          navigate("tags");
        };
      }),
  );
}
function settings() {
  const top = heading("settingsTitle", "settingsSub");
  if (!canManageTags())
    return (
      top +
      `<div class="notice" role="alert">${t("permissionDenied")}</div><button data-screen="discover">${t("discover")}</button>`
    );
  return (
    top +
    `<div class="panel"><h2>${t("workspace")}</h2><form id="organization-form"><label for="organization-name">${t("orgName")}</label><input id="organization-name" name="displayName" maxlength="100" value="${esc(organizationName())}" ${canAdmin() ? "" : "readonly"}><div class="actions" style="margin-top:16px">${canAdmin() ? `<button class="primary">${t("saveSettings")}</button><button type="button" data-screen="team">${t("manageUsers")}</button><button type="button" data-screen="plans">${t("manageBilling")}</button>` : '<span class="badge neutral">ADMIN</span>'}</div><p id="organization-error" role="alert" class="danger"></p></form></div><div class="panel"><h2>${t("tagCatalog")}</h2><p class="muted">${t("tagHelp")}</p><button data-screen="tags">${icon("Tags")} ${state.lang === "es" ? "Administrar etiquetas" : "Manage tags"}</button></div>`
  );
}

function updateSystemSettings(patch) {
  if (!canSystem()) return { ok: false, error: "systemRequired" };
  if (
    Object.keys(patch).some(
      (k) =>
        !["ingestionEnabled", "sourceCheckIntervalMinutes", "version"].includes(
          k,
        ),
    )
  )
    return { ok: false, error: "systemValidation" };
  if (
    !Number.isInteger(patch.version) ||
    patch.version !== state.systemSettings.version
  )
    return { ok: false, error: "systemConflict" };
  if (
    typeof patch.ingestionEnabled !== "boolean" ||
    !Number.isInteger(patch.sourceCheckIntervalMinutes) ||
    patch.sourceCheckIntervalMinutes < 15 ||
    patch.sourceCheckIntervalMinutes > 1440
  )
    return { ok: false, error: "systemValidation" };
  state.systemSettings = {
    ingestionEnabled: patch.ingestionEnabled,
    sourceCheckIntervalMinutes: patch.sourceCheckIntervalMinutes,
    version: state.systemSettings.version + 1,
  };
  return { ok: true };
}
function queueSystemIngestion(sourceId) {
  if (!canSystem()) return { ok: false, error: "systemRequired" };
  if (sourceId !== "DEMO-SOURCE-" + INSTANCE_CONFIG.country)
    return { ok: false, error: "systemValidation" };
  if (!state.systemSettings.ingestionEnabled)
    return { ok: false, error: "ingestionPaused" };
  const job = { id: "DEMO-RUN-" + state.nextSystemRun++, state: "queued" };
  state.lastSystemRun = job;
  return { ok: true, job };
}
function system() {
  const top = heading(
    "systemTitle",
    "systemSub",
    `<span class="badge neutral">${esc(INSTANCE_CONFIG.nameEs)} · ${INSTANCE_CONFIG.country}</span>`,
  );
  if (!canSystem())
    return (
      top + `<div class="notice" role="alert">${t("systemRequired")}</div>`
    );
  return (
    top +
    `<div class="notice">${t("systemDemo")}</div><div class="two system-columns"><section class="panel"><div class="eyebrow">SYSADMIN</div><h2>${t("systemControls")}</h2><form id="system-settings-form"><label class="check"><input type="checkbox" name="ingestionEnabled" ${state.systemSettings.ingestionEnabled ? "checked" : ""}>${t("ingestionEnabled")}</label><label for="source-check-interval">${t("sourceCheckInterval")}</label><input id="source-check-interval" name="sourceCheckIntervalMinutes" type="number" min="15" max="1440" step="1" required value="${state.systemSettings.sourceCheckIntervalMinutes}"><input type="hidden" name="version" value="${state.systemSettings.version}"><p id="system-error" role="alert" class="danger"></p><button class="primary" style="margin-top:16px">${t("saveSystemSettings")}</button><div class="source-line">${t("revision")} ${state.systemSettings.version} · ${INSTANCE_CONFIG.country}</div></form></section><section class="panel"><h2>${t("operationsStatus")}</h2><dl class="fact-grid"><div><dt>${t("instanceCountry")}</dt><dd>${esc(INSTANCE_CONFIG.nameEs)} · ${INSTANCE_CONFIG.country}</dd></div><div><dt>${t("sourceAdapter")}</dt><dd>cr-judicial-v1</dd></div></dl><p class="muted">DEMO-SOURCE-${INSTANCE_CONFIG.country}</p><button class="primary" data-action="system-run" ${state.systemSettings.ingestionEnabled ? "" : "disabled"}>${t("runIngestion")}</button><div class="source-line">${t("lastRun")}<br>${state.lastSystemRun ? esc(state.lastSystemRun.id) + " · " + t("queued") : t("noRuns")}</div><button data-screen="review" style="margin-top:16px">${t("review")}</button></section></div>`
  );
}

function brandLogo(variant = "light") {
  return `<div class="logo"><a class="brand-home" href="?screen=discover" aria-label="${t("home")}"><img class="brand-symbol" src="../brand/gavel-${variant}.svg" width="36" height="36" alt=""><span class="name">${t("appName")}</span></a></div>`;
}
function auth() {
  return `<div class="auth panel">${brandLogo("dark")}<h1 style="font-size:26px">${t("authTitle")}</h1><p class="muted">${t("authBody")}</p><label for="demo-email">${t("email")}</label><input id="demo-email" type="email" placeholder="persona@example.invalid" disabled><button class="primary full" data-action="auth">${t("continue")} →</button><div class="divider">Clerk · Integration concept</div><p class="muted">${t("authBoundary")}</p></div>`;
}
function render() {
  document.documentElement.setAttribute?.("data-theme", effectiveTheme());
  document.documentElement.setAttribute?.("data-scheme", state.colorScheme);
  document.documentElement.lang = state.lang;
  document.title = t("appName");
  const navs = [
    ["properties", `${icon("Building2")}`],
    ["vehicles", `${icon("Car")}`],
    ["other", `${icon("Package")}`],
    ["alerts", "◷"],
    ["team", "♧"],
  ];
  const content = (
    {
      overview,
      discover: discovery,
      filters: filterEditor,
      asset,
      notice,
      alerts,
      team,
      plans,
      review,
      settings,
      tags: tagManagement,
      "tag-new": tagManagement,
      system,
      auth,
    }[state.screen] || discovery
  )();
  app.innerHTML = `<aside class="rail">${brandLogo("light")}<div class="rail-caption">${t("workspace")}</div><nav class="nav" aria-label="Main">${navs.map(([k, s]) => `<button data-screen="${CATEGORIES.includes(k) ? "discover" : k}" ${CATEGORIES.includes(k) ? `data-category="${k}"` : ""} class="${state.screen === k || (CATEGORIES.includes(k) && ["discover", "asset", "notice", "filters"].includes(state.screen) && (state.screen === "filters" ? draftFilter().category : state.filters.category) === k) ? "active" : ""}" ${state.screen === k || (state.screen === "discover" && state.filters.category === k) ? 'aria-current="page"' : ""}><span class="symbol" aria-hidden="true">${s}</span><span class="nav-label">${t(k)}</span></button>`).join("")}<button class="secondary-nav" data-screen="overview">${icon("LayoutDashboard")} ${t("overview")}</button><button class="secondary-nav" data-screen="plans">${icon("CreditCard")} ${t("plans")}</button><button class="secondary-nav" data-screen="settings"><span class="symbol" aria-hidden="true">${icon("Settings")}</span><span class="nav-label">${t("settings")}</span></button>${canManageTags() ? `<button class="secondary-nav ${state.screen.startsWith("tag") ? "active" : ""}" data-screen="tags"><span class="symbol" aria-hidden="true">${icon("Tags")}</span><span class="nav-label">${t("tagCatalog")}</span></button>` : ""}<div class="rail-caption">${t("operations")}</div><button class="secondary-nav" data-screen="system"><span class="symbol" aria-hidden="true">${icon("Settings")}</span><span class="nav-label">${t("system")}</span></button><button class="secondary-nav ${state.screen === "review" ? "active" : ""}" data-screen="review"><span class="symbol" aria-hidden="true">${icon("ClipboardCheck")}</span><span class="nav-label">${t("review")}</span></button></nav><div class="rail-bottom"><strong>${t("session")}</strong><br>${t("demoUser")}<br>CR · es / en</div></aside><div class="shell"><header class="topbar"><div class="top-left"><a class="compact-brand" href="?screen=discover" aria-label="${t("home")}"><img src="../brand/gavel-dark.svg" alt="" width="28" height="28"></a><select id="workspace" class="workspace-select" aria-label="${t("workspace")}">${options(
    [
      ["org", state.organizationNames.org || t("org")],
      ["solo", state.organizationNames.solo || t("solo")],
    ],
    state.workspace,
  )}</select></div><div class="top-right"><select id="color-scheme" class="scheme-select" aria-label="${state.lang === "es" ? "Paleta de colores" : "Color scheme"}">${options(
    [
      ["forest", state.lang === "es" ? "Bosque" : "Forest"],
      ["ocean", state.lang === "es" ? "Océano" : "Ocean"],
      ["slate", state.lang === "es" ? "Pizarra" : "Slate"],
      ["terracotta", state.lang === "es" ? "Terracota" : "Terracotta"],
      ["warm-blue", state.lang === "es" ? "Azul cálido" : "Warm blue"],
      ["navy", state.lang === "es" ? "Azul marino" : "Navy"],
      ["studio", state.lang === "es" ? "Estudio" : "Studio"],
      [
        "studio-warm-blue",
        state.lang === "es" ? "Estudio · Azul cálido" : "Studio · Warm Blue",
      ],
      ["harbor", state.lang === "es" ? "Puerto" : "Harbor"],
    ],
    state.colorScheme,
  )}</select><select class="theme-select" id="theme-mode" aria-label="${state.lang === "es" ? "Tema" : "Theme"}">${options(
    [
      ["light", state.lang === "es" ? "Claro" : "Light"],
      ["dark", state.lang === "es" ? "Oscuro" : "Dark"],
      ["system", state.lang === "es" ? "Sistema" : "System"],
    ],
    state.theme,
  )}</select><div class="locale" aria-label="Language"><button data-lang="es" class="${state.lang === "es" ? "active" : ""}" aria-pressed="${state.lang === "es"}">ES</button><button data-lang="en" class="${state.lang === "en" ? "active" : ""}" aria-pressed="${state.lang === "en"}">EN</button></div><button class="avatar" data-screen="auth" aria-label="${t("auth")}">DE</button></div></header><div class="demo-strip"><span>${t("demo")}</span><a href="../docs/04-mockup-guide.html">${t("guide")} ↗</a></div><main id="main" class="content">${!canEdit() ? `<div class="notice">${t("readOnly")}</div>` : ""}${content}<footer class="footer"><span>${t("footer")}</span><div class="preview-tools">${
    state.screen === "discover"
      ? `<label for="preview" style="margin:0;font-weight:400">${t("state")}</label><select id="preview" class="state-select">${options(
          [
            ["normal", t("normal")],
            ["empty", t("emptyState")],
            ["loading", t("loadingState")],
            ["error", t("errorState")],
          ],
          state.preview,
        )}</select>`
      : ""
  }<label for="role" style="margin:0;font-weight:400">${t("rolePreview")}</label><select id="role" class="state-select">${options(
    ["ADMIN", "MANAGER", "USER"].map((x) => [x, t(x)]),
    state.role,
  )}</select><label for="system-role" style="margin:0;font-weight:400">${t("systemRolePreview")}</label><select id="system-role" class="state-select">${options(
    [
      ["", t("noSystemRole")],
      ["SYSADMIN", "SYSADMIN"],
    ],
    state.systemRole || "",
  )}</select><a href="../index.html">Package index ↗</a><button class="ghost" data-screen="system">${t("system")}</button><button class="ghost" data-screen="settings">${t("settings")}</button>${state.screen !== "review" ? `<button class="ghost" data-screen="review">${t("review")}</button>` : ""}</div></footer></main></div>`;
  app.innerHTML = lucideMarkup(app.innerHTML);
  bind();
}
function bindGridResizing() {
  app.querySelectorAll("table.items-table").forEach((table) => {
    const headers = Array.from(table.querySelectorAll("thead th"));
    if (!headers.length) return;
    const key =
      "auctions-grid-widths:v1:" +
      encodeURIComponent(state.userId) +
      ":" +
      (table.dataset.gridKey ||
        (table.classList.contains("tag-admin-table")
          ? "tags"
          : state.filters.category));
    let saved = {};
    try {
      const value = JSON.parse(localStorage.getItem(key));
      if (value && typeof value === "object" && !Array.isArray(value))
        saved = value;
    } catch (_) {}
    const ids = headers.map(
      (header, index) =>
        Array.from(header.classList).find((name) => name.startsWith("col-")) ||
        String(index),
    );
    const defaults = headers.map((header) => {
      if (!header.classList.contains("col-actions"))
        return Math.max(64, Math.round(header.getBoundingClientRect().width));
      return Math.ceil(
        Math.max(
          0,
          ...Array.from(table.querySelectorAll("tbody td.col-actions")).map(
            (cell) => {
              const group = cell.querySelector(".row-actions"),
                buttons = group ? Array.from(group.children) : [];
              const style = getComputedStyle(cell),
                gap = group
                  ? parseFloat(getComputedStyle(group).columnGap) || 0
                  : 0;
              return (
                buttons.reduce(
                  (sum, button) => sum + button.getBoundingClientRect().width,
                  0,
                ) +
                Math.max(0, buttons.length - 1) * gap +
                parseFloat(style.paddingLeft) +
                parseFloat(style.paddingRight) +
                2
              );
            },
          ),
        ),
      );
    });
    const widths = defaults.map((width, index) =>
      ids[index] !== "col-actions" &&
      Number.isFinite(saved[ids[index]]) &&
      saved[ids[index]] >= 64 &&
      saved[ids[index]] <= 1000
        ? saved[ids[index]]
        : width,
    );
    const group = document.createElement("colgroup");
    const cols = headers.map(() => {
      const col = document.createElement("col");
      group.append(col);
      return col;
    });
    table.prepend(group);
    table.classList.add("resizable-grid");
    const persist = () => {
      ids.forEach((id, index) => {
        if (id === "col-actions") delete saved[id];
        else saved[id] = widths[index];
      });
      try {
        localStorage.setItem(key, JSON.stringify(saved));
      } catch (_) {}
    };
    const apply = () => {
      widths.forEach((width, index) => {
        cols[index].style.width = width + "px";
        headers[index]
          .querySelector(".column-resizer")
          ?.setAttribute("aria-valuenow", String(width));
      });
      const total = widths.reduce((a, b) => a + b, 0);
      table.style.width = total + "px";
      table.style.minWidth = total + "px";
    };
    headers.forEach((header, index) => {
      if (header.classList.contains("col-actions")) return;
      const handle = document.createElement("span");
      handle.className = "column-resizer";
      handle.tabIndex = 0;
      handle.setAttribute("role", "separator");
      handle.setAttribute("aria-orientation", "vertical");
      handle.setAttribute("aria-valuemin", "64");
      handle.setAttribute("aria-valuemax", "1000");
      const label =
        header.textContent.trim() ||
        header.getAttribute("aria-label") ||
        (state.lang === "es" ? "Controles" : "Controls");
      handle.setAttribute(
        "aria-label",
        (state.lang === "es" ? "Cambiar ancho: " : "Resize column: ") + label,
      );
      handle.title =
        state.lang === "es"
          ? "Arrastra para ajustar; doble clic para restablecer"
          : "Drag to resize; double-click to reset";
      header.append(handle);
      const resize = (value) => {
        widths[index] = Math.max(64, Math.min(1000, Math.round(value)));
        apply();
      };
      handle.onclick = (event) => event.stopPropagation();
      handle.ondblclick = (event) => {
        event.stopPropagation();
        resize(defaults[index]);
        persist();
      };
      handle.onkeydown = (event) => {
        if (!["ArrowLeft", "ArrowRight", "Home"].includes(event.key)) return;
        event.preventDefault();
        event.stopPropagation();
        resize(
          event.key === "Home"
            ? defaults[index]
            : widths[index] +
                (event.key === "ArrowRight" ? 1 : -1) *
                  (event.shiftKey ? 40 : 16),
        );
        persist();
      };
      handle.onpointerdown = (event) => {
        if (event.button !== 0) return;
        event.preventDefault();
        event.stopPropagation();
        const start = event.clientX,
          width = widths[index];
        handle.setPointerCapture(event.pointerId);
        table.classList.add("is-resizing");
        handle.onpointermove = (move) => resize(width + move.clientX - start);
        const finish = () => {
          handle.onpointermove = null;
          table.classList.remove("is-resizing");
          persist();
        };
        handle.onpointerup = finish;
        handle.onpointercancel = finish;
        handle.onlostpointercapture = finish;
      };
    });
    apply();
  });
}
function bind() {
  bindGridResizing();
  bindPropertyResearch();
  bindTagManagement();
  document.getElementById("color-scheme").onchange = (e) => {
    if (setColorScheme(e.target.value)) render();
  };
  document.getElementById("theme-mode").onchange = (e) => {
    if (setTheme(e.target.value)) render();
  };
  bindSort();
  app.querySelectorAll("[data-column]").forEach((input) => {
    input.onchange = (event) => {
      const key = input.getAttribute("data-column");
      const next = visibleColumns().filter((value) => value !== key);
      if (event.target.checked) next.push(key);
      if (saveVisibleColumns(next)) {
        render();
        document.getElementById("column-menu").open = true;
        app.querySelector(`[data-column="${key}"]`)?.focus();
      }
    };
  });
  const resetColumns = document.getElementById("reset-columns");
  if (resetColumns)
    resetColumns.onclick = () => {
      saveVisibleColumns(defaultColumns());
      render();
      document.getElementById("column-menu").open = true;
      document.getElementById("reset-columns")?.focus();
    };
  const pageSize = document.getElementById("page-size");
  if (pageSize)
    pageSize.onchange = (e) => {
      if (setItemPageSize(Number(e.target.value))) {
        render();
        window.scrollTo({ top: 0, behavior: "instant" });
      }
    };
  app.querySelectorAll("[data-page-previous]").forEach(
    (el) =>
      (el.onclick = () => {
        if (setItemPage(state.page - 1)) {
          render();
          window.scrollTo({ top: 0, behavior: "instant" });
        }
      }),
  );
  app.querySelectorAll("[data-page-next]").forEach(
    (el) =>
      (el.onclick = () => {
        if (setItemPage(state.page + 1)) {
          render();
          window.scrollTo({ top: 0, behavior: "instant" });
        }
      }),
  );
  app.querySelectorAll("[data-retrieve-filter]").forEach(
    (el) =>
      (el.onclick = () => {
        const result = retrieveOwnedFilter(el.dataset.retrieveFilter);
        if (result.ok) {
          render();
          toast(t("retrievedFilter"));
          window.scrollTo({ top: 0, behavior: "instant" });
        } else toast(t(result.error));
      }),
  );
  app.querySelectorAll("[data-item-tab]").forEach((el) => {
    el.onclick = () => {
      state.itemTab = el.dataset.itemTab;
      render();
    };
    el.onkeydown = (e) => {
      if (["ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
        const tabs = availableItemTabs();
        state.itemTab =
          tabs[
            (tabs.indexOf(state.itemTab) +
              (e.key === "ArrowRight" ? 1 : tabs.length - 1)) %
              tabs.length
          ];
        render();
        document.getElementById("item-tab-" + state.itemTab)?.focus();
      }
    };
  });
  const imageForm = document.getElementById("image-upload-form");
  if (imageForm)
    imageForm.onsubmit = (e) => {
      e.preventDefault();
      const result = attachAuctionImages(
        state.selected,
        document.getElementById("auction-image-files").files,
      );
      if (!result.ok) {
        document.getElementById("image-error").textContent = t(result.error);
        return;
      }
      render();
      toast(t("imageAdded"));
    };
  app
    .querySelectorAll("[data-screen]")
    .forEach(
      (el) =>
        (el.onclick = () =>
          el.dataset.category
            ? selectCategory(el.dataset.category)
            : navigate(el.dataset.screen, el.dataset.id)),
    );
  app.querySelectorAll("[data-lang]").forEach(
    (el) =>
      (el.onclick = () => {
        state.lang = el.dataset.lang;
        render();
      }),
  );
  app.querySelectorAll("[data-view]").forEach(
    (el) =>
      (el.onclick = () => {
        state.view = el.dataset.view;
        render();
      }),
  );
  app.querySelectorAll("[data-pin]").forEach(
    (el) =>
      (el.onclick = () => {
        state.mapSelected = el.dataset.pin;
        render();
      }),
  );
  document.getElementById("workspace").onchange = (e) => {
    state.workspace = e.target.value;
    if (state.screen === "filters") {
      draftFilter().expression.groups = draftFilter()
        .expression.groups.map((g) => ({
          ...g,
          terms: g.terms.filter((t) => t.field !== "organizationTag"),
        }))
        .filter((g) => g.terms.length);
    } else {
      state.page = 1;
      state.filters.expression.groups = state.filters.expression.groups
        .map((g) => ({
          ...g,
          terms: g.terms.filter((t) => t.field !== "organizationTag"),
        }))
        .filter((g) => g.terms.length);
      state.filterDraft = null;
    }
    state.role = state.roles[state.workspace];
    render();
  };
  document.getElementById("system-role").onchange = (e) => {
    state.systemRole = e.target.value || null;
    render();
  };
  document.getElementById("role").onchange = (e) => {
    state.role = e.target.value;
    state.roles[state.workspace] = state.role;
    render();
  };
  const preview = document.getElementById("preview");
  if (preview)
    preview.onchange = (e) => {
      state.preview = e.target.value;
      render();
    };
  bindFilterBuilder();
  app.querySelectorAll("[data-action]").forEach(
    (el) =>
      (el.onclick = () => {
        const a = el.dataset.action;
        if (a === "reset") {
          if (state.screen === "filters")
            state.filterDraft = initialFilter(draftFilter().category);
          else {
            state.filters = initialFilter(state.filters.category);
            state.page = 1;
            state.filterDraft = null;
          }
          render();
        }
        if (a === "open-filters") openFilterEditor();
        if (a === "cancel-filters") cancelFilterEditor();
        if (a === "save-search") saveSearchDialog();
        if (a === "invite")
          showDialog(
            t("invite"),
            `<p>${t("inviteBoundary")}</p><p>${t("noEmail")}</p>`,
          );
        if (a === "plan")
          showDialog(
            t("proposal"),
            `<p>${t("planBoundary")}</p><p>${t("noCharge")}</p>`,
          );
        if (a === "system-run") {
          const result = queueSystemIngestion(
            "DEMO-SOURCE-" + INSTANCE_CONFIG.country,
          );
          if (result.ok) {
            render();
            toast(t("systemTaskQueued"));
          } else toast(t(result.error));
        }
        if (a === "auth") showDialog(t("auth"), `<p>${t("authBoundary")}</p>`);
        if (a === "role-boundary")
          showDialog(t("roles"), `<p>${t("inviteBoundary")}</p>`);
      }),
  );
  app.querySelectorAll("[data-toggle-search]").forEach(
    (el) =>
      (el.onclick = () => {
        const result = toggleOwnedSearch(el.dataset.toggleSearch);
        if (result.ok) render();
        else toast(t(result.error));
      }),
  );
  app.querySelectorAll("[data-delete-search]").forEach(
    (el) =>
      (el.onclick = () => {
        const result = deleteOwnedSearch(el.dataset.deleteSearch);
        if (result.ok) render();
        else toast(t(result.error));
      }),
  );
  app
    .querySelectorAll("[data-tags]")
    .forEach((button) => (button.onclick = () => openTagPicker(button)));
  const organizationForm = document.getElementById("organization-form");
  if (organizationForm)
    organizationForm.onsubmit = (e) => {
      e.preventDefault();
      const result = updateOrganizationName(
        new FormData(organizationForm).get("displayName"),
      );
      if (!result.ok) {
        document.getElementById("organization-error").textContent = t(
          result.error,
        );
        return;
      }
      render();
      toast(t("settingsSaved"));
    };
  const systemForm = document.getElementById("system-settings-form");
  if (systemForm)
    systemForm.onsubmit = (e) => {
      e.preventDefault();
      const data = new FormData(systemForm);
      const result = updateSystemSettings({
        ingestionEnabled: data.has("ingestionEnabled"),
        sourceCheckIntervalMinutes: Number(
          data.get("sourceCheckIntervalMinutes"),
        ),
        version: Number(data.get("version")),
      });
      if (!result.ok) {
        document.getElementById("system-error").textContent = t(result.error);
        return;
      }
      render();
      toast(t("systemSettingsSaved"));
    };
  const rf = document.getElementById("review-form");
  if (rf)
    rf.onsubmit = (e) => {
      e.preventDefault();
      if (!canSystem()) {
        toast(t("systemRequired"));
        return;
      }
      const d = new FormData(rf),
        n = String(d.get("amount")),
        reason = String(d.get("reason")).trim();
      if (!n || Number(n) < 0 || reason.length < 10) {
        document.getElementById("review-error").textContent = t("validation");
        return;
      }
      state.reviewAmount = Number(n).toFixed(2);
      state.reviewReason = reason;
      DEMO_LISTINGS[0].amount = state.reviewAmount;
      state.revision++;
      render();
      toast(t("publishDone"));
    };
}
function saveSearchDialog() {
  if (!canEdit() || state.screen !== "filters") return;
  const candidate = canonicalFilter(draftFilter()),
    context = state.workspace;
  if (!validateFilter(candidate, context)) {
    document.getElementById("filter-error").textContent =
      t("invalidExpression");
    return;
  }
  showDialog(
    t("saveSearch"),
    `<p>${t("filterSummary")}: ${esc(summary(candidate))}</p><label for="search-title">${t("searchName")}</label><input id="search-title" maxlength="100" required><p id="search-error" role="alert" class="danger"></p><p style="margin-top:15px">${t("noEmail")}</p><button type="button" class="primary" id="confirm-search">${t("create")}</button>`,
  );
  document.getElementById("confirm-search").onclick = () => {
    const name = document.getElementById("search-title").value.trim();
    if (!name) {
      document.getElementById("search-error").textContent = t("nameRequired");
      return;
    }
    const result = createOwnedSearch(name, candidate, context);
    if (!result.ok) {
      document.getElementById("search-error").textContent = t(result.error);
      return;
    }
    document.getElementById("notice").close();
    render();
    toast(t("searchCreated"));
  };
}
const boot = new URLSearchParams(location.search);
if (boot.has("palette")) setColorScheme(boot.get("palette"));
if (boot.has("theme")) setTheme(boot.get("theme"));
if (boot.has("pageSize")) {
  if (!setItemPageSize(Number(boot.get("pageSize")))) state.preview = "error";
}
if (boot.has("page")) {
  const value = Number(boot.get("page"));
  if (Number.isInteger(value) && value > 0) state.page = value;
  else state.preview = "error";
}
if (CATEGORIES.includes(boot.get("category")))
  state.filters = initialFilter(boot.get("category"));
if (
  [
    "overview",
    "discover",
    "filters",
    "asset",
    "property-edit",
    "notice",
    "alerts",
    "team",
    "plans",
    "review",
    "settings",
    "tags",
    "tag-new",
    "system",
    "auth",
  ].includes(boot.get("screen"))
)
  state.screen =
    boot.get("screen") === "property-edit" ? "asset" : boot.get("screen");
if (ITEM_TABS.includes(boot.get("tab"))) state.itemTab = boot.get("tab");
if (boot.get("view") === "map") state.view = "map";
if (boot.get("lang") === "en") state.lang = "en";
if (DEMO_LISTINGS.some((x) => x.id === boot.get("id"))) {
  state.selected = boot.get("id");
  state.filters = initialFilter(current().category);
}
render();

window
  .matchMedia?.("(prefers-color-scheme: dark)")
  ?.addEventListener?.("change", () => {
    if (state.theme === "system") render();
  });
