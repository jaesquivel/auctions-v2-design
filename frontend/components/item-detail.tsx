"use client"
import { useState, useEffect } from "react"
import { useTranslations, useLocale } from "next-intl"
import { useSearchParams } from "next/navigation"
import { useForm, useWatch } from "react-hook-form"
import Image from "next/image"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { ArrowLeft, Save, Trash2, ImagePlus, ArrowUpRight } from "lucide-react"
import dynamic from "next/dynamic"
import {
  Item,
  Research,
  Category,
  researchSchema,
  title,
  formatMoney,
  formatDate,
  roundCost,
} from "@/lib/domain"
import { usePreview } from "@/lib/preview-store"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { Choice, Facts, IconAction, PageHeading } from "./shared"
import { TagPicker } from "./tag-picker"
const PropertyMap = dynamic(() => import("./property-map"), { ssr: false })
type Related = Pick<Item, "id" | "titleEs" | "titleEn" | "category" | "lotId">
type Detail = { item: Item; related: Related[]; originalText: string }
function ResearchForm({ item }: { item: Item }) {
  const t = useTranslations()
  const { state, update } = usePreview()
  const key = `${state.organization}:${item.id}`
  const initial = state.research[key] ?? {
    notes: "",
    appraisalAmount: "",
    appraisalCurrency: "CRC",
    marketAmount: "",
    marketCurrency: "CRC",
  }
  const form = useForm<Research>({
    resolver: zodResolver(researchSchema),
    defaultValues: initial,
  })
  const currencies = useWatch({
    control: form.control,
    name: ["appraisalCurrency", "marketCurrency"],
  })
  const save = form.handleSubmit((values) => {
    update((s) => ({
      ...s,
      research: { ...s.research, [`${s.organization}:${item.id}`]: values },
    }))
    form.reset(values)
    toast.success(t("changesSaved"))
  })
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("privateValues")}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={save} className="space-y-5">
          <Field>
            <FieldLabel htmlFor="notes">{t("notesLabel")}</FieldLabel>
            <Textarea id="notes" rows={5} {...form.register("notes")} />
            {form.formState.errors.notes && (
              <FieldError>{t("validationError")}</FieldError>
            )}
          </Field>
          {["properties", "vehicles"].includes(item.category) && (
            <div className="grid gap-5 md:grid-cols-2">
              {(
                [
                  {
                    key: "appraisalAmount",
                    currency: "appraisalCurrency",
                    label: "appraisal",
                  },
                  {
                    key: "marketAmount",
                    currency: "marketCurrency",
                    label: "marketValue",
                  },
                ] as const
              ).map((field) => (
                <Field key={field.key}>
                  <FieldLabel htmlFor={field.key}>{t(field.label)}</FieldLabel>
                  <div className="flex gap-2">
                    <Input
                      id={field.key}
                      inputMode="decimal"
                      placeholder="0.00"
                      {...form.register(field.key)}
                    />
                    <Choice
                      label={`${t(field.label)} · ${t("currencyPlain")}`}
                      value={
                        currencies[
                          field.currency === "appraisalCurrency" ? 0 : 1
                        ]
                      }
                      onChange={(v) =>
                        form.setValue(field.currency, v as "CRC" | "USD", {
                          shouldDirty: true,
                        })
                      }
                      options={[
                        { value: "CRC", label: "CRC" },
                        { value: "USD", label: "USD" },
                      ]}
                    />
                  </div>
                  {form.formState.errors[field.key] && (
                    <FieldError>{t("saveResearchError")}</FieldError>
                  )}
                </Field>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <Button type="submit" disabled={!form.formState.isDirty}>
              <Save />
              {t("save")}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset(state.research[key] ?? initial)}
            >
              {t("cancel")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
const imageSessions = new Map<string, { url: string; name: string }[]>()
function ImagesPanel({ id }: { id: string }) {
  const t = useTranslations()
  const { state } = usePreview()
  const imageKey = `${state.organization}:${id}`
  const [images, setImages] = useState<{ url: string; name: string }[]>(
    () => imageSessions.get(imageKey) ?? []
  )
  const [view, setView] = useState<string | null>(null)
  useEffect(() => {
    imageSessions.set(imageKey, images)
  }, [imageKey, images])
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("imagesTab")}</CardTitle>
        <CardDescription>{t("imagesLocal")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Label htmlFor={`images-${id}`} className="flex items-center gap-2">
          <ImagePlus className="size-4" />
          {t("attachImages")}
        </Label>
        <Input
          id={`images-${id}`}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={(event) => {
            const files = Array.from(event.target.files ?? [])
            if (
              images.length + files.length > 20 ||
              files.some(
                (f) =>
                  !["image/jpeg", "image/png", "image/webp"].includes(f.type) ||
                  f.size > 10 * 1024 * 1024
              )
            ) {
              toast.error(t("imageError"))
              return
            }
            const added = files.map((f) => ({
              name: f.name,
              url: URL.createObjectURL(f),
            }))
            setImages((current) => [...current, ...added])
            event.target.value = ""
          }}
        />
        <p className="text-xs text-muted-foreground">
          JPEG, PNG, WebP · 10 MB · 20 {t("imagesTab")} · {state.user}
        </p>
        {!images.length && (
          <p className="text-sm text-muted-foreground">{t("noImages")}</p>
        )}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((img) => (
            <div key={img.url} className="space-y-2 rounded-lg border p-2">
              <Button
                variant="ghost"
                className="h-auto w-full"
                onClick={() => setView(img.url)}
                aria-label={img.name}
              >
                <Image
                  unoptimized
                  width={600}
                  height={400}
                  src={img.url}
                  alt={img.name}
                  className="aspect-video w-full rounded-md object-cover"
                />
              </Button>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs">{img.name}</span>
                <IconAction
                  label={t("removeImage")}
                  onClick={() => {
                    setImages((all) => all.filter((i) => i.url !== img.url))
                    URL.revokeObjectURL(img.url)
                  }}
                >
                  <Trash2 />
                </IconAction>
              </div>
            </div>
          ))}
        </div>
        <Dialog open={!!view} onOpenChange={(open) => !open && setView(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("imagesTab")}</DialogTitle>
            </DialogHeader>
            {view && (
              <Image
                unoptimized
                width={1200}
                height={900}
                src={view}
                alt={images.find((i) => i.url === view)?.name ?? ""}
                className="max-h-[70vh] w-full object-contain"
              />
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
export function ItemDetail({
  id,
  category,
}: {
  id: string
  category: Category
}) {
  const t = useTranslations()
  const locale = useLocale()
  const search = useSearchParams()
  const { state } = usePreview()
  const [result, setResult] = useState<{
    id: string
    data?: Detail
    error?: string
  }>({ id: "" })
  useEffect(() => {
    const abort = new AbortController()
    fetch(`/api/items/${encodeURIComponent(id)}`, { signal: abort.signal })
      .then(async (response) => {
        if (!response.ok)
          throw Error(response.status === 404 ? "itemNotFound" : "fetchError")
        return response.json()
      })
      .then((data) => setResult({ id, data }))
      .catch((error) => {
        if (!abort.signal.aborted) setResult({ id, error: error.message })
      })
    return () => abort.abort()
  }, [id])
  if (result.id !== id)
    return (
      <div className="space-y-4">
        <Skeleton className="h-12" />
        <Skeleton className="h-64" />
      </div>
    )
  if (result.error || !result.data)
    return (
      <Alert variant="destructive">
        <AlertDescription>{t(result.error ?? "fetchError")}</AlertDescription>
      </Alert>
    )
  const { item, related, originalText } = result.data
  if (item.category !== category)
    return (
      <Alert>
        <AlertDescription>{t("itemNotFound")}</AlertDescription>
      </Alert>
    )
  const tabs = [
    "general",
    "auction",
    "registryInfo",
    "noticeTab",
    "registryTab",
    ...(item.category === "properties" ? ["location"] : []),
    "imagesTab",
  ]
  const defaultTab = search.get("tab") === "notice" ? "noticeTab" : "general"
  const noticeFields = (
    <Card>
      <CardHeader>
        <CardTitle>{t("extract")}</CardTitle>
      </CardHeader>
      <CardContent>
        <Facts
          values={[
            [t("description"), item.noticeDescription ?? t("notReported")],
            [t("liens"), item.noticeLiens ?? t("notReported")],
          ]}
        />
      </CardContent>
    </Card>
  )
  const relatedList = (list: Related[]) =>
    list.length ? (
      <div className="flex flex-col gap-2">
        {list.map((i) => (
          <Button key={i.id} variant="link" asChild className="justify-start">
            <Link href={`/${i.category}/${i.id}`}>
              {title(i as Item, locale)}
              <ArrowUpRight />
            </Link>
          </Button>
        ))}
      </div>
    ) : (
      <p className="text-sm text-muted-foreground">{t("noRelated")}</p>
    )
  return (
    <>
      <Button variant="ghost" asChild>
        <Link href={`/${item.category}`}>
          <ArrowLeft />
          {t("back")}
        </Link>
      </Button>
      <PageHeading
        title={title(item, locale)}
        description={item.registrationNumber ?? item.plate ?? item.id}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{t("tags")}</span>
          <TagPicker id={id} />
        </div>
      </PageHeading>
      <Tabs defaultValue={defaultTab} className="space-y-4">
        <div className="overflow-x-auto">
          <TabsList>
            {tabs.map((tab) => (
              <TabsTrigger key={tab} value={tab}>
                {t(tab)}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        <TabsContent value="general" className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>{t("assetInfo")}</CardTitle>
            </CardHeader>
            <CardContent>
              <Facts
                values={[
                  [t("type"), t(item.type)],
                  ...(item.category === "properties"
                    ? ([
                        [t("location"), item.locality ?? t("notReported")],
                        [
                          t("area"),
                          item.area === null
                            ? t("notReported")
                            : `${item.area} m²`,
                        ],
                      ] as [string, string][])
                    : []),
                  [
                    t("quality"),
                    t(item.quality === "reviewed" ? "reviewed" : "needsReview"),
                  ],
                ]}
              />
            </CardContent>
          </Card>
          {noticeFields}
          {item.category !== "other" && (
            <Card>
              <CardHeader>
                <CardTitle>{t("taxValue")}</CardTitle>
              </CardHeader>
              <CardContent>
                <Facts
                  values={[
                    [
                      t("value"),
                      item.governmentTaxValue
                        ? formatMoney(item.governmentTaxValue, locale)
                        : t("notReported"),
                    ],
                    [t("sourceYear"), item.governmentTaxValue?.taxYear],
                    [
                      t("sourceReference"),
                      item.governmentTaxValue?.sourceReference,
                    ],
                  ]}
                />
              </CardContent>
            </Card>
          )}
          <ResearchForm key={`${state.organization}:${id}`} item={item} />
        </TabsContent>
        <TabsContent value="auction" className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>{t("auction")}</CardTitle>
            </CardHeader>
            <CardContent>
              <Facts
                values={[
                  [t("auctionId"), item.auctionId],
                  [
                    t("saleFormat"),
                    t(item.saleMode === "lot" ? "lotSale" : "individualSale"),
                  ],
                  ...(item.lotId
                    ? ([[t("lotId"), item.lotId]] as [string, string][])
                    : []),
                ]}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{t("rounds")}</CardTitle>
              <CardDescription>
                {t("timezone")} ·{" "}
                {t(item.saleMode === "lot" ? "lotSale" : "individualSale")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    {[
                      "auctionRound",
                      "roundDate",
                      "roundTime",
                      "auctionBase",
                      "participationGuarantee",
                      "participationFee",
                    ].map((k) => (
                      <TableHead key={k}>{t(k)}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {item.auctionRounds.map((round) => (
                    <TableRow key={round.round}>
                      <TableCell>
                        {round.round}
                        {round.round === item.nextAuctionRound
                          ? ` · ${t("nextEvent")}`
                          : ""}
                      </TableCell>
                      <TableCell>{formatDate(round.date, locale)}</TableCell>
                      <TableCell>{round.time ?? t("notReported")}</TableCell>
                      <TableCell>
                        {formatMoney(round.baseOffer, locale)}
                      </TableCell>
                      {(["guarantee", "participationFee"] as const).map(
                        (key) => {
                          const cost = roundCost(
                            round,
                            item.roundCostRules?.[key]
                          )
                          return (
                            <TableCell
                              key={key}
                              title={cost ? t("roundCostSource") : undefined}
                            >
                              {cost
                                ? formatMoney(cost, locale)
                                : t("unavailable")}
                            </TableCell>
                          )
                        }
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {item.roundCostRules && (
                <p className="mt-3 text-xs text-muted-foreground">
                  {t("roundCostSource")}
                </p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{t("parties")}</CardTitle>
            </CardHeader>
            <CardContent>
              <Facts
                values={[
                  ...[
                    "creditor",
                    "debtor",
                    "auctioneer",
                    ...(item.auctionKind === "judicial" ? ["court"] : []),
                  ].map(
                    (role) =>
                      [
                        t(role),
                        item.auctionParties
                          .filter((p) => p.role === role)
                          .map((p) => p.name)
                          .join("; ") || t("notReported"),
                      ] as [string, string]
                  ),
                  [t("venue"), item.auctionVenue ?? t("notReported")],
                  [t("office"), item.auctionOffice ?? t("notReported")],
                ]}
              />
            </CardContent>
          </Card>
          {item.lotId && (
            <Card>
              <CardHeader>
                <CardTitle>{t("lotItems")}</CardTitle>
              </CardHeader>
              <CardContent>
                {relatedList(related.filter((i) => i.lotId === item.lotId))}
              </CardContent>
            </Card>
          )}
          <Card>
            <CardHeader>
              <CardTitle>{t("otherAuctionItems")}</CardTitle>
            </CardHeader>
            <CardContent>{relatedList(related)}</CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="registryInfo">
          <Card>
            <CardHeader>
              <CardTitle>{t("registryInfo")}</CardTitle>
            </CardHeader>
            <CardContent>
              <Facts
                values={[
                  [
                    t(
                      item.category === "vehicles"
                        ? "plate"
                        : "registrationNumber"
                    ),
                    item.registrationNumber ?? item.plate ?? t("notReported"),
                  ],
                ]}
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="noticeTab" className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>{t("noticeTab")}</CardTitle>
            </CardHeader>
            <CardContent>
              <Facts
                values={[
                  [
                    t("noticeReference"),
                    item.noticeReference ?? t("notReported"),
                  ],
                  ...(item.auctionKind === "judicial"
                    ? ([
                        [t("caseNumber"), item.caseNumber ?? t("notReported")],
                      ] as [string, string][])
                    : []),
                  [
                    t("publication"),
                    item.noticePublication?.name ?? t("notReported"),
                  ],
                  [
                    t("issue"),
                    item.noticePublication?.issue ?? t("notReported"),
                  ],
                  [
                    t("publicationDate"),
                    item.noticePublication?.publishedAt ?? t("notReported"),
                  ],
                  [
                    t("locator"),
                    item.noticePublication?.locator ?? t("notReported"),
                  ],
                  [
                    t("extractionNotes"),
                    item.extractionNotes.join("\n") || t("notReported"),
                  ],
                ]}
              />
            </CardContent>
          </Card>
          {noticeFields}
          <Card>
            <CardHeader>
              <CardTitle>{t("fullNotice")}</CardTitle>
              <CardDescription>{t("demoNoticeWarning")}</CardDescription>
            </CardHeader>
            <CardContent>
              <article
                className="prose prose-sm max-w-none whitespace-pre-wrap dark:prose-invert"
                lang="es"
              >
                {originalText}
              </article>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="registryTab">
          <Alert>
            <AlertDescription>{t("registryUnavailable")}</AlertDescription>
          </Alert>
        </TabsContent>
        {item.category === "properties" && (
          <TabsContent value="location">
            <PropertyMap items={[item]} />
          </TabsContent>
        )}
        <TabsContent value="imagesTab">
          <ImagesPanel key={`${state.organization}:${id}`} id={id} />
        </TabsContent>
      </Tabs>
    </>
  )
}
