"use client"
import {
  Fragment,
  useState,
  useEffect,
  useMemo,
  useCallback,
  useId,
} from "react"
import { useTranslations, useLocale } from "next-intl"
import {
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Columns3,
  ChevronDown,
  Pencil,
  Eye,
  FileText,
  SlidersHorizontal,
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { DataTable, type DataTableColumn } from "@/components/ui/data-table"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination"
import {
  amountSortCurrency,
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
import { BulkTagActions } from "./bulk-tag-actions"
import { SortMenu } from "./sort-menu"
import { PageJump } from "./page-jump"
import { TagPicker } from "./tag-picker"
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
  const pageSizeId = useId()
  const savedQuery =
    state.queries[queryKey(state.user, category)] ?? fallbackQuery
  const query = useMemo(
    () =>
      [25, 50, 100].includes(savedQuery.pageSize)
        ? savedQuery
        : { ...savedQuery, pageSize: 25, page: 1 },
    [savedQuery]
  )
  const assignments = state.assignments[state.organization]
  const [response, setResponse] = useState<{
    key: string
    data?: ItemPage
    error?: string
  }>({ key: "" })
  const [retry, setRetry] = useState(0)
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
            [queryKey(s.user, category)]: {
              ...current,
              ...(![25, 50, 100].includes(current.pageSize)
                ? { pageSize: 25, page: 1 }
                : {}),
              ...patch,
            },
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
  const sortColumn = (key: string, add: boolean) => {
    if (!sortOptions.includes(key)) return
    if (key === "amount" && !amountSortCurrency(query)) {
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
        <Button
          variant="link"
          render={
            <Link
              href={`/${category}/${item.id}`}
              title={title(item, locale)}
            />
          }
          nativeButton={false}
        >
          <span className="truncate">{title(item, locale)}</span>
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
    [
      category,
      locale,
      t,
      router,
      query.sorts,
      query.currency,
      query.expression,
      change,
    ]
  )
  return (
    <>
      <PageHeading title={t(category)} description={t("listingIntro")} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            render={<Link href={`/${category}/filters`} />}
            nativeButton={false}
          >
            <SlidersHorizontal />
            {t("openFilters")}
          </Button>
          <BulkTagActions
            key={`${state.user}:${state.organization}:${category}:${requestKey}`}
            query={payload}
            total={data?.total ?? 0}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SortMenu
            sorts={query.sorts}
            options={sortOptions.map((value) => ({
              value,
              label: label(value),
            }))}
            onChange={(sorts) => {
              if (
                sorts.some((sort) => sort.field === "amount") &&
                !amountSortCurrency(query)
              ) {
                router.push(`/${category}/filters`)
                return
              }
              change({ sorts, page: 1 })
            }}
          />
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="outline" />}>
              <Columns3 />
              {t("columns")}
              <ChevronDown aria-hidden="true" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="max-h-96 overflow-y-auto"
            >
              <DropdownMenuGroup>
                <DropdownMenuLabel>{t("columns")}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {available.map((key) => (
                  <DropdownMenuCheckboxItem
                    key={key}
                    checked={selected.includes(key)}
                    disabled={selected.length === 1 && selected.includes(key)}
                    closeOnClick={false}
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
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
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
            <Button
              className="mt-4"
              variant="outline"
              render={<Link href={`/${category}/filters`} />}
              nativeButton={false}
            >
              {t("openFilters")}
            </Button>
          </CardContent>
        </Card>
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
      <footer
        className="grid grid-cols-1 items-center gap-4 xl:grid-cols-[1fr_auto_1fr]"
        data-slot="listing-footer"
      >
        <div className="flex items-center gap-2">
          <Label htmlFor={pageSizeId}>{t("pageSize")}</Label>
          <Choice
            id={pageSizeId}
            value={String(query.pageSize)}
            onChange={(v) => change({ pageSize: Number(v), page: 1 })}
            label={t("pageSize")}
            options={[25, 50, 100].map((n) => ({
              value: String(n),
              label: String(n),
            }))}
          />
        </div>
        <span
          className="justify-self-center text-sm whitespace-nowrap"
          aria-live="polite"
          aria-atomic="true"
        >
          {data ? t("listingItemCount", { count: data.total }) : "…"}
        </span>
        <div className="flex flex-wrap items-center justify-center gap-4 xl:justify-end xl:justify-self-end">
          <Pagination className="mx-0 w-auto">
            <PaginationContent className="gap-2">
              {[
                {
                  label: "firstPage",
                  icon: ChevronFirst,
                  target: 1,
                  disabled: !data || data.page <= 1,
                },
                {
                  label: "previousPage",
                  icon: ChevronLeft,
                  target: (data?.page ?? 1) - 1,
                  disabled: !data || data.page <= 1,
                },
                {
                  label: "nextPage",
                  icon: ChevronRight,
                  target: (data?.page ?? 1) + 1,
                  disabled: !data || data.page >= data.pageCount,
                },
                {
                  label: "lastPage",
                  icon: ChevronLast,
                  target: data?.pageCount ?? 1,
                  disabled: !data || data.page >= data.pageCount,
                },
              ].map(({ label, icon: Icon, target, disabled }) => (
                <Fragment key={label}>
                  <PaginationItem>
                    <Button
                      variant="outline"
                      size="icon"
                      aria-label={t(label)}
                      title={t(label)}
                      data-page-navigation
                      disabled={disabled}
                      onClick={() => change({ page: target })}
                    >
                      <Icon aria-hidden="true" />
                    </Button>
                  </PaginationItem>
                  {label === "previousPage" && (
                    <PaginationItem className="px-2">
                      <PageJump
                        key={`${state.user}:${state.organization}:${category}:${data?.page}:${data?.pageCount}`}
                        page={data?.page ?? query.page}
                        pageCount={data?.total ? data.pageCount : 0}
                        disabled={!data || !data.total}
                        onGo={(page) => change({ page })}
                      />
                    </PaginationItem>
                  )}
                </Fragment>
              ))}
            </PaginationContent>
          </Pagination>
        </div>
      </footer>
    </>
  )
}
