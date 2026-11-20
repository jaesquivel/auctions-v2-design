import test from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import {
  defaultQuery,
  matchesTerm,
  queryItems,
  querySchema,
  relativeDate,
  type Item,
  type Term,
} from "../lib/domain"
import { filterDraft, draftQuery } from "../lib/filter-draft"
const fixture = JSON.parse(
  readFileSync(new URL("../data/listings.json", import.meta.url), "utf8")
)[0] as Item
const tags = (operator: Term["operator"], actual: string[]) =>
  matchesTerm(
    fixture,
    { field: "tag", operator, value: "", tagIds: ["a", "b"] },
    { [fixture.id]: actual }
  )
test("tag operators compare sets, including items with no tags", () => {
  assert.equal(tags("anyOf", ["a", "c"]), true)
  assert.equal(tags("anyOf", []), false)
  assert.equal(tags("allOf", ["a", "b", "c"]), true)
  assert.equal(tags("allOf", ["a"]), false)
  assert.equal(tags("noneOf", []), true)
  assert.equal(tags("noneOf", ["c"]), true)
  assert.equal(tags("noneOf", ["b"]), false)
  assert.equal(tags("exactly", ["b", "a"]), true)
  assert.equal(tags("exactly", ["a", "b", "c"]), false)
  assert.equal(tags("exactly", ["a"]), false)
  assert.equal(tags("exactly", []), false)
})
test("absolute dates use strict before/after and exact calendar equality", () => {
  const item = { ...fixture, date: "2026-11-20" }
  const match = (operator: Term["operator"], value: string) =>
    matchesTerm(item, { field: "date", operator, value }, undefined)
  assert.equal(match("at", "2026-11-20"), true)
  assert.equal(match("before", "2026-11-20"), false)
  assert.equal(match("after", "2026-11-20"), false)
  assert.equal(match("before", "2026-11-21"), true)
  assert.equal(match("after", "2026-11-19"), true)
  assert.equal(
    matchesTerm(
      { ...item, date: null },
      { field: "date", operator: "before", value: "2026-11-21" },
      undefined
    ),
    false
  )
})
test("relative dates use instance calendar, leap/year boundaries, and fresh execution time", () => {
  assert.equal(relativeDate(0, new Date("2026-11-21T02:00:00Z")), "2026-11-20")
  assert.equal(relativeDate(1, new Date("2026-12-31T18:00:00Z")), "2027-01-01")
  assert.equal(relativeDate(-1, new Date("2028-03-01T18:00:00Z")), "2028-02-29")
  const q = defaultQuery("properties")
  q.expression.groups = [
    {
      operator: "AND",
      terms: [
        { field: "date", operator: "at", dateMode: "relative", value: "-7" },
      ],
    },
  ]
  const item = { ...fixture, date: "2026-11-13" }
  assert.equal(queryItems([item], q, new Date("2026-11-20T18:00:00Z")).total, 1)
  assert.equal(queryItems([item], q, new Date("2026-11-21T18:00:00Z")).total, 0)
})
test("validation rejects invalid sets, operands, offsets and cross-field operators", () => {
  const q = defaultQuery("properties")
  for (const term of [
    { field: "tag", operator: "anyOf", value: "", tagIds: [] },
    { field: "tag", operator: "exactly", value: "", tagIds: ["a", "a"] },
    { field: "date", operator: "at", dateMode: "relative", value: "1.5" },
    { field: "date", operator: "before", dateMode: "relative", value: "36501" },
    { field: "date", operator: "at", value: "2026-02-30" },
    { field: "type", operator: "anyOf", value: "house" },
    { field: "date", operator: "allOf", value: "2026-11-20" },
  ])
    assert.equal(
      querySchema.safeParse({
        ...q,
        expression: {
          operator: "AND",
          groups: [{ operator: "AND", terms: [term] }],
        },
      }).success,
      false
    )
})
test("legacy saved tag/date terms retain equivalent results after editor migration", () => {
  const q = defaultQuery("properties")
  q.tagAssignments = { [fixture.id]: ["a"] }
  q.expression.groups = [
    {
      operator: "AND",
      terms: [
        { field: "tag", operator: "eq", value: "a" },
        { field: "date", operator: "gte", value: "2026-11-20" },
      ],
    },
  ]
  const item = { ...fixture, date: "2026-11-20" }
  const migrated = draftQuery(filterDraft(q))
  assert.equal(queryItems([item], q).total, queryItems([item], migrated).total)
  assert.deepEqual(migrated.expression.groups[0].terms[1], {
    field: "date",
    operator: "after",
    dateMode: "specific",
    value: "2026-11-19",
  })
  assert.equal(q.expression.groups[0].terms[1].value, "2026-11-20")
})

