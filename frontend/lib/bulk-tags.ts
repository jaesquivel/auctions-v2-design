export function bulkTagAssignments(
  assignments: Record<string, string[]>,
  itemIds: readonly string[],
  tagId: string,
  action: "add" | "remove"
): { assignments: Record<string, string[]>; changed: number } {
  const next = { ...assignments }
  let changed = 0
  for (const id of new Set(itemIds)) {
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
