import { test } from "node:test"
import assert from "node:assert/strict"
import {
  initialDivisions,
  hydrateDivisions,
  normalizeDivisionName,
  changeDivisions,
  divisionPath,
  visibleDivisions,
  type TerritorialDivision,
} from "../lib/territorial-divisions.ts"
import { navigationSections } from "../lib/navigation.ts"
const district: TerritorialDivision = {
  id: "test-district",
  name: "Test district",
  code: "TEST",
  level: 2,
  parentId: "CR-101",
  area: null,
  altitude: null,
  normalized_name: "test district",
}
test("official 2024 snapshot has complete parent chains and stable unique identities", () => {
  assert.deepEqual(
    [0, 1, 2].map(
      (level) => initialDivisions.filter((n) => n.level === level).length
    ),
    [7, 84, 492]
  )
  assert.equal(
    new Set(initialDivisions.map((n) => n.id)).size,
    initialDivisions.length
  )
  for (const n of initialDivisions) {
    assert.equal(
      changeDivisions(initialDivisions, { type: "save", division: n }, true)
        .error,
      undefined
    )
  }
  assert.equal(
    divisionPath(initialDivisions, "CR-10101"),
    "San José / San José / Carmen"
  )
})
test("all users can navigate to territorial divisions; only SYSADMIN can mutate", () => {
  for (const manager of [true, false])
    for (const sysadmin of [true, false])
      assert.ok(
        navigationSections(manager, sysadmin)
          .find((s) => s.key === "configurationSection")
          ?.items.some((i) => i.href === "/territorial-divisions")
      )
  for (const command of [
    { type: "save", division: district },
    { type: "delete", id: "CR-10101" },
  ] as const) {
    const result = changeDivisions(initialDivisions, command, false)
    assert.equal(result.error, "forbidden")
    assert.strictEqual(result.divisions, initialDivisions)
  }
})
test("SYSADMIN can create, rename/reparent a leaf, and delete it without changing other identities", () => {
  const created = changeDivisions(
    initialDivisions,
    { type: "save", division: district },
    true
  )
  assert.equal(created.error, undefined)
  const edited = changeDivisions(
    created.divisions,
    {
      type: "save",
      division: { ...district, name: "Renamed", parentId: "CR-102" },
    },
    true
  )
  assert.equal(edited.error, undefined)
  assert.equal(
    divisionPath(edited.divisions, district.id),
    "San José / Escazú / Renamed"
  )
  const removed = changeDivisions(
    edited.divisions,
    { type: "delete", id: district.id },
    true
  )
  assert.deepEqual(removed.divisions, initialDivisions)
})
test("invalid levels, parent chains, duplicates and destructive parent deletion are rejected", () => {
  for (const patch of [
    { parentId: "CR-1" },
    { parentId: district.id },
    { parentId: "missing" },
    { level: 3 },
    { level: -1 },
    { level: 1.5 },
    { name: " " },
    { code: " " },
  ])
    assert.equal(
      changeDivisions(
        initialDivisions,
        { type: "save", division: { ...district, ...patch } },
        true
      ).error,
      "invalid"
    )
  assert.equal(
    changeDivisions(
      initialDivisions,
      { type: "save", division: { ...district, code: "10101" } },
      true
    ).error,
    "duplicate"
  )
  assert.equal(
    changeDivisions(
      initialDivisions,
      { type: "save", division: { ...district, name: " Carmen " } },
      true
    ).error,
    "duplicate"
  )
  assert.equal(
    changeDivisions(
      initialDivisions,
      {
        type: "save",
        division: { ...initialDivisions[0], level: 1, parentId: "CR-2" },
      },
      true
    ).error,
    "invalid"
  )
  assert.equal(
    changeDivisions(initialDivisions, { type: "delete", id: "CR-1" }, true)
      .error,
    "children"
  )
  assert.equal(
    changeDivisions(
      initialDivisions,
      { type: "delete", id: "CR-10101" },
      true,
      ["CR-10101"]
    ).error,
    "referenced"
  )
  assert.equal(
    changeDivisions(initialDivisions, { type: "delete", id: "missing" }, true)
      .error,
    "missing"
  )
})
test("expansion reveals children in hierarchy order without orphaning rows", () => {
  assert.equal(visibleDivisions(initialDivisions, new Set()).length, 7)
  const rows = visibleDivisions(initialDivisions, new Set(["CR-1", "CR-101"]))
  assert.deepEqual(
    rows.slice(0, 3).map((n) => n.id),
    ["CR-1", "CR-101", "CR-10101"]
  )
  assert.ok(!rows.some((n) => n.id === "CR-201"))
  assert.equal(
    visibleDivisions(
      initialDivisions,
      new Set(initialDivisions.map((n) => n.id))
    ).length,
    583
  )
})

test("measurements support unknown values and below-sea-level altitudes but reject invalid numbers", () => {
  const save = (patch: Partial<TerritorialDivision>) =>
    changeDivisions(
      initialDivisions,
      { type: "save", division: { ...district, ...patch } },
      true
    )
  for (const patch of [
    { area: 1.25, altitude: -12.5 },
    { area: null, altitude: 0 },
    { area: 12.345678, altitude: null },
  ]) {
    const result = save(patch)
    assert.equal(result.error, undefined)
    assert.equal(result.divisions.at(-1)?.area, patch.area)
    assert.equal(result.divisions.at(-1)?.altitude, patch.altitude)
  }
  for (const patch of [
    { area: 0 },
    { area: -1 },
    { area: NaN },
    { area: Infinity },
    { altitude: NaN },
    { altitude: Infinity },
  ])
    assert.equal(save(patch).error, "invalid")
})
test("normalized names are generated consistently on name changes rather than trusting submitted values", () => {
  assert.equal(normalizeDivisionName("  SAN  JOSÉ  "), "san jose")
  assert.equal(normalizeDivisionName("Peñas Blancas"), "penas blancas")
  const result = changeDivisions(
    initialDivisions,
    {
      type: "save",
      division: { ...district, name: "  RÍO  AZÚL ", normalized_name: "stale" },
    },
    true
  )
  assert.equal(result.divisions.at(-1)?.normalized_name, "rio azul")
  assert.ok(
    initialDivisions.every(
      (n) => n.normalized_name === normalizeDivisionName(n.name)
    )
  )
})
test("legacy catalogs acquire measurements without overwriting saved edits or explicit unknown values", () => {
  const legacy = {
    id: "CR-1",
    name: "Edited San José",
    code: "1",
    level: 0,
    parentId: null,
  }
  const [upgraded] = hydrateDivisions([legacy])
  assert.equal(upgraded.name, legacy.name)
  assert.equal(upgraded.area, 4969.73)
  assert.equal(upgraded.altitude, null)
  assert.equal(upgraded.normalized_name, "edited san jose")
  assert.equal(hydrateDivisions([{ ...upgraded, area: null }])[0].area, null)
  assert.equal(
    hydrateDivisions([{ ...legacy, id: "custom-node" }])[0].area,
    null
  )
  assert.ok(
    initialDivisions.every(
      (n) => n.area !== null && n.area > 0 && n.altitude === null
    )
  )
})
