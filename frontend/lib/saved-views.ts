import { defaultQuery, querySchema, type Category, type Query } from "./domain"
import { defaultColumns, viewColumns } from "./listing-view"
import type { PreviewState, SavedView } from "./preview-store"
export function viewMatches(view: SavedView, query: Query, columns: string[]) {
  return (
    JSON.stringify({
      expression: view.query.expression,
      currency: view.query.currency,
      sorts: view.query.sorts,
    }) ===
      JSON.stringify({
        expression: query.expression,
        currency: query.currency,
        sorts: query.sorts,
      }) &&
    JSON.stringify(viewColumns(query.category, view.columns, columns)) ===
      JSON.stringify(columns)
  )
}
export function applySavedView(
  state: PreviewState,
  id: string,
  category: Category
): PreviewState {
  const view = state.savedFilters.find(
    (view) =>
      view.id === id &&
      view.owner === state.user &&
      view.organization === state.organization &&
      view.query.category === category
  )
  if (!view) return state
  const key = `${state.user}:${category}`
  const current = state.queries[key]
  const parsed = querySchema.safeParse({
    ...view.query,
    page: 1,
    pageSize: current?.pageSize ?? 25,
    tagAssignments: undefined,
  })
  if (!parsed.success) return state
  return {
    ...state,
    queries: { ...state.queries, [key]: parsed.data },
    columns: {
      ...state.columns,
      [key]: viewColumns(category, view.columns, state.columns[key]),
    },
    appliedViewIds: { ...state.appliedViewIds, [key]: id },
  }
}

export function applyDefaultView(
  state: PreviewState,
  category: Category
): PreviewState {
  const key = `${state.user}:${category}`
  const pageSize = state.queries[key]?.pageSize
  const query = defaultQuery(category)
  if (pageSize && [25, 50, 100].includes(pageSize)) query.pageSize = pageSize
  return {
    ...state,
    queries: { ...state.queries, [key]: query },
    columns: { ...state.columns, [key]: defaultColumns(category) },
    appliedViewIds: { ...state.appliedViewIds, [key]: "__default__" },
  }
}
export function isDefaultView(query: Query, columns: string[]): boolean {
  const defaults = defaultQuery(query.category)
  return (
    query.expression.groups.length === 0 &&
    query.currency === null &&
    JSON.stringify(query.sorts) === JSON.stringify(defaults.sorts) &&
    JSON.stringify(columns) === JSON.stringify(defaultColumns(query.category))
  )
}
