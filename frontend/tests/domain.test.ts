import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import {
  Item,
  defaultQuery,
  queryItems,
  querySchema,
  roundCost,
  minorUnits,
  researchSchema,
} from "../lib/domain.ts"
const items = JSON.parse(
  readFileSync(new URL("../data/listings.json", import.meta.url), "utf8")
) as Item[]
test("150 unique fictional items, 50 per category", () => {
  assert.equal(new Set(items.map((i) => i.id)).size, 150)
  for (const category of ["properties", "vehicles", "other"])
    assert.equal(items.filter((i) => i.category === category).length, 50)
})
test("AND/OR groups retain outer parentheses and category constraint", () => {
  const q = defaultQuery("properties")
  q.expression = {
    operator: "OR",
    groups: [
      {
        operator: "AND",
        terms: [
          { field: "text", operator: "contains", value: "Santa Ana" },
          { field: "type", operator: "eq", value: "house" },
        ],
      },
      {
        operator: "AND",
        terms: [{ field: "type", operator: "eq", value: "car" }],
      },
    ],
  }
  const data = queryItems(items, q)
  assert.deepEqual(
    data.items.map((i) => i.id),
    ["DEMO-A01"]
  )
})
test("inner OR can be combined with outer AND", () => {
  const q = defaultQuery("properties")
  q.expression = {
    operator: "AND",
    groups: [
      {
        operator: "OR",
        terms: [
          { field: "text", operator: "contains", value: "Santa Ana" },
          { field: "text", operator: "contains", value: "Grecia" },
        ],
      },
      {
        operator: "AND",
        terms: [{ field: "amount", operator: "gte", value: "60000000" }],
      },
    ],
  }
  q.currency = "CRC"
  assert.deepEqual(
    queryItems(items, q).items.map((i) => i.id),
    ["DEMO-A01"]
  )
})
test("server sorts before pagination, stable pages and nulls last", () => {
  const data = items
    .filter((i) => i.category === "properties")
    .map((i, index) => ({ ...i, date: index === 0 ? null : i.date }))
  const q = {
    ...defaultQuery("properties"),
    pageSize: 5,
    sorts: [{ field: "date" as const, direction: "desc" as const }],
  }
  const all = queryItems(data, { ...q, pageSize: 100 })
  const pages = Array.from({ length: 10 }, (_, i) =>
    queryItems(data, { ...q, page: i + 1 }).items.map((i) => i.id)
  ).flat()
  assert.deepEqual(
    pages,
    all.items.map((i) => i.id)
  )
  assert.equal(all.items.at(-1)?.date, null)
})
test("page sizes and invalid categories are rejected, page clamps after result changes", () => {
  assert.equal(
    querySchema.safeParse({ ...defaultQuery("properties"), pageSize: 7 })
      .success,
    false
  )
  assert.equal(
    querySchema.safeParse({
      ...defaultQuery("properties"),
      category: "foreign",
    }).success,
    false
  )
  assert.equal(
    queryItems(items, { ...defaultQuery("properties"), page: 999 }).page,
    2
  )
})
test("amount sorts and amount terms require one currency", () => {
  assert.equal(
    querySchema.safeParse({
      ...defaultQuery("properties"),
      sorts: [{ field: "amount", direction: "asc" }],
    }).success,
    false
  )
  const q = {
    ...defaultQuery("properties"),
    currency: "USD",
    sorts: [{ field: "amount", direction: "asc" }],
  }
  assert.equal(
    queryItems(items, q).items.every((i) => i.currency === "USD"),
    true
  )
})
test("invalid operators, impossible dates and empty groups are rejected", () => {
  for (const term of [
    { field: "amount", operator: "contains", value: "10" },
    { field: "date", operator: "eq", value: "2026-02-31" },
    { field: "type", operator: "gte", value: "house" },
  ])
    assert.equal(
      querySchema.safeParse({
        ...defaultQuery("properties"),
        currency: "CRC",
        expression: {
          operator: "AND",
          groups: [{ operator: "AND", terms: [term] }],
        },
      }).success,
      false
    )
  assert.equal(
    querySchema.safeParse({
      ...defaultQuery("properties"),
      expression: { operator: "AND", groups: [{ operator: "AND", terms: [] }] },
    }).success,
    false
  )
})
test("non-property queries cannot add location fields", () => {
  assert.equal(
    querySchema.safeParse({
      ...defaultQuery("vehicles"),
      expression: {
        operator: "AND",
        groups: [
          {
            operator: "AND",
            terms: [{ field: "locality", operator: "eq", value: "San Jose" }],
          },
        ],
      },
    }).success,
    false
  )
})
test("tag matching uses provided organization-scoped assignments", () => {
  const q = defaultQuery("properties")
  q.expression = {
    operator: "AND",
    groups: [
      {
        operator: "AND",
        terms: [{ field: "tag", operator: "eq", value: "tag-a" }],
      },
    ],
  }
  assert.equal(
    queryItems(items, { ...q, tagAssignments: { "DEMO-A01": ["tag-a"] } })
      .total,
    1
  )
  assert.equal(queryItems(items, { ...q, tagAssignments: {} }).total, 0)
})
test("money calculations remain exact, unknown guarantee never defaults to zero", () => {
  assert.equal(minorUnits("99999999999999.99"), 9999999999999999n)
  const item = items.find((i) => i.id === "DEMO-A07")!
  assert.ok(roundCost(item.auctionRounds[0], item.roundCostRules?.guarantee))
  assert.equal(roundCost(item.auctionRounds[0]), null)
  assert.equal(
    roundCost(item.auctionRounds[0], {
      ...item.roundCostRules!.guarantee!,
      verified: false,
    }),
    null
  )
  const calculated = roundCost(
    {
      round: 1,
      date: null,
      time: null,
      timezone: "America/Costa_Rica",
      baseOffer: { currency: "CRC", amount: "0.05" },
    },
    {
      kind: "percentOfBase",
      verified: true,
      source: "notice",
      reference: "DEMO",
      currency: "CRC",
      basisPoints: 1000,
      rounding: "halfUp",
    }
  )
  assert.equal(calculated?.amount, "0.01")
})
test("research accepts exact decimal strings and rejects negative/excess precision", () => {
  const base = {
    notes: "Draft",
    appraisalCurrency: "CRC",
    marketCurrency: "USD",
    appraisalAmount: "",
    marketAmount: "",
  }
  assert.equal(researchSchema.safeParse(base).success, true)
  assert.equal(
    researchSchema.safeParse({ ...base, marketAmount: "-1" }).success,
    false
  )
  assert.equal(
    researchSchema.safeParse({ ...base, marketAmount: "1.001" }).success,
    false
  )
})
test("query operations preserve immutable source fixtures and original text", () => {
  const before = JSON.stringify(items)
  queryItems(items, {
    ...defaultQuery("properties"),
    currency: "CRC",
    sorts: [{ field: "amount", direction: "desc" }],
  })
  assert.equal(JSON.stringify(items), before)
  const notices = JSON.parse(
    readFileSync(new URL("../data/notices.json", import.meta.url), "utf8")
  )
  assert.equal(Object.keys(notices).length, 150)
  assert.match(notices["DEMO-A07"], /DEMO-NOTICE-TERMS-A07/)
})
