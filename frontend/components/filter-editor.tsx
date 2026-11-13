"use client"
import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { Plus, X, Save, ArrowLeft, SlidersHorizontal } from "lucide-react"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Category,
  Query,
  Term,
  querySchema,
  emptyExpression,
} from "@/lib/domain"
import { usePreview, storedQuery, queryKey } from "@/lib/preview-store"
import { useRouter } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Choice, PageHeading, IconAction } from "./shared"
const nameSchema = z.object({ name: z.string().trim().min(1).max(100) })
export function FilterView({ category }: { category: Category }) {
  const { state } = usePreview()
  const search = useSearchParams()
  const saved = state.savedFilters.find(
    (f) =>
      f.id === search.get("load") &&
      f.owner === state.user &&
      f.query.category === category
  )
  const initial = saved?.query ?? storedQuery(state, category)
  return (
    <FilterEditor
      key={`${state.user}:${JSON.stringify(initial)}`}
      initial={initial}
    />
  )
}

function FilterEditor({ initial }: { initial: Query }) {
  const t = useTranslations()
  const router = useRouter()
  const { state, update } = usePreview()
  const [draft, setDraft] = useState<Query>(structuredClone(initial))
  const [error, setError] = useState("")
  const [saveOpen, setSaveOpen] = useState(false)
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
        } as Record<string, string>
      )[key]
    )
  const updateGroup = (
    index: number,
    patch: Partial<Query["expression"]["groups"][number]>
  ) =>
    setDraft((d) => ({
      ...d,
      expression: {
        ...d.expression,
        groups: d.expression.groups.map((g, i) =>
          i === index ? { ...g, ...patch } : g
        ),
      },
    }))
  const updateTerm = (gi: number, ti: number, patch: Partial<Term>) =>
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
    const result = querySchema.safeParse({ ...draft, page: 1 })
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
  const openSave = () => {
    if (validate()) setSaveOpen(true)
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
          enabled: true,
        },
      ],
    }))
    setSaveOpen(false)
    form.reset()
    toast.success(t("filterSaved"))
  })
  const activeTags = (state.tags[state.organization] ?? []).filter(
    (tag) => !tag.deleted
  )
  return (
    <>
      <PageHeading title={t("filterView")} description={t("filterViewHelp")}>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            onClick={() => router.push(`/${initial.category}`)}
          >
            <ArrowLeft />
            {t("cancelFilters")}
          </Button>
          <Button onClick={openSave}>
            <Save />
            {t("saveSearch")}
          </Button>
        </div>
      </PageHeading>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Card>
          <CardHeader>
            <div className="flex justify-between gap-3">
              <CardTitle>{t("filters")}</CardTitle>
              <Button
                variant="ghost"
                onClick={() => {
                  setDraft((d) => ({
                    ...d,
                    expression: emptyExpression(),
                    currency: null,
                    sorts: [{ field: "date", direction: "asc" }],
                  }))
                  setError("")
                }}
              >
                {t("clear")}
              </Button>
            </div>
            <CardDescription>{t("expressionHelp")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-wrap gap-4">
              <div className="space-y-2">
                <Label>{t("combineGroups")}</Label>
                <Choice
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
                    { value: "AND", label: t("allAndReadable") },
                    { value: "OR", label: t("anyOrReadable") },
                  ]}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("filterCurrency")}</Label>
                <Choice
                  label={t("filterCurrency")}
                  value={draft.currency ?? "any"}
                  onChange={(currency) =>
                    setDraft((d) => ({
                      ...d,
                      currency:
                        currency === "any" ? null : (currency as "CRC" | "USD"),
                    }))
                  }
                  options={[
                    { value: "any", label: t("anyCurrency") },
                    { value: "CRC", label: "CRC" },
                    { value: "USD", label: "USD" },
                  ]}
                />
              </div>
            </div>
            {draft.expression.groups.length === 0 && (
              <p className="text-sm text-muted-foreground">{t("noGroups")}</p>
            )}
            {draft.expression.groups.map((group, gi) => (
              <Card key={gi}>
                <CardHeader>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <CardTitle>
                      {t("group")} {gi + 1}
                    </CardTitle>
                    <div className="flex items-center gap-1">
                      <Choice
                        label={`${t("combineTerms")} ${gi + 1}`}
                        value={group.operator}
                        onChange={(operator) =>
                          updateGroup(gi, {
                            operator: operator as "AND" | "OR",
                          })
                        }
                        options={[
                          { value: "AND", label: t("allAndReadable") },
                          { value: "OR", label: t("anyOrReadable") },
                        ]}
                      />
                      <IconAction
                        label={`${t("deleteGroup")} ${gi + 1}`}
                        onClick={() =>
                          setDraft((d) => ({
                            ...d,
                            expression: {
                              ...d.expression,
                              groups: d.expression.groups.filter(
                                (_, i) => i !== gi
                              ),
                            },
                          }))
                        }
                      >
                        <X />
                      </IconAction>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {group.terms.map((term, ti) => {
                    const numeric = ["area", "amount", "date"].includes(
                      term.field
                    )
                    const operatorOptions =
                      term.field === "text" || term.field === "locality"
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
                                value === "reviewed"
                                  ? "reviewed"
                                  : "needsReview"
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
                      <div
                        key={ti}
                        className="flex flex-wrap items-center gap-2"
                      >
                        <Choice
                          label={`${t("field")} ${gi + 1}.${ti + 1}`}
                          value={term.field}
                          onChange={(field) =>
                            updateTerm(gi, ti, {
                              field: field as Term["field"],
                              operator:
                                field === "text" || field === "locality"
                                  ? "contains"
                                  : "eq",
                              value: "",
                            })
                          }
                          options={fieldKeys.map((value) => ({
                            value,
                            label: fieldLabel(value),
                          }))}
                        />
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
                        {term.operator !== "isUnknown" &&
                          (choices ? (
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
                              type={term.field === "date" ? "date" : "text"}
                              inputMode={
                                ["amount", "area"].includes(term.field)
                                  ? "decimal"
                                  : "text"
                              }
                              onChange={(e) =>
                                updateTerm(gi, ti, { value: e.target.value })
                              }
                            />
                          ))}
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
                        terms: [
                          ...group.terms,
                          { field: "text", operator: "contains", value: "" },
                        ],
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
                    groups: [
                      ...d.expression.groups,
                      {
                        operator: "AND",
                        terms: [
                          { field: "text", operator: "contains", value: "" },
                        ],
                      },
                    ],
                  },
                }))
              }
            >
              <Plus />
              {t("addGroup")}
            </Button>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="flex flex-wrap gap-2">
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
                  }))
                  router.push(`/${query.category}`)
                }}
              >
                <SlidersHorizontal />
                {t("applyReturn")}
              </Button>
              <Button variant="outline" onClick={openSave}>
                <Save />
                {t("saveSearch")}
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>{t("savedFiltersPanel")}</CardTitle>
            <CardDescription>{t("saveDraftHelp")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {state.savedFilters
              .filter((s) => s.owner === state.user)
              .map((saved) => (
                <div key={saved.id} className="space-y-2 rounded-lg border p-3">
                  <p className="font-medium">{saved.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {t(saved.query.category)} ·{" "}
                    {state.organizationNames[saved.organization]}
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (saved.organization !== state.organization)
                        update((s) => ({
                          ...s,
                          organization: saved.organization,
                        }))
                      setDraft(structuredClone(saved.query))
                      router.replace(
                        `/${saved.query.category}/filters?load=${saved.id}`
                      )
                      toast.success(t("retrievedFilter"))
                    }}
                  >
                    {t("retrieveFilter")}
                  </Button>
                </div>
              ))}
            {!state.savedFilters.some((s) => s.owner === state.user) && (
              <p className="text-sm text-muted-foreground">
                {t("noSavedFilters")}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("saveSearch")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={save} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="filter-name">{t("filterName")}</Label>
              <Input id="filter-name" {...form.register("name")} />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">{t("nameRequired")}</p>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setSaveOpen(false)}
              >
                {t("cancel")}
              </Button>
              <Button type="submit">{t("save")}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
