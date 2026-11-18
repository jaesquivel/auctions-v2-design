import { test } from "node:test"
import assert from "node:assert/strict"
import { defaultQuery, type Item, type ItemPage } from "../lib/domain.ts"
import {
  bulkTagAssignments,
  matchingItemIds,
  tagChangeItemIds,
} from "../lib/bulk-tags.ts"

test("bulk add targets only supplied matching IDs, preserves other tags, and is idempotent", () => {
  const before = {
    visible1: ["existing"],
    visible2: ["target"],
    otherPage: ["other"],
  }
  const result = bulkTagAssignments(
    before,
    ["visible1", "visible2", "visible3", "visible1"],
    "target",
    "add"
  )
  assert.equal(result.changed, 2)
  assert.deepEqual(result.assignments, {
    visible1: ["existing", "target"],
    visible2: ["target"],
    visible3: ["target"],
    otherPage: ["other"],
  })
  assert.deepEqual(before.visible1, ["existing"])
  assert.equal(
    bulkTagAssignments(
      result.assignments,
      ["visible1", "visible2", "visible3"],
      "target",
      "add"
    ).changed,
    0
  )
})
test("bulk remove changes only selected tag on supplied matching items, including mixed assignments", () => {
  const before = {
    visible1: ["keep", "target"],
    visible2: ["keep"],
    otherPage: ["target"],
  }
  const result = bulkTagAssignments(
    before,
    ["visible1", "visible2", "unknown"],
    "target",
    "remove"
  )
  assert.equal(result.changed, 1)
  assert.deepEqual(result.assignments, {
    visible1: ["keep"],
    visible2: ["keep"],
    otherPage: ["target"],
  })
  assert.deepEqual(before.visible1, ["keep", "target"])
  assert.equal(
    bulkTagAssignments(
      result.assignments,
      ["visible1", "visible2"],
      "target",
      "remove"
    ).changed,
    0
  )
})
test("empty matching set changes no assignments", () => {
  const before = { hidden: ["target"] }
  assert.deepEqual(bulkTagAssignments(before, [], "target", "remove"), {
    assignments: before,
    changed: 0,
  })
})

test("matching IDs span every server page, independent of the displayed page and size", async () => {
  const calls: number[] = []
  const query = { ...defaultQuery("properties"), page: 7, pageSize: 25 }
  const ids = await matchingItemIds(query, async (q) => {
    calls.push(q.page)
    assert.equal(q.pageSize, 100)
    assert.deepEqual(q.expression, query.expression)
    const start = (q.page - 1) * 100
    return {
      items: Array.from(
        { length: Math.min(100, 205 - start) },
        (_, i) => ({ id: `match-${start + i}` }) as Item
      ),
      total: 205,
      page: q.page,
      pageSize: 100,
      pageCount: 3,
    }
  })
  assert.deepEqual(calls, [1, 2, 3])
  assert.equal(ids.length, 205)
  const result = bulkTagAssignments(
    { unmatched: ["keep"] },
    ids,
    "target",
    "add"
  )
  assert.equal(result.changed, 205)
  assert.deepEqual(result.assignments["match-204"], ["target"])
  assert.deepEqual(result.assignments.unmatched, ["keep"])
  assert.equal(query.page, 7)
})
test("incomplete or changing result sets fail before a bulk action can be applied", async () => {
  const page = (overrides: Partial<ItemPage> = {}): ItemPage => ({
    items: [{ id: "a" } as Item],
    total: 2,
    page: 1,
    pageSize: 100,
    pageCount: 2,
    ...overrides,
  })
  await assert.rejects(
    matchingItemIds(defaultQuery("properties"), async (q) =>
      page({ page: q.page })
    ),
    /Incomplete/
  )
  await assert.rejects(
    matchingItemIds(defaultQuery("properties"), async (q) =>
      page({ page: q.page, total: q.page === 1 ? 2 : 3 })
    ),
    /changed/
  )
  await assert.rejects(
    matchingItemIds(defaultQuery("properties"), async (q) => {
      if (q.page === 2) throw Error("Network failure")
      return page()
    }),
    /Network failure/
  )
})

test("confirmation counts only actual changes and preparing it does not modify assignments", () => {
  const before = { a: ["target", "keep"], b: ["keep"], outside: ["target"] }
  const original = structuredClone(before)
  const matches = ["a", "b", "c", "a"]
  const add = tagChangeItemIds(before, matches, "target", "add")
  const remove = tagChangeItemIds(before, matches, "target", "remove")
  assert.deepEqual(add, ["b", "c"])
  assert.deepEqual(remove, ["a"])
  assert.deepEqual(before, original)
  assert.equal(
    bulkTagAssignments(before, add, "target", "add").changed,
    add.length
  )
  assert.equal(
    bulkTagAssignments(before, remove, "target", "remove").changed,
    remove.length
  )
  const changedSincePrompt = { ...before, b: ["keep", "target"] }
  assert.deepEqual(tagChangeItemIds(changedSincePrompt, add, "target", "add"), [
    "c",
  ])
})
