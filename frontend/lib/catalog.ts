import "server-only"
import raw from "@/data/listings.json"
import notices from "@/data/notices.json"
import { Item, queryItems, Query } from "./domain"
export const catalog = (raw as unknown as Item[]).map((item) => {
  if (item.category === "properties") return item
  const { locality, region, ...rest } = item
  void locality
  void region
  return { ...rest, region: "" } as Item
})
export function listing(query: Query) {
  return queryItems(catalog, query)
}
export function detail(id: string) {
  const item = catalog.find((i) => i.id === id)
  if (!item) return null
  const related = catalog
    .filter((i) => i.auctionId === item.auctionId && i.id !== item.id)
    .map((i) => ({
      id: i.id,
      titleEs: i.titleEs,
      titleEn: i.titleEn,
      category: i.category,
      lotId: i.lotId,
    }))
  const originalText = (notices as Record<string, string>)[item.id]
  return { item, related, originalText }
}
