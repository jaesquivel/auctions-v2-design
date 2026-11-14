"use client"
import { useState, useEffect, useMemo, useCallback } from "react"
import { useTranslations, useLocale } from "next-intl"
import {
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Plus,
  X,
  Columns3,
  Pencil,
  Eye,
  FileText,
  List,
  Map,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { FieldTitle } from "@/components/ui/field"
import { DataTable, type DataTableColumn } from "@/components/ui/data-table"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  Category,
  Item,
  ItemPage,
  Sort,
  Query,
  defaultQuery,
  title,
  formatMoney,
  formatDate,
} from "@/lib/domain"
import { usePreview, storedQuery, queryKey } from "@/lib/preview-store"
import { Link, useRouter } from "@/i18n/navigation"
import { Choice, IconAction, PageHeading } from "./shared"
import { TagPicker } from "./tag-picker"
import dynamic from "next/dynamic"
const PropertyMap = dynamic(() => import("./property-map"), {
  ssr: false,
  loading: () => <Skeleton className="h-96" />,
})
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
const columnWidth = (key: string) =>
  ({
    tags: 220,
    item: 240,
    registrationNumber: 170,
    plate: 160,
    locality: 170,
    type: 130,
    area: 100,
    amount: 180,
    date: 220,
    caseNumber: 240,
    reference: 260,
  })[key] ?? 180
