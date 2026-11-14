import { test } from "node:test"
import assert from "node:assert/strict"
import { navigationSections } from "../lib/navigation.ts"
test("System is absent without SYSADMIN even for an organization administrator", () => {
  for (const canManage of [false, true]) {
    const sections = navigationSections(canManage, false)
    assert.deepEqual(
      sections.map((s) => s.key),
      ["auctionsSection", "extractionSection", "configurationSection"]
    )
    assert.ok(
      !sections.flatMap((s) => s.items).some((i) => i.href === "/system")
    )
  }
})
test("SYSADMIN adds the fourth section independently of tag-management permission", () => {
  const sections = navigationSections(false, true)
  assert.equal(sections.at(-1)?.key, "systemSection")
  assert.ok(sections.at(-1)?.items.some((i) => i.href === "/system"))
  assert.ok(!sections.flatMap((s) => s.items).some((i) => i.href === "/tags"))
})
