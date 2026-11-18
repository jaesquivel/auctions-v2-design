export function tagChangeItemIds(
  assignments: Record<string, string[]>,
  itemIds: readonly string[],
  tagId: string,
  action: "add" | "remove"
): string[] {
  return [...new Set(itemIds)].filter((id) =>
    action === "add"
      ? !(assignments[id] ?? []).includes(tagId)
      : (assignments[id] ?? []).includes(tagId)
  )
}

export function bulkTagAssignments(
  assignments: Record<string, string[]>,
  itemIds: readonly string[],
  tagId: string,
  action: "add" | "remove"
): { assignments: Record<string, string[]>; changed: number } {
  const next = { ...assignments }
  let changed = 0
  for (const id of tagChangeItemIds(assignments, itemIds, tagId, action)) {
    const before = assignments[id] ?? []
    if (action === "add" ? !before.includes(tagId) : before.includes(tagId)) {
      next[id] =
        action === "add"
          ? [...before, tagId]
          : before.filter((tag) => tag !== tagId)
      changed++
    }
  }
  return { assignments: next, changed }
}

export async function matchingItemIds(
  query: import("./domain").Query,
  loadPage: (
    query: import("./domain").Query
  ) => Promise<import("./domain").ItemPage>
): Promise<string[]> {
  const ids = new Set<string>()
  let total: number | undefined
  let pageCount = 1
  for (let page = 1; page <= pageCount; page++) {
    const result = await loadPage({ ...query, page, pageSize: 100 })
    if (
      result.page !== page ||
      !Number.isSafeInteger(result.pageCount) ||
      result.pageCount < page ||
      result.pageCount > 100000 ||
      (total !== undefined && result.total !== total)
    )
      throw Error("Results changed while loading")
    total = result.total
    pageCount = result.pageCount
    result.items.forEach((item) => ids.add(item.id))
  }
  if (ids.size !== total) throw Error("Incomplete matching results")
  return [...ids]
}
