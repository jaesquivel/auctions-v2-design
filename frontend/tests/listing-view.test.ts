import test from "node:test"
import assert from "node:assert/strict"
import { viewColumns, defaultColumns } from "../lib/listing-view"
test("saved view columns override current preferences and reject incompatible fields", () => {
  assert.deepEqual(
    viewColumns(
      "vehicles",
      ["tags", "registrationNumber", "plate", "plate"],
      ["item"]
    ),
    ["tags", "plate"]
  )
})
test("legacy saved filters retain current column preferences", () => {
  assert.deepEqual(viewColumns("properties", undefined, ["tags", "area"]), [
    "tags",
    "area",
  ])
})
test("empty or obsolete view columns fall back to nonempty category defaults", () => {
  assert.deepEqual(viewColumns("other", []), defaultColumns("other"))
  assert.deepEqual(
    viewColumns("vehicles", ["locality", "registrationNumber"]),
    defaultColumns("vehicles")
  )
})
