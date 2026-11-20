import type { Category } from "./domain"
export const columnKeys = (category: Category) => [
  "tags",
  ...(category === "properties"
    ? ["registrationNumber", "locality"]
    : category === "vehicles"
      ? ["plate"]
      : []),
  "item",
  "type",
  ...(category === "properties" ? ["area"] : []),
  "amount",
  "date",
  "firstRoundDate",
  "firstRoundTime",
  "firstRoundBase",
  "secondRoundDate",
  "secondRoundTime",
  "secondRoundBase",
  "thirdRoundDate",
  "thirdRoundTime",
  "thirdRoundBase",
  "caseNumber",
  "reference",
]
export const defaultColumns = (category: Category) =>
  columnKeys(category).filter((k) => !/(first|second|third)Round/.test(k))

export function viewColumns(
  category: Category,
  saved?: string[],
  fallback?: string[]
): string[] {
  const available = columnKeys(category)
  const selection = saved ?? fallback ?? defaultColumns(category)
  const valid = available.filter((key) => selection.includes(key))
  return valid.length ? valid : defaultColumns(category)
}
