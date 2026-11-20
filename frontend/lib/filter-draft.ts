import { isAmountField, isDateField, type Query, type Term } from "./domain"
export type DraftTerm = Omit<Term, "field"> & { field: Term["field"] | "" }
export type DraftGroup = { operator: "AND" | "OR"; terms: DraftTerm[] }
export type FilterDraft = Omit<Query, "expression"> & {
  expression: { operator: "AND" | "OR"; groups: DraftGroup[] }
}
export const blankTerm = (): DraftTerm => ({
  field: "",
  operator: "eq",
  value: "",
})
export const blankGroup = (): DraftGroup => ({
  operator: "AND",
  terms: [blankTerm()],
})
export function filterDraft(query: Query): FilterDraft {
  const draft: FilterDraft = structuredClone(query)
  if (!draft.expression.groups.length) draft.expression.groups = [blankGroup()]
  for (const group of draft.expression.groups) {
    if (!group.terms.length) group.terms = [blankTerm()]
    for (const term of group.terms) {
      if (isAmountField(term.field) && !term.currency && query.currency)
        term.currency = query.currency
      if (term.field === "tag" && term.operator === "eq") {
        term.operator = "anyOf"
        term.tagIds = term.value ? [term.value] : undefined
        term.value = ""
      }
      if (
        isDateField(term.field) &&
        ["eq", "gte", "lte"].includes(term.operator)
      ) {
        // Preserve inclusive legacy boundaries using equivalent strict calendar dates.
        if (term.operator !== "eq" && !Number.isNaN(Date.parse(term.value))) {
          const date = new Date(term.value + "T00:00:00Z")
          date.setUTCDate(
            date.getUTCDate() + (term.operator === "gte" ? -1 : 1)
          )
          term.value = date.toISOString().slice(0, 10)
        }
        term.operator =
          term.operator === "gte"
            ? "after"
            : term.operator === "lte"
              ? "before"
              : "at"
        term.dateMode = "specific"
      }
    }
  }
  // Legacy global currency remains only when required by amount sorting.
  if (!draft.sorts.some((sort) => sort.field === "amount"))
    draft.currency = null
  return draft
}
// Unselected rows are editor placeholders, never conditions sent to the server.
export function draftQuery(draft: FilterDraft): Query {
  return {
    ...draft,
    expression: {
      ...draft.expression,
      groups: draft.expression.groups
        .map((group) => ({
          ...group,
          terms: group.terms.filter((term): term is Term => term.field !== ""),
        }))
        .filter((group) => group.terms.length > 0),
    },
  }
}
