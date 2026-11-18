import catalog from "../data/territorial-divisions-cr.json"

export type TerritorialDivision = {
  id: string
  name: string
  code: string
  level: number
  parentId: string | null
  /** Area in square kilometres; null means unknown. */
  area: number | null
  /** Reference altitude in metres above sea level; null means unknown. */
  altitude: number | null
  normalized_name: string
}
// Instance configuration, never a user/administrator country selector.
export const territorialConfig = {
  countryCode: "CR",
  levels: ["province", "canton", "district"],
  sourceYear: 2024,
  sourceUrl:
    "https://files.snitcr.go.cr/boletines/DTA-TABLA%20POR%20PROVINCIA-CANT%C3%93N-DISTRITO%202024.pdf",
} as const
export function normalizeDivisionName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
}
export const initialDivisions: TerritorialDivision[] = catalog
const seedById = new Map(initialDivisions.map((n) => [n.id, n]))
type LegacyDivision = Omit<
  TerritorialDivision,
  "area" | "altitude" | "normalized_name"
> &
  Partial<Pick<TerritorialDivision, "area" | "altitude" | "normalized_name">>
// Older browser catalogs retain their edits; only absent measurements use seed defaults.
export function hydrateDivisions(
  nodes: readonly LegacyDivision[]
): TerritorialDivision[] {
  return nodes.map((n) => ({
    ...n,
    area: n.area === undefined ? (seedById.get(n.id)?.area ?? null) : n.area,
    altitude: n.altitude ?? null,
    normalized_name: normalizeDivisionName(n.name),
  }))
}
export type DivisionError =
  "forbidden" | "missing" | "invalid" | "duplicate" | "children" | "referenced"
export type DivisionCommand =
  | { type: "save"; division: TerritorialDivision }
  | { type: "delete"; id: string }

// Shared command boundary; the prototype still requires production API authorization.
export function changeDivisions(
  divisions: TerritorialDivision[],
  command: DivisionCommand,
  isSysadmin: boolean,
  referencedIds: readonly string[] = []
): { divisions: TerritorialDivision[]; error?: DivisionError } {
  const fail = (error: DivisionError) => ({ divisions, error })
  if (!isSysadmin) return fail("forbidden")
  if (command.type === "delete") {
    if (!divisions.some((n) => n.id === command.id)) return fail("missing")
    if (divisions.some((n) => n.parentId === command.id))
      return fail("children")
    if (referencedIds.includes(command.id)) return fail("referenced")
    return { divisions: divisions.filter((n) => n.id !== command.id) }
  }
  const n = {
    ...command.division,
    name: command.division.name.trim(),
    code: command.division.code.trim(),
    normalized_name: normalizeDivisionName(command.division.name),
  }
  if (
    !n.id ||
    !n.name ||
    n.name.length > 120 ||
    !n.code ||
    n.code.length > 30 ||
    (n.area !== null &&
      (typeof n.area !== "number" ||
        !Number.isFinite(n.area) ||
        n.area <= 0)) ||
    (n.altitude !== null &&
      (typeof n.altitude !== "number" || !Number.isFinite(n.altitude))) ||
    !Number.isInteger(n.level) ||
    n.level < 0 ||
    n.level >= territorialConfig.levels.length
  )
    return fail("invalid")
  const existing = divisions.find((d) => d.id === n.id)
  if (existing && existing.level !== n.level) return fail("invalid")
  if (
    n.level === 0
      ? n.parentId !== null
      : !divisions.some((p) => p.id === n.parentId && p.level === n.level - 1)
  )
    return fail("invalid")
  if (
    divisions.some(
      (d) =>
        d.id !== n.id &&
        d.level === n.level &&
        (d.code.toLocaleLowerCase() === n.code.toLocaleLowerCase() ||
          (d.parentId === n.parentId &&
            d.name.toLocaleLowerCase() === n.name.toLocaleLowerCase()))
    )
  )
    return fail("duplicate")
  return {
    divisions: existing
      ? divisions.map((d) => (d.id === n.id ? n : d))
      : [...divisions, n],
  }
}

export function divisionPath(
  divisions: TerritorialDivision[],
  id: string
): string {
  const names: string[] = []
  const visited = new Set<string>()
  let node = divisions.find((n) => n.id === id)
  while (node && !visited.has(node.id)) {
    visited.add(node.id)
    names.unshift(node.name)
    node = divisions.find((n) => n.id === node!.parentId)
  }
  return names.join(" / ")
}
export function visibleDivisions(
  divisions: TerritorialDivision[],
  expanded: ReadonlySet<string>
): TerritorialDivision[] {
  const children = new Map<string | null, TerritorialDivision[]>()
  for (const node of divisions)
    children.set(node.parentId, [...(children.get(node.parentId) ?? []), node])
  const visit = (parentId: string | null): TerritorialDivision[] =>
    (children.get(parentId) ?? [])
      .toSorted(
        (a, b) =>
          a.code.localeCompare(b.code, "es", { numeric: true }) ||
          a.name.localeCompare(b.name, "es")
      )
      .flatMap((node) => [
        node,
        ...(expanded.has(node.id) ? visit(node.id) : []),
      ])
  return visit(null)
}
