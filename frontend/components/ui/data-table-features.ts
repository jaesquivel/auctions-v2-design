import {
  tableFeatures,
  columnVisibilityFeature,
  rowSortingFeature,
  rowPaginationFeature,
} from "@tanstack/react-table"

// Data arrives in authoritative server/domain order. Do not register client
// sorted/filtered/paginated row models: an item page is already paginated.
export const dataTableFeatures = tableFeatures({
  columnVisibilityFeature,
  rowSortingFeature,
  rowPaginationFeature,
})
export type DataTableFeatures = typeof dataTableFeatures
