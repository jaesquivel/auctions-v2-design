import { z } from "zod"

export const categories = ["properties", "vehicles", "other"] as const
export type Category = (typeof categories)[number]
export type Locale = "es" | "en"
export type Role = "ADMIN" | "MANAGER" | "USER"
export type Money = { amount: string; currency: string }
export type Round = {
  round: number
  date: string | null
  time: string | null
  timezone: string
  baseOffer: Money | null
}
export type CostRule = {
  kind: string
  verified: boolean
  source: string
  reference: string
  currency: string
  amount?: string
  basisPoints?: number
  rounding?: string
}
export type Item = {
  id: string
  category: Category
  type: string
  region: string
  locality?: string
  titleEs: string
  titleEn: string
  area: number | null
  amount: string
  currency: string
  date: string | null
  time: string | null
  quality: string
  mapped: boolean
  registrationNumber?: string
  plate?: string
  nextAuctionRound: number
  auctionRounds: Round[]
  auctionId: string
  saleMode: string
  lotId: string | null
  governmentTaxValue:
    (Money & { taxYear: number; sourceReference: string }) | null
  noticeDescription: string | null
  noticeLiens: string | null
  auctionKind: string
  noticeReference: string | null
  caseNumber: string | null
  auctionParties: { role: string; name: string }[]
  auctionVenue: string | null
  auctionOffice: string | null
  noticePublication: {
    name: string
    issue: string
    publishedAt: string
    locator: string
    url: string | null
  } | null
  extractionNotes: string[]
  roundCostRules?: { guarantee?: CostRule; participationFee?: CostRule }
}
export const fields = [
  "text",
  "type",
  "region",
  "locality",
  "amount",
  "date",
  "area",
  "quality",
  "tag",
] as const
export const termSchema = z.object({
  field: z.enum(fields),
  operator: z.enum(["contains", "eq", "gte", "lte", "isUnknown"]),
  value: z.string().max(200),
})
export const expressionSchema = z.object({
  operator: z.enum(["AND", "OR"]),
  groups: z
    .array(
      z.object({
        operator: z.enum(["AND", "OR"]),
        terms: z.array(termSchema).min(1).max(20),
      })
    )
    .max(10),
})
export type Expression = z.infer<typeof expressionSchema>
export type Term = z.infer<typeof termSchema>
export const sortFields = [
  "date",
  "amount",
  "locality",
  "type",
  "area",
  "registrationNumber",
  "plate",
  "caseNumber",
  "reference",
] as const
export type Sort = {
  field: (typeof sortFields)[number]
  direction: "asc" | "desc"
}
export const querySchema = z
  .object({
    category: z.enum(categories),
    page: z.number().int().min(1).max(100000),
    pageSize: z.number().refine((n) => [5, 10, 25, 50, 100].includes(n)),
    expression: expressionSchema,
    currency: z.enum(["CRC", "USD"]).nullable(),
    sorts: z
      .array(
        z.object({
          field: z.enum(sortFields),
          direction: z.enum(["asc", "desc"]),
        })
      )
      .max(5),
    tagAssignments: z
      .record(z.string().max(80), z.array(z.string().max(80)).max(100))
      .optional(),
  })
  .superRefine((q, ctx) => {
    const terms = q.expression.groups.flatMap((g) => g.terms)
    const issue = (message: string) => ctx.addIssue({ code: "custom", message })
    if (terms.length > 100) issue("Too many terms")
    if (
      (q.sorts.some((s) => s.field === "amount") ||
        terms.some(
          (t) => t.field === "amount" && t.operator !== "isUnknown"
        )) &&
      !q.currency
    )
      issue("amountCurrencyRequired")
    if (new Set(q.sorts.map((s) => s.field)).size !== q.sorts.length)
      issue("Duplicate sorts")
    if (
      q.category !== "properties" &&
      (terms.some((t) => ["locality", "region", "area"].includes(t.field)) ||
        q.sorts.some((s) => ["locality", "area"].includes(s.field)))
    )
      issue("Incompatible category field")
    for (const t of terms) {
      if (t.operator !== "isUnknown" && !t.value.trim()) issue("Empty term")
      if (t.operator === "isUnknown") continue
      if (["amount", "area"].includes(t.field)) {
        if (
          !/^(0|[1-9]\d{0,13})(\.\d{1,2})?$/.test(t.value) ||
          !["eq", "gte", "lte"].includes(t.operator)
        )
          issue("Invalid numeric term")
      } else if (t.field === "date") {
        if (
          !/^\d{4}-\d{2}-\d{2}$/.test(t.value) ||
          Number.isNaN(Date.parse(t.value)) ||
          new Date(t.value).toISOString().slice(0, 10) !== t.value ||
          !["eq", "gte", "lte"].includes(t.operator)
        )
          issue("Invalid date")
      } else if (
        !["eq", "contains"].includes(t.operator) ||
        (["tag", "type", "region", "quality"].includes(t.field) &&
          t.operator !== "eq")
      )
        issue("Invalid text operator")
    }
  })
