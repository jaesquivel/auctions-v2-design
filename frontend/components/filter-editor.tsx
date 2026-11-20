"use client"
import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import {
  Plus,
  X,
  Save,
  Trash2,
  ChevronDown,
  SlidersHorizontal,
} from "lucide-react"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Category,
  Query,
  Term,
  querySchema,
  isDateField,
  isAmountField,
} from "@/lib/domain"
import {
  blankTerm,
  blankGroup,
  filterDraft,
  draftQuery,
  type FilterDraft,
  type DraftTerm,
  type DraftGroup,
} from "@/lib/filter-draft"
import { usePreview, storedQuery, queryKey } from "@/lib/preview-store"
import { useRouter } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverDescription,
} from "@/components/ui/popover"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { TagFilterOperand, DateFilterOperand } from "./filter-operands"
import { ItemGrid } from "./item-grid"
import { SortControls } from "./sort-menu"
import { ColumnsControls, listingLabelKey } from "./columns-menu"
import { viewColumns } from "@/lib/listing-view"
import { Choice, LabeledChoice, IconAction, Confirm } from "./shared"
const nameSchema = z.object({ name: z.string().trim().min(1).max(100) })
export function FilterView({ category }: { category: Category }) {
  const { state } = usePreview()
  const t = useTranslations()
  const router = useRouter()
  const search = useSearchParams()
  const saved = state.savedFilters.find(
    (f) =>
      f.id === search.get("load") &&
      f.owner === state.user &&
      f.query.category === category
  )
  const initial = saved?.query ?? storedQuery(state, category)
  return (
    <>
      <ItemGrid category={category} />
      <Dialog
        open
        onOpenChange={(open) => {
          if (!open) router.replace(`/${category}`)
        }}
      >
        <DialogContent
          aria-label={t("viewOptions")}
          className="max-h-[calc(100dvh-2rem)] grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden sm:max-w-5xl"
        >
          <DialogHeader className="pr-8">
            <DialogTitle>{t("viewOptions")}</DialogTitle>
            <DialogDescription>{t("viewOptionsHelp")}</DialogDescription>
          </DialogHeader>
          <FilterEditor
            key={`${state.user}:${state.organization}:${category}:${search.get("load") ?? "current"}`}
            initial={initial}
            initialColumns={saved?.columns}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}

function FilterEditor({
  initial,
  initialColumns,
}: {
  initial: Query
  initialColumns?: string[]
}) {
  const t = useTranslations()
  const router = useRouter()
  const { state, update } = usePreview()
  const [draft, setDraft] = useState<FilterDraft>(() => filterDraft(initial))
  const [selectedColumns, setSelectedColumns] = useState(() =>
    viewColumns(
      initial.category,
      initialColumns,
      state.columns[queryKey(state.user, initial.category)]
    )
  )
  const sortOptions = [
    "date",
    "amount",
    "type",
    "reference",
    "caseNumber",
    ...(draft.category === "properties"
      ? ["registrationNumber", "locality", "area"]
      : draft.category === "vehicles"
        ? ["plate"]
        : []),
  ]
  const [error, setError] = useState("")
  const [savedMenuOpen, setSavedMenuOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<{
    id: string
    name: string
  } | null>(null)
  const form = useForm<z.infer<typeof nameSchema>>({
    resolver: zodResolver(nameSchema),
    defaultValues: { name: "" },
  })
  const types =
    draft.category === "properties"
      ? ["house", "land", "apartment", "commercial"]
      : draft.category === "vehicles"
        ? ["car", "motorcycle", "truck", "vehicle_other"]
        : ["equipment", "inventory", "other"]
  const fieldKeys = [
    "text",
    "type",
    ...(draft.category === "properties" ? ["region", "locality", "area"] : []),
    "amount",
    "date",
    "quality",
    "tag",
    "round1Amount",
    "round2Amount",
    "round3Amount",
    "round1Date",
    "round2Date",
    "round3Date",
  ]
  const fieldLabel = (key: string) =>
    t(
      (
        {
          text: "textFilter",
          type: "auctionType",
          region: "province",
          locality: "location",
          amount: "base",
          date: "nextEvent",
          area: "area",
          quality: "quality",
          tag: "tags",
          round1Amount: "round1AmountFilter",
          round2Amount: "round2AmountFilter",
          round3Amount: "round3AmountFilter",
          round1Date: "round1DateFilter",
          round2Date: "round2DateFilter",
          round3Date: "round3DateFilter",
        } as Record<string, string>
      )[key]
    )
  const updateGroup = (index: number, patch: Partial<DraftGroup>) =>
    setDraft((d) => ({
      ...d,
      expression: {
        ...d.expression,
        groups: d.expression.groups.map((g, i) =>
          i === index
            ? {
                ...g,
                ...patch,
                terms:
                  patch.terms?.length === 0
                    ? [blankTerm()]
                    : (patch.terms ?? g.terms),
              }
            : g
        ),
      },
    }))
  const updateTerm = (gi: number, ti: number, patch: Partial<DraftTerm>) =>
    setDraft((d) => ({
      ...d,
      expression: {
        ...d.expression,
        groups: d.expression.groups.map((g, i) =>
          i === gi
            ? {
                ...g,
                terms: g.terms.map((term, j) =>
                  j === ti ? { ...term, ...patch } : term
                ),
              }
            : g
        ),
      },
    }))
  const validate = () => {
    const result = querySchema.safeParse({ ...draftQuery(draft), page: 1 })
    if (!result.success) {
      const currency = result.error.issues.some(
        (i) => i.message === "amountCurrencyRequired"
      )
      setError(t(currency ? "amountCurrencyRequired" : "validationError"))
      return null
    }
    setError("")
    return result.data
  }
  const save = form.handleSubmit(({ name }) => {
    const query = validate()
    if (!query) return
    update((s) => ({
      ...s,
      savedFilters: [
        ...s.savedFilters,
        {
          id: crypto.randomUUID(),
          owner: s.user,
          name,
          organization: s.organization,
          query,
          columns: [...selectedColumns],
          enabled: true,
        },
      ],
    }))
    setSavedMenuOpen(false)
    form.reset()
    toast.success(t("filterSaved"))
  })
  const activeTags = (state.tags[state.organization] ?? []).filter(
    (tag) => !tag.deleted
  )
  return (
    <>
      <Tabs
        defaultValue="filters"
        className="h-[min(65dvh,40rem)] max-h-full min-h-0 gap-4"
      >
        <TabsList className="w-full shrink-0" aria-label={t("viewOptions")}>
          <TabsTrigger value="filters">{t("filters")}</TabsTrigger>
          <TabsTrigger value="sorting">{t("sortMenu")}</TabsTrigger>
          <TabsTrigger value="columns">{t("columns")}</TabsTrigger>
        </TabsList>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <TabsContent
          value="filters"
          className="min-h-0 space-y-4 overflow-y-auto p-1"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <p className="max-w-2xl text-sm text-muted-foreground">
              {t("expressionHelp")}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setDraft((d) => ({
                  ...d,
                  expression: { operator: "AND", groups: [blankGroup()] },
                  currency: null,
                }))
                setError("")
              }}
            >
              {t("clearFilters")}
            </Button>
          </div>
          <div className="flex flex-wrap gap-4">
            <LabeledChoice
              label={t("combineGroups")}
              value={draft.expression.operator}
              onChange={(operator) =>
                setDraft((d) => ({
                  ...d,
                  expression: {
                    ...d.expression,
                    operator: operator as "AND" | "OR",
                  },
                }))
              }
              options={[
                { value: "AND", label: t("allGroupsReadable") },
                { value: "OR", label: t("anyGroupReadable") },
              ]}
            />
          </div>
          {draft.expression.groups.map((group, gi) => (
            <Card key={gi}>
              <CardHeader>
                <div className="flex flex-col items-start gap-3">
                  <div className="flex items-center gap-1">
                    <CardTitle>
                      {t("group")} {gi + 1}
                    </CardTitle>
                    <IconAction
                      label={`${t("deleteGroup")} ${gi + 1}`}
                      onClick={() =>
                        setDraft((d) => ({
                          ...d,
                          expression: {
                            ...d.expression,
                            groups:
                              d.expression.groups.length === 1
                                ? [blankGroup()]
                                : d.expression.groups.filter(
                                    (_, i) => i !== gi
                                  ),
                          },
                        }))
                      }
                    >
                      <X />
                    </IconAction>
                  </div>
                  <LabeledChoice
                    label={t("matchTerms")}
                    value={group.operator}
                    onChange={(operator) =>
                      updateGroup(gi, {
                        operator: operator as "AND" | "OR",
                      })
                    }
                    options={[
                      { value: "AND", label: t("allTerms") },
                      { value: "OR", label: t("anyTerm") },
                    ]}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {group.terms.map((term, ti) => {
                  const numeric =
                    term.field === "area" || isAmountField(term.field)
                  const operatorOptions =
                    term.field === "tag"
                      ? ["anyOf", "allOf", "noneOf", "exactly"]
                      : isDateField(term.field)
                        ? [
                            "at",
                            "before",
                            "after",
                            ...(term.operator === "isUnknown"
                              ? ["isUnknown"]
                              : []),
                          ]
                        : term.field === "text" || term.field === "locality"
                          ? ["contains", "eq", "isUnknown"]
                          : numeric
                            ? ["eq", "gte", "lte", "isUnknown"]
                            : ["eq", "isUnknown"]
                  const choices =
                    term.field === "type"
                      ? types.map((value) => ({ value, label: t(value) }))
                      : term.field === "quality"
                        ? ["reviewed", "needs_review"].map((value) => ({
                            value,
                            label: t(
                              value === "reviewed" ? "reviewed" : "needsReview"
                            ),
                          }))
                        : term.field === "tag"
                          ? activeTags.map((tag) => ({
                              value: tag.id,
                              label: tag.label,
                            }))
                          : term.field === "region"
                            ? [
                                { value: "CR-SJ", label: "San José" },
                                { value: "CR-A", label: "Alajuela" },
                                { value: "CR-H", label: "Heredia" },
                                { value: "CR-C", label: "Cartago" },
                                { value: "CR-G", label: "Guanacaste" },
                                { value: "CR-P", label: "Puntarenas" },
                                { value: "CR-L", label: "Limón" },
                              ]
                            : null
                  return (
                    <div key={ti} className="flex flex-wrap items-center gap-2">
                      <Choice
                        label={`${t("field")} ${gi + 1}.${ti + 1}`}
                        value={term.field || "unselected"}
                        onChange={(field) =>
                          updateTerm(gi, ti, {
                            field:
                              field === "unselected"
                                ? ""
                                : (field as Term["field"]),
                            operator:
                              field === "text" || field === "locality"
                                ? "contains"
                                : field === "tag"
                                  ? "anyOf"
                                  : isDateField(field)
                                    ? "at"
                                    : "eq",
                            value: "",
                            tagIds: undefined,
                            currency: isAmountField(field)
                              ? (draft.currency ?? undefined)
                              : undefined,
                            dateMode: isDateField(field)
                              ? "specific"
                              : undefined,
                          })
                        }
                        options={[
                          {
                            value: "unselected",
                            label: t("noColumnSelected"),
                          },
                          ...fieldKeys.map((value) => ({
                            value,
                            label: fieldLabel(value),
                          })),
                        ]}
                      />
                      {term.field && (
                        <Choice
                          label={`${t("comparison")} ${gi + 1}.${ti + 1}`}
                          value={term.operator}
                          onChange={(operator) =>
                            updateTerm(gi, ti, {
                              operator: operator as Term["operator"],
                            })
                          }
                          options={operatorOptions.map((value) => ({
                            value,
                            label: t(value),
                          }))}
                        />
                      )}
                      {term.field &&
                        term.operator !== "isUnknown" &&
                        (term.field === "tag" ? (
                          <TagFilterOperand
                            term={term}
                            tags={activeTags}
                            label={`${t("value")} ${gi + 1}.${ti + 1}`}
                            onChange={(patch) => updateTerm(gi, ti, patch)}
                          />
                        ) : isDateField(term.field) ? (
                          <DateFilterOperand
                            term={term}
                            label={`${t("value")} ${gi + 1}.${ti + 1}`}
                            onChange={(patch) => updateTerm(gi, ti, patch)}
                          />
                        ) : choices ? (
                          <Choice
                            label={`${t("value")} ${gi + 1}.${ti + 1}`}
                            value={term.value || "unset"}
                            onChange={(value) =>
                              updateTerm(gi, ti, {
                                value: value === "unset" ? "" : value,
                              })
                            }
                            options={[
                              { value: "unset", label: "—" },
                              ...choices,
                            ]}
                          />
                        ) : (
                          <Input
                            aria-label={`${t("value")} ${gi + 1}.${ti + 1}`}
                            className="w-48"
                            value={term.value}
                            type="text"
                            inputMode={
                              isAmountField(term.field) || term.field === "area"
                                ? "decimal"
                                : "text"
                            }
                            onChange={(e) =>
                              updateTerm(gi, ti, { value: e.target.value })
                            }
                          />
                        ))}
                      {isAmountField(term.field) &&
                        term.operator !== "isUnknown" && (
                          <Choice
                            label={`${t("filterCurrency")} ${gi + 1}.${ti + 1}`}
                            value={term.currency ?? "unselected"}
                            onChange={(currency) => {
                              updateTerm(gi, ti, {
                                currency:
                                  currency === "unselected"
                                    ? undefined
                                    : (currency as "CRC" | "USD"),
                              })
                            }}
                            options={[
                              {
                                value: "unselected",
                                label: t("selectCurrency"),
                              },
                              { value: "CRC", label: "CRC" },
                              { value: "USD", label: "USD" },
                            ]}
                          />
                        )}
                      <IconAction
                        label={`${t("deleteTerm")} ${gi + 1}.${ti + 1}`}
                        onClick={() =>
                          updateGroup(gi, {
                            terms: group.terms.filter((_, i) => i !== ti),
                          })
                        }
                      >
                        <X />
                      </IconAction>
                    </div>
                  )
                })}
                <Button
                  variant="outline"
                  disabled={
                    group.terms.length >= 20 ||
                    draft.expression.groups.reduce(
                      (n, g) => n + g.terms.length,
                      0
                    ) >= 100
                  }
                  onClick={() =>
                    updateGroup(gi, {
                      terms: [...group.terms, blankTerm()],
                    })
                  }
                >
                  <Plus />
                  {t("addTerm")}
                </Button>
              </CardContent>
            </Card>
          ))}
          <Button
            variant="outline"
            disabled={draft.expression.groups.length >= 10}
            onClick={() =>
              setDraft((d) => ({
                ...d,
                expression: {
                  ...d.expression,
                  groups: [...d.expression.groups, blankGroup()],
                },
              }))
            }
          >
            <Plus />
            {t("addGroup")}
          </Button>
        </TabsContent>
        <TabsContent value="sorting" className="min-h-0 overflow-y-auto p-1">
          <SortControls
            sorts={draft.sorts}
            options={sortOptions.map((value) => ({
              value,
              label: t(listingLabelKey(value)),
            }))}
            onChange={(sorts) => setDraft((d) => ({ ...d, sorts }))}
          />
        </TabsContent>
        <TabsContent value="columns" className="min-h-0 overflow-y-auto p-1">
          <ColumnsControls
            category={draft.category}
            selected={selectedColumns}
            onChange={setSelectedColumns}
          />
        </TabsContent>
      </Tabs>
      <DialogFooter>
        <Button
          variant="outline"
          onClick={() => router.replace(`/${initial.category}`)}
        >
          {t("cancel")}
        </Button>
        <Popover open={savedMenuOpen} onOpenChange={setSavedMenuOpen}>
          <PopoverTrigger render={<Button variant="outline" />}>
            <Save aria-hidden="true" />
            {t("savedFiltersMenu")}
            <ChevronDown aria-hidden="true" />
          </PopoverTrigger>
          <PopoverContent
            side="top"
            align="end"
            className="max-h-[calc(100dvh-4rem)] w-80 max-w-[calc(100vw-2rem)] overflow-y-auto"
          >
            <PopoverHeader>
              <PopoverTitle>{t("savedFiltersPanel")}</PopoverTitle>
              <PopoverDescription>{t("saveDraftHelp")}</PopoverDescription>
            </PopoverHeader>
            <div className="max-h-48 space-y-1 overflow-y-auto">
              {state.savedFilters
                .filter((saved) => saved.owner === state.user)
                .map((saved) => (
                  <div key={saved.id} className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      className="h-auto min-w-0 flex-1 justify-start py-2 text-left"
                      onClick={() => {
                        setSavedMenuOpen(false)
                        if (saved.organization !== state.organization)
                          update((s) => ({
                            ...s,
                            organization: saved.organization,
                          }))
                        setDraft(filterDraft(saved.query))
                        setSelectedColumns(
                          viewColumns(
                            saved.query.category,
                            saved.columns,
                            state.columns[
                              queryKey(state.user, saved.query.category)
                            ]
                          )
                        )
                        router.replace(
                          `/${saved.query.category}/filters?load=${saved.id}`
                        )
                        toast.success(t("retrievedFilter"))
                      }}
                    >
                      <span className="min-w-0 truncate" title={saved.name}>
                        {saved.name}
                      </span>
                    </Button>
                    <IconAction
                      label={`${t("delete")}: ${saved.name}`}
                      onClick={() => {
                        setSavedMenuOpen(false)
                        setPendingDelete({ id: saved.id, name: saved.name })
                      }}
                    >
                      <Trash2 aria-hidden="true" />
                    </IconAction>
                  </div>
                ))}
              {!state.savedFilters.some(
                (saved) => saved.owner === state.user
              ) && (
                <p className="py-2 text-sm text-muted-foreground">
                  {t("noSavedFilters")}
                </p>
              )}
            </div>
            <Separator />
            <form onSubmit={save} className="space-y-3">
              <Field data-invalid={!!form.formState.errors.name}>
                <FieldLabel htmlFor="filter-name">{t("filterName")}</FieldLabel>
                <Input
                  id="filter-name"
                  maxLength={100}
                  aria-invalid={!!form.formState.errors.name}
                  {...form.register("name")}
                />
                {form.formState.errors.name && (
                  <FieldError>{t("nameRequired")}</FieldError>
                )}
              </Field>
              {error && (
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              )}
              <Button type="submit" className="w-full">
                <Save aria-hidden="true" />
                {t("saveSearch")}
              </Button>
            </form>
          </PopoverContent>
        </Popover>
        <Button
          onClick={() => {
            const query = validate()
            if (!query) return
            update((s) => ({
              ...s,
              queries: {
                ...s.queries,
                [queryKey(s.user, query.category)]: query,
              },
              columns: {
                ...s.columns,
                [queryKey(s.user, query.category)]: selectedColumns,
              },
            }))
            router.replace(`/${query.category}`)
          }}
        >
          <SlidersHorizontal />
          {t("applyReturn")}
        </Button>
      </DialogFooter>
      <Confirm
        open={!!pendingDelete}
        onOpenChange={(open) => {
          if (!open) {
            setPendingDelete(null)
            setSavedMenuOpen(true)
          }
        }}
        title={t("deleteSavedFilterTitle")}
        description={t("deleteSavedFilterDescription", {
          name: pendingDelete?.name ?? "",
        })}
        onConfirm={() => {
          if (!pendingDelete) return
          let deleted = false
          update((s) => {
            if (
              !s.savedFilters.some(
                (saved) =>
                  saved.id === pendingDelete.id && saved.owner === s.user
              )
            )
              return s
            deleted = true
            return {
              ...s,
              savedFilters: s.savedFilters.filter(
                (saved) =>
                  saved.id !== pendingDelete.id || saved.owner !== s.user
              ),
            }
          })
          if (deleted) toast.success(t("savedFilterDeleted"))
        }}
      />
    </>
  )
}