for (const category of ["properties", "vehicles", "other"] as const) {
  test(`${category}: all three rounds filter their own dates and exact base amounts`, () => {
    const item: Item = {
      ...fixture,
      category,
      date: "2026-01-01",
      amount: "999",
      currency: "CRC",
      auctionRounds: [1, 2, 3].map((n) => ({
        round: n,
        date: `2026-11-${20 + n}`,
        time: null,
        timezone: "America/Costa_Rica",
        baseOffer: { amount: `${n}00.05`, currency: "CRC" },
      })),
    }
    for (const n of [1, 2, 3]) {
      const q = defaultQuery(category)
      q.currency = "CRC"
      q.expression.groups = [
        {
          operator: "AND",
          terms: [
            {
              field: `round${n}Date` as Term["field"],
              operator: "at",
              value: `2026-11-${20 + n}`,
            },
            {
              field: `round${n}Amount` as Term["field"],
              operator: "eq",
              value: `${n}00.05`,
            },
          ],
        },
      ]
      assert.equal(queryItems([item], q).total, 1)
      q.expression.groups[0].terms[0] = {
        field: `round${n}Date` as Term["field"],
        operator: "at",
        dateMode: "relative",
        value: String(n),
      }
      assert.equal(
        queryItems([item], q, new Date("2026-11-20T18:00:00Z")).total,
        1
      )
      q.expression.groups[0].terms[1].value = `${n}00.06`
      assert.equal(
        queryItems([item], q, new Date("2026-11-20T18:00:00Z")).total,
        0
      )
    }
    const q = defaultQuery(category)
    q.expression.groups = [
      {
        operator: "AND",
        terms: [{ field: "round3Amount", operator: "gte", value: "300" }],
      },
    ]
    assert.equal(querySchema.safeParse(q).success, false)
    q.currency = "CRC"
    assert.equal(
      queryItems(
        [{ ...item, auctionRounds: item.auctionRounds.slice(0, 2) }],
        q
      ).total,
      0
    )
    assert.equal(
      queryItems(
        [
          {
            ...item,
            auctionRounds: item.auctionRounds.map((r) => ({
              ...r,
              baseOffer: { amount: "500", currency: "USD" },
            })),
          },
        ],
        q
      ).total,
      0
    )
  })
}

test("currency belongs to each amount condition and OR supports different currencies", () => {
  const q = defaultQuery("properties")
  q.expression = {
    operator: "OR",
    groups: [
      {
        operator: "OR",
        terms: [
          { field: "amount", operator: "eq", value: "100", currency: "CRC" },
          {
            field: "round2Amount",
            operator: "eq",
            value: "200",
            currency: "USD",
          },
        ],
      },
    ],
  }
  const crc = {
    ...fixture,
    id: "crc",
    amount: "100",
    currency: "CRC",
    auctionRounds: [],
  }
  const usd = {
    ...fixture,
    id: "usd",
    amount: "999",
    currency: "CRC",
    auctionRounds: [
      {
        round: 2,
        date: null,
        time: null,
        timezone: "America/Costa_Rica",
        baseOffer: { amount: "200", currency: "USD" },
      },
    ],
  }
  const wrong = {
    ...fixture,
    id: "wrong",
    amount: "100",
    currency: "USD",
    auctionRounds: [],
  }
  assert.deepEqual(
    queryItems([crc, usd, wrong], q)
      .items.map((i) => i.id)
      .sort(),
    ["crc", "usd"]
  )
  q.sorts = [{ field: "amount", direction: "asc" }]
  assert.equal(querySchema.safeParse(q).success, false)
  q.expression = {
    operator: "AND",
    groups: [
      {
        operator: "AND",
        terms: [
          { field: "amount", operator: "gte", value: "1", currency: "CRC" },
        ],
      },
    ],
  }
  assert.equal(querySchema.safeParse(q).success, true)
  assert.deepEqual(
    queryItems([crc, wrong], q).items.map((i) => i.id),
    ["crc"]
  )
})

test("per-condition currency is required and cannot be attached to unrelated fields", () => {
  const q = defaultQuery("properties")
  for (const field of [
    "amount",
    "round1Amount",
    "round2Amount",
    "round3Amount",
  ] as const) {
    q.expression.groups = [
      { operator: "AND", terms: [{ field, operator: "eq", value: "100" }] },
    ]
    assert.equal(querySchema.safeParse(q).success, false)
    q.expression.groups[0].terms[0].currency = "USD"
    assert.equal(querySchema.safeParse(q).success, true)
  }
  q.expression.groups = [
    {
      operator: "AND",
      terms: [
        {
          field: "text",
          operator: "contains",
          value: "example",
          currency: "CRC",
        },
      ],
    },
  ]
  assert.equal(querySchema.safeParse(q).success, false)
})