export type Query = z.infer<typeof querySchema>
export type ItemPage = {
  items: Item[]
  total: number
  page: number
  pageSize: number
  pageCount: number
}
export const emptyExpression = (): Expression => ({
  operator: "AND",
  groups: [],
})
export const defaultQuery = (category: Category): Query => ({
  category,
  page: 1,
  pageSize: 25,
  expression: emptyExpression(),
  currency: null,
  sorts: [{ field: "date", direction: "asc" }],
})
const normalize = (v: unknown) =>
  String(v ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase()
export const minorUnits = (s: string) => {
  if (!/^(0|[1-9]\d{0,13})(\.\d{1,2})?$/.test(s)) throw Error("Invalid money")
  const [a, b = ""] = s.split(".")
  return BigInt(a) * 100n + BigInt(b.padEnd(2, "0"))
}
export function matchesTerm(
  item: Item,
  t: Term,
  assignments: Query["tagAssignments"]
) {
  let value: unknown =
    t.field === "text"
      ? [
          item.titleEs,
          item.titleEn,
          item.noticeReference,
          item.caseNumber,
          item.registrationNumber,
          item.plate,
        ].join(" ")
      : t.field === "tag"
        ? assignments?.[item.id]
        : item[t.field]
  if (t.operator === "isUnknown")
    return value === null || value === undefined || value === ""
  if (value === null || value === undefined || value === "") return false
  if (t.field === "tag") return Array.isArray(value) && value.includes(t.value)
  if (t.field === "amount") {
    const a = minorUnits(String(value)),
      b = minorUnits(t.value)
    return t.operator === "gte"
      ? a >= b
      : t.operator === "lte"
        ? a <= b
        : a === b
  }
  if (t.field === "area") {
    value = Number(value)
    const b = Number(t.value)
    return t.operator === "gte"
      ? Number(value) >= b
      : t.operator === "lte"
        ? Number(value) <= b
        : value === b
  }
  if (t.field === "date")
    return t.operator === "gte"
      ? String(value) >= t.value
      : t.operator === "lte"
        ? String(value) <= t.value
        : value === t.value
  return t.operator === "contains"
    ? normalize(value).includes(normalize(t.value))
    : normalize(value) === normalize(t.value)
}
export function queryItems(items: Item[], input: unknown): ItemPage {
  const q = querySchema.parse(input)
  const combine = (xs: boolean[], op: string) =>
    op === "AND" ? xs.every(Boolean) : xs.some(Boolean)
  const rows = items.filter(
    (i) =>
      i.category === q.category &&
      (!q.currency || i.currency === q.currency) &&
      (!q.expression.groups.length ||
        combine(
          q.expression.groups.map((g) =>
            combine(
              g.terms.map((t) => matchesTerm(i, t, q.tagAssignments)),
              g.operator
            )
          ),
          q.expression.operator
        ))
  )
  rows.sort((a, b) => {
    for (const sort of q.sorts) {
      const key = sort.field === "reference" ? "noticeReference" : sort.field
      const av = a[key],
        bv = b[key]
      if (av == null || av === "") {
        if (bv != null && bv !== "") return 1
        continue
      }
      if (bv == null || bv === "") return -1
      const cmp =
        key === "amount"
          ? minorUnits(String(av)) < minorUnits(String(bv))
            ? -1
            : minorUnits(String(av)) > minorUnits(String(bv))
              ? 1
              : 0
          : key === "area"
            ? Number(av) - Number(bv)
            : normalize(av).localeCompare(normalize(bv))
      if (cmp) return sort.direction === "asc" ? cmp : -cmp
    }
    return a.id.localeCompare(b.id)
  })
  const pageCount = Math.max(1, Math.ceil(rows.length / q.pageSize))
  const page = Math.min(q.page, pageCount)
  return {
    items: rows.slice((page - 1) * q.pageSize, page * q.pageSize),
    total: rows.length,
    page,
    pageSize: q.pageSize,
    pageCount,
  }
}
export function roundCost(round: Round, rule?: CostRule): Money | null {
  if (
    !rule?.verified ||
    !["notice", "countryRule"].includes(rule.source) ||
    !rule.reference
  )
    return null
  try {
    let n: bigint
    if (rule.kind === "fixed") n = minorUnits(rule.amount ?? "")
    else if (
      rule.kind === "percentOfBase" &&
      rule.rounding === "halfUp" &&
      round.baseOffer?.currency === rule.currency &&
      Number.isInteger(rule.basisPoints) &&
      rule.basisPoints! >= 0 &&
      rule.basisPoints! <= 10000
    )
      n =
        (minorUnits(round.baseOffer.amount) * BigInt(rule.basisPoints!) +
          5000n) /
        10000n
    else return null
    return {
      currency: rule.currency,
      amount: `${n / 100n}.${String(n % 100n).padStart(2, "0")}`,
    }
  } catch {
    return null
  }
}
export const title = (i: Item, locale: string) =>
  locale === "es" ? i.titleEs : i.titleEn
export const formatMoney = (m: Money | null | undefined, locale: string) =>
  m
    ? new Intl.NumberFormat(locale === "es" ? "es-CR" : "en-US", {
        style: "currency",
        currency: m.currency,
        maximumFractionDigits: 2,
        currencyDisplay: "code",
      }).format(Number(m.amount))
    : "—"
export const formatDate = (s: string | null | undefined, locale: string) =>
  s
    ? new Intl.DateTimeFormat(locale === "es" ? "es-CR" : "en-US", {
        timeZone: "America/Costa_Rica",
        dateStyle: "medium",
      }).format(new Date(s + "T12:00:00Z"))
    : "—"
export const researchSchema = z.object({
  notes: z.string().max(10000),
  appraisalAmount: z
    .string()
    .refine((v) => !v || /^(0|[1-9]\d{0,13})(\.\d{1,2})?$/.test(v)),
  appraisalCurrency: z.enum(["CRC", "USD"]),
  marketAmount: z
    .string()
    .refine((v) => !v || /^(0|[1-9]\d{0,13})(\.\d{1,2})?$/.test(v)),
  marketCurrency: z.enum(["CRC", "USD"]),
})
export type Research = z.infer<typeof researchSchema>
