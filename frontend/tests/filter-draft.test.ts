import test from "node:test"
import assert from "node:assert/strict"
import { defaultQuery, querySchema } from "../lib/domain"
import {
  blankGroup,
  blankTerm,
  filterDraft,
  draftQuery,
} from "../lib/filter-draft"

test("empty query opens with one unselected condition and still applies as no filter", () => {
  const query = defaultQuery("properties")
  const draft = filterDraft(query)
  assert.deepEqual(draft.expression.groups, [blankGroup()])
  assert.deepEqual(draftQuery(draft), query)
  assert.equal(querySchema.safeParse(draftQuery(draft)).success, true)
  assert.deepEqual(query.expression.groups, [])
})

test("unselected OR groups cannot broaden a real condition", () => {
  const draft = filterDraft(defaultQuery("vehicles"))
  draft.expression.operator = "OR"
  draft.expression.groups = [
    blankGroup(),
    {
      operator: "OR",
      terms: [
        blankTerm(),
        { field: "text", operator: "contains", value: "example" },
      ],
    },
  ]
  assert.deepEqual(draftQuery(draft).expression, {
    operator: "OR",
    groups: [
      {
        operator: "OR",
        terms: [{ field: "text", operator: "contains", value: "example" }],
      },
    ],
  })
})

test("selected incomplete conditions keep validation errors", () => {
  const draft = filterDraft(defaultQuery("properties"))
  draft.expression.groups[0].terms = [
    { field: "amount", operator: "gte", value: "100" },
  ]
  assert.equal(querySchema.safeParse(draftQuery(draft)).success, false)
})

test("saved filters load as detached drafts without losing criteria or ordering", () => {
  const query = defaultQuery("other")
  query.expression = {
    operator: "OR",
    groups: [
      {
        operator: "AND",
        terms: [{ field: "quality", operator: "eq", value: "reviewed" }],
      },
    ],
  }
  const draft = filterDraft(query)
  assert.deepEqual(draftQuery(draft), query)
  draft.expression.groups[0].terms[0].value = "needs_review"
  assert.equal(query.expression.groups[0].terms[0].value, "reviewed")
})
