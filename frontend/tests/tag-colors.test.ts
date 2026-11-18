import { test } from "node:test"
import assert from "node:assert/strict"
import {
  normalizeTagColor,
  tagPalette,
  tagColorNames,
  tagTextColor,
} from "../lib/tag-colors.ts"

test("HTML colors normalize shorthand and preserve six-digit values", () => {
  assert.equal(normalizeTagColor("#abc"), "#AABBCC")
  assert.equal(normalizeTagColor("#001b66"), "#001B66")
})
test("legacy named tag colors remain supported", () => {
  for (const name of tagColorNames)
    assert.equal(normalizeTagColor(name), tagPalette[name])
})
test("invalid color strings cannot become style values", () => {
  for (const value of [
    "",
    "#12",
    "#12345",
    "#GGGGGG",
    "transparent",
    "url(example)",
    "toString",
    "__proto__",
  ])
    assert.equal(normalizeTagColor(value), null)
})
test("tag text uses contrasting colors for light and dark backgrounds", () => {
  assert.equal(tagTextColor("#FFFFFF"), "#000000")
  assert.equal(tagTextColor("#000000"), "#FFFFFF")
  assert.equal(tagTextColor("#001B66"), "#FFFFFF")
  assert.equal(tagTextColor("#ff0"), "#000000")
})
