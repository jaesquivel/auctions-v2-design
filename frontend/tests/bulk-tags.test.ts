import { test } from "node:test"
import assert from "node:assert/strict"
import { bulkTagAssignments } from "../lib/bulk-tags.ts"

test("bulk add targets only displayed IDs, preserves other tags, and is idempotent", () => {
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
test("bulk remove changes only selected tag on displayed items, including mixed assignments", () => {
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
test("empty displayed page changes no assignments", () => {
  const before = { hidden: ["target"] }
  assert.deepEqual(bulkTagAssignments(before, [], "target", "remove"), {
    assignments: before,
    changed: 0,
  })
})
