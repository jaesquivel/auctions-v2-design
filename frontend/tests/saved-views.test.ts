import test from "node:test"
import assert from "node:assert/strict"
import { defaultQuery } from "../lib/domain"
import {
  applySavedView,
  applyDefaultView,
  isDefaultView,
  viewMatches,
} from "../lib/saved-views"
import type { PreviewState, SavedView } from "../lib/preview-store"
const view: SavedView = {
  id: "v",
  owner: "u",
  organization: "org",
  name: "Example",
  enabled: true,
  columns: ["tags", "item"],
  query: {
    ...defaultQuery("properties"),
    sorts: [{ field: "type", direction: "desc" }],
  },
}
const state = {
  user: "u",
  organization: "org",
  savedFilters: [view],
  queries: {
    "u:properties": { ...defaultQuery("properties"), page: 2, pageSize: 50 },
  },
  columns: { "u:properties": ["item", "area"] },
} as unknown as PreviewState
test("switch applies filters, sorts, columns and selected identity while resetting page only", () => {
  const next = applySavedView(state, "v", "properties")
  assert.equal(next.queries["u:properties"].page, 1)
  assert.equal(next.queries["u:properties"].pageSize, 50)
  assert.deepEqual(next.queries["u:properties"].sorts, view.query.sorts)
  assert.deepEqual(next.columns["u:properties"], view.columns)
  assert.equal(next.appliedViewIds?.["u:properties"], "v")
  assert.equal(state.queries["u:properties"].page, 2)
})
test("switch rejects views outside current owner, organization or category", () => {
  for (const patch of [{ user: "other" }, { organization: "other" }]) {
    const other = { ...state, ...patch }
    assert.equal(applySavedView(other, "v", "properties"), other)
  }
  assert.equal(applySavedView(state, "v", "vehicles"), state)
  assert.equal(applySavedView(state, "missing", "properties"), state)
})
test("current view matching ignores pagination but detects changed sorts and columns", () => {
  assert.equal(
    viewMatches(view, { ...view.query, page: 4, pageSize: 100 }, [
      "tags",
      "item",
    ]),
    true
  )
  assert.equal(
    viewMatches(view, { ...view.query, sorts: [] }, ["tags", "item"]),
    false
  )
  assert.equal(viewMatches(view, view.query, ["tags"]), false)
})

test("default view clears criteria, restores sorts/columns and preserves saved views and page size", () => {
  const next = applyDefaultView(state, "properties")
  assert.equal(next.queries["u:properties"].page, 1)
  assert.equal(next.queries["u:properties"].pageSize, 50)
  assert.equal(next.appliedViewIds?.["u:properties"], "__default__")
  assert.equal(
    isDefaultView(next.queries["u:properties"], next.columns["u:properties"]),
    true
  )
  assert.equal(next.savedFilters, state.savedFilters)
  assert.equal(
    isDefaultView(
      { ...next.queries["u:properties"], sorts: [] },
      next.columns["u:properties"]
    ),
    false
  )
})