export function ItemGrid({ category }: { category: Category }) {
  const t = useTranslations()
  const locale = useLocale()
  const router = useRouter()
  const { state, update } = usePreview()
  const fallbackQuery = useMemo(() => defaultQuery(category), [category])
  const query = state.queries[queryKey(state.user, category)] ?? fallbackQuery
  const assignments = state.assignments[state.organization]
  const [response, setResponse] = useState<{
    key: string
    data?: ItemPage
    error?: string
  }>({ key: "" })
  const [retry, setRetry] = useState(0)
  const [view, setView] = useState("list")
  const payload = useMemo(
    () => ({
      ...query,
      tagAssignments: query.expression.groups.some((group) =>
        group.terms.some((term) => term.field === "tag")
      )
        ? assignments
        : undefined,
    }),
    [query, assignments]
  )
  const requestKey = JSON.stringify(payload)
  useEffect(() => {
    const controller = new AbortController()
    fetch("/api/items/query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: requestKey,
      signal: controller.signal,
    })
      .then(async (r) => {
        const data = await r.json()
        if (!r.ok) throw Error(data.error ?? "fetchError")
        return data
      })
      .then((data) => {
        if (!controller.signal.aborted) setResponse({ key: requestKey, data })
      })
      .catch((e) => {
        if (!controller.signal.aborted)
          setResponse({ key: requestKey, error: e.message })
      })
    return () => controller.abort()
  }, [requestKey, retry])
  const change = useCallback(
    (patch: Partial<Query>) =>
      update((s) => {
        const current = storedQuery(s, category)
        return {
          ...s,
          queries: {
            ...s.queries,
            [queryKey(s.user, category)]: { ...current, ...patch },
          },
        }
      }),
    [update, category]
  )
  const available = columnKeys(category)
  const selected =
    state.columns[queryKey(state.user, category)] ?? defaultColumns(category)
  const visible = available.filter((k) => selected.includes(k))
  const label = (key: string) =>
    t(
      (
        {
          locality: "location",
          amount: "base",
          date: "nextEvent",
          reference: "noticeReference",
        } as Record<string, string>
      )[key] ?? key
    )
  const sortOptions = [
    "date",
    "amount",
    "type",
    "reference",
    "caseNumber",
    ...(category === "properties"
      ? ["registrationNumber", "locality", "area"]
      : category === "vehicles"
        ? ["plate"]
        : []),
  ]
  const changeSort = (index: number, patch: Partial<Sort>) => {
    const sorts = query.sorts.map((s, i) =>
      i === index ? { ...s, ...patch } : s
    )
    if (sorts.some((s) => s.field === "amount") && !query.currency) {
      router.push(`/${category}/filters`)
      return
    }
    change({ sorts, page: 1 })
  }
  const sortColumn = (key: string, add: boolean) => {
    if (!sortOptions.includes(key)) return
    if (key === "amount" && !query.currency) {
      router.push(`/${category}/filters`)
      return
    }
    const old = query.sorts.find((s) => s.field === key)
    const value = {
      field: key as Sort["field"],
      direction: old?.direction === "asc" ? "desc" : "asc",
    } as Sort
    change({
      sorts: add
        ? [...query.sorts.filter((s) => s.field !== key), value].slice(0, 5)
        : [value],
      page: 1,
    })
  }
  const data = response.key === requestKey ? response.data : undefined
  const error = response.key === requestKey ? response.error : undefined
  const cell = (item: Item, key: string) => {
    if (key === "tags") return <TagPicker id={item.id} compact />
    if (key === "item")
      return (
        <Button variant="link" asChild>
          <Link href={`/${category}/${item.id}`} title={title(item, locale)}>
            <span className="truncate">{title(item, locale)}</span>
          </Link>
        </Button>
      )
    if (key === "amount") return formatMoney(item, locale)
    if (key === "date")
      return (
        <>
          {formatDate(item.date, locale)} · {t("auctionRound")}{" "}
          {item.nextAuctionRound}
        </>
      )
    if (key === "type") return t(item.type)
    if (key === "area")
      return item.area === null ? t("notReported") : `${item.area} m²`
    if (key === "reference") return item.noticeReference ?? t("notReported")
    if (key === "caseNumber")
      return item.auctionKind === "judicial"
        ? (item.caseNumber ?? t("notReported"))
        : "—"
    const match = /^(first|second|third)Round(Date|Time|Base)$/.exec(key)
    if (match) {
      const n = ["first", "second", "third"].indexOf(match[1]) + 1
      const round = item.auctionRounds.find((r) => r.round === n)
      return !round
        ? t("notReported")
        : match[2] === "Date"
          ? formatDate(round.date, locale)
          : match[2] === "Time"
            ? (round.time ?? t("notReported"))
            : formatMoney(round.baseOffer, locale)
    }
    return String(item[key as keyof Item] ?? t("notReported"))
  }
  // Keep TanStack cell component identities stable when tag assignments change;
  // otherwise a tag selection would remount its cell and close the Popover.
  const columns = useMemo<DataTableColumn<Item>[]>(
    () => [
      ...available.map((key): DataTableColumn<Item> => ({
        id: key,
        accessorFn: (item) =>
          key === "reference" ? item.noticeReference : item[key as keyof Item],
        header: () =>
          sortOptions.includes(key) ? (
            <Button
              variant="ghost"
              onClick={(event) => sortColumn(key, event.shiftKey)}
              aria-label={`${label(key)} · ${t("sortBy")}`}
            >
              <span className="truncate">{label(key)}</span>
              {query.sorts.find((s) => s.field === key)?.direction === "asc" ? (
                <ArrowUp />
              ) : query.sorts.find((s) => s.field === key)?.direction ===
                "desc" ? (
                <ArrowDown />
              ) : (
                <ArrowUpDown />
              )}
            </Button>
          ) : (
            label(key)
          ),
        cell: ({ row }) => cell(row.original, key),
      })),
      {
        id: "actions",
        header: () => <span className="sr-only">{t("viewItem")}</span>,
        cell: ({ row }) => (
          <div className="flex gap-1">
            <IconAction
              label={`${t(category === "properties" ? "editItem" : "viewItem")}: ${row.original.id}`}
              onClick={() => router.push(`/${category}/${row.original.id}`)}
            >
              {category === "properties" ? <Pencil /> : <Eye />}
            </IconAction>
            {category !== "properties" && (
              <IconAction
                label={`${t("noticeTab")}: ${row.original.id}`}
                onClick={() =>
                  router.push(`/${category}/${row.original.id}?tab=notice`)
                }
              >
                <FileText />
              </IconAction>
            )}
          </div>
        ),
      },
    ],
    // The render closures depend only on these values; derived label/column
    // arrays and callbacks are intentionally not used as identity dependencies.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [category, locale, t, router, query.sorts, query.currency, change]
  )

  return (
    <>
      <PageHeading title={t(category)} description={t("listingIntro")}>
        <Button asChild>
          <Link href={`/${category}/filters`}>
            <SlidersHorizontal />
            {t("openFilters")}
          </Link>
        </Button>
      </PageHeading>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {data
            ? `${data.total} ${t(data.total === 1 ? "result" : "results")}`
            : t("loadingItems")}
        </p>
        {category === "properties" && (
          <ToggleGroup
            type="single"
            value={view}
            onValueChange={(v) => v && setView(v)}
            variant="outline"
            aria-label={t("viewMode")}
          >
            <ToggleGroupItem value="list">
              <List />
              {t("list")}
            </ToggleGroupItem>
            <ToggleGroupItem value="map">
              <Map />
              {t("map")}
            </ToggleGroupItem>
          </ToggleGroup>
        )}
      </div>
      <Card>
        <CardContent>
          <div className="flex flex-wrap items-center gap-3">
            <FieldTitle>{t("sortBy")}</FieldTitle>
            {query.sorts.map((sort, index) => (
              <div key={index} className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">
                  {index + 1}
                </span>
                <Choice
                  label={`${t("sortBy")} ${index + 1}`}
                  value={sort.field}
                  onChange={(field) =>
                    changeSort(index, { field: field as Sort["field"] })
                  }
                  options={sortOptions
                    .filter(
                      (key) =>
                        key === sort.field ||
                        !query.sorts.some((s) => s.field === key)
                    )
                    .map((value) => ({ value, label: label(value) }))}
                />
                <Choice
                  label={`${t("comparison")} ${index + 1}`}
                  value={sort.direction}
                  onChange={(direction) =>
                    changeSort(index, {
                      direction: direction as Sort["direction"],
                    })
                  }
                  options={[
                    { value: "asc", label: t("ascending") },
                    { value: "desc", label: t("descending") },
                  ]}
                />
                <IconAction
                  label={`${t("clearSort")} ${index + 1}`}
                  onClick={() =>
                    change({
                      sorts: query.sorts.filter((_, i) => i !== index),
                      page: 1,
                    })
                  }
                >
                  <X />
                </IconAction>
              </div>
            ))}
            <Button
              variant="outline"
              disabled={query.sorts.length >= 5}
              onClick={() => {
                const field = sortOptions.find(
                  (k) =>
                    k !== "amount" && !query.sorts.some((s) => s.field === k)
                )
                if (field)
                  change({
                    sorts: [
                      ...query.sorts,
                      { field: field as Sort["field"], direction: "asc" },
                    ],
                    page: 1,
                  })
              }}
            >
              <Plus />
              {t("addSort")}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                  <Columns3 />
                  {t("columns")}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="max-h-96 overflow-y-auto"
              >
                <DropdownMenuLabel>{t("columns")}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {available.map((key) => (
                  <DropdownMenuCheckboxItem
                    key={key}
                    checked={selected.includes(key)}
                    disabled={selected.length === 1 && selected.includes(key)}
                    onSelect={(e) => e.preventDefault()}
                    onCheckedChange={(checked) =>
                      update((s) => ({
                        ...s,
                        columns: {
                          ...s.columns,
                          [queryKey(s.user, category)]: checked
                            ? [...selected, key]
                            : selected.filter((x) => x !== key),
                        },
                      }))
                    }
                  >
                    {label(key)}
                  </DropdownMenuCheckboxItem>
                ))}
                <DropdownMenuSeparator />
                <Button
                  variant="ghost"
                  onClick={() =>
                    update((s) => ({
                      ...s,
                      columns: {
                        ...s.columns,
                        [queryKey(s.user, category)]: defaultColumns(category),
                      },
                    }))
                  }
                >
                  {t("resetColumns")}
                </Button>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
      <div className="flex flex-wrap items-center gap-4">
        <Choice
          value={String(query.pageSize)}
          onChange={(v) => change({ pageSize: Number(v), page: 1 })}
          label={t("pageSize")}
          options={[5, 10, 25, 50, 100].map((n) => ({
            value: String(n),
            label: `${n} · ${t("pageSize")}`,
          }))}
        />
        <span className="text-sm text-muted-foreground">
          {data
            ? `${t("showingCount")} ${data.total ? (data.page - 1) * data.pageSize + 1 : 0}–${Math.min(data.page * data.pageSize, data.total)} ${t("pageOf")} ${data.total}`
            : ""}
        </span>
        <Pagination className="ml-auto w-auto">
          <PaginationContent>
            <PaginationItem>
              <Button
                variant="outline"
                disabled={!data || data.page <= 1}
                onClick={() => change({ page: data!.page - 1 })}
              >
                <ChevronLeft />
                {t("previousPage")}
              </Button>
            </PaginationItem>
            <PaginationItem>
              <span className="px-2 text-sm">
                {data ? `${data.page} / ${data.pageCount}` : "…"}
              </span>
            </PaginationItem>
            <PaginationItem>
              <Button
                variant="outline"
                disabled={!data || data.page >= data.pageCount}
                onClick={() => change({ page: data!.page + 1 })}
              >
                {t("nextPage")}
                <ChevronRight />
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>
            {t(error === "amountCurrencyRequired" ? error : "fetchError")}
            <Button variant="outline" onClick={() => setRetry((n) => n + 1)}>
              {t("retry")}
            </Button>
          </AlertDescription>
        </Alert>
      ) : !data ? (
        <div className="space-y-2" aria-busy="true">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-12" />
          ))}
        </div>
      ) : !data.items.length ? (
        <Card>
          <CardContent className="py-10 text-center">
            <h2 className="font-medium">{t("empty")}</h2>
            <p className="mt-2 text-muted-foreground">{t("emptyBody")}</p>
            <Button className="mt-4" variant="outline" asChild>
              <Link href={`/${category}/filters`}>{t("openFilters")}</Link>
            </Button>
          </CardContent>
        </Card>
      ) : view === "map" && category === "properties" ? (
        <PropertyMap items={data.items} />
      ) : (
        <DataTable<Item>
          data={data.items}
          columns={columns}
          getRowId={(item) => item.id}
          columnVisibility={Object.fromEntries(
            available.map((key) => [key, selected.includes(key)])
          )}
          sorting={query.sorts.map((sort) => ({
            id: sort.field,
            desc: sort.direction === "desc",
          }))}
          pagination={{ pageIndex: data.page - 1, pageSize: data.pageSize }}
          rowCount={data.total}
          columnWidths={{
            ...Object.fromEntries(
              available.map((key) => [key, columnWidth(key)])
            ),
            actions: category === "properties" ? 56 : 88,
          }}
          minWidth={visible.reduce(
            (total, key) => total + columnWidth(key),
            category === "properties" ? 56 : 88
          )}
        />
      )}
    </>
  )
}
