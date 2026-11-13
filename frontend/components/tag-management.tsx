"use client"
import { useState } from "react"
import { useTranslations, useLocale } from "next-intl"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, Save, X, ArrowUpDown } from "lucide-react"
import { usePreview, colors } from "@/lib/preview-store"
import { Link, useRouter } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Choice, Confirm, PageHeading, TagBadge, IconAction } from "./shared"
const tagSchema = z.object({
  label: z.string().trim().min(1).max(40),
  color: z.enum(colors),
})
export function TagManagement({ create = false }: { create?: boolean }) {
  const { state } = usePreview()
  return (
    <TagManagementBody
      key={`${state.user}:${state.organization}`}
      create={create}
    />
  )
}
function TagManagementBody({ create = false }: { create?: boolean }) {
  const t = useTranslations()
  const locale = useLocale()
  const router = useRouter()
  const { state, update, canManage } = usePreview()
  const [editing, setEditing] = useState<string | null>(null)
  const [pending, setPending] = useState<string | null>(null)
  const [sorts, setSorts] = useState<
    { field: "label" | "count"; desc: boolean }[]
  >([{ field: "label", desc: false }])
  const form = useForm<z.infer<typeof tagSchema>>({
    resolver: zodResolver(tagSchema),
    defaultValues: { label: "", color: "gray" },
  })
  const selectedColor = useWatch({ control: form.control, name: "color" })
  const tags = state.tags[state.organization] ?? []
  const count = (id: string) =>
    Object.values(state.assignments[state.organization] ?? {}).filter((ids) =>
      ids.includes(id)
    ).length
  const sorted = tags
    .filter((tag) => !tag.deleted)
    .toSorted((a, b) => {
      for (const sort of sorts) {
        const n =
          sort.field === "label"
            ? a.label.localeCompare(b.label)
            : count(a.id) - count(b.id)
        if (n) return sort.desc ? -n : n
      }
      return a.id.localeCompare(b.id)
    })
  const sort = (field: "label" | "count", add: boolean) => {
    const old = sorts.find((s) => s.field === field)
    const next = { field, desc: old ? !old.desc : false }
    setSorts(add ? [...sorts.filter((s) => s.field !== field), next] : [next])
  }
  const save = form.handleSubmit((values) => {
    if (!canManage) return
    if (
      tags.some(
        (tag) =>
          !tag.deleted &&
          tag.id !== editing &&
          tag.label.toLocaleLowerCase() === values.label.toLocaleLowerCase()
      )
    ) {
      form.setError("label", { message: t("tagNameError") })
      return
    }
    update((s) => ({
      ...s,
      tags: {
        ...s.tags,
        [s.organization]: editing
          ? (s.tags[s.organization] ?? []).map((tag) =>
              tag.id === editing ? { ...tag, ...values } : tag
            )
          : [
              ...(s.tags[s.organization] ?? []),
              { id: crypto.randomUUID(), ...values },
            ],
      },
    }))
    setEditing(null)
    form.reset()
    toast.success(t("changesSaved"))
    if (create) router.push("/tags")
  })
  const fields = (
    <>
      <Input
        aria-label={t("tagLabel")}
        {...form.register("label")}
        maxLength={40}
      />
      <Choice
        value={selectedColor}
        onChange={(color) =>
          form.setValue("color", color as (typeof colors)[number])
        }
        label={t("color")}
        options={colors.map((value) => ({
          value,
          label:
            locale === "es"
              ? {
                  gray: "Gris",
                  blue: "Azul",
                  green: "Verde",
                  amber: "Ámbar",
                  red: "Rojo",
                  purple: "Morado",
                }[value]
              : value,
        }))}
      />
    </>
  )
  if (create)
    return (
      <>
        <PageHeading title={t("createTag")} />
        {!canManage ? (
          <Alert>
            <AlertDescription>{t("roleReadOnly")}</AlertDescription>
          </Alert>
        ) : (
          <Card className="max-w-xl">
            <CardHeader>
              <CardTitle>{t("tagCatalog")}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={save} className="space-y-5">
                <Field>
                  <FieldLabel>{t("tagLabel")}</FieldLabel>
                  {fields}
                  {form.formState.errors.label && (
                    <FieldError>
                      {form.formState.errors.label.message ?? t("tagNameError")}
                    </FieldError>
                  )}
                </Field>
                <div className="flex gap-2">
                  <Button type="submit">{t("save")}</Button>
                  <Button variant="outline" asChild>
                    <Link href="/tags">{t("cancel")}</Link>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </>
    )
  return (
    <>
      <PageHeading title={t("tagCatalog")} description={t("tagHelp")}>
        {canManage && (
          <Button asChild>
            <Link href="/tags/new">
              <Plus />
              {t("createTag")}
            </Link>
          </Button>
        )}
      </PageHeading>
      {!canManage && (
        <Alert>
          <AlertDescription>{t("roleReadOnly")}</AlertDescription>
        </Alert>
      )}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={(e) => sort("label", e.shiftKey)}
                >
                  {t("tagLabel")}
                  <ArrowUpDown />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={(e) => sort("count", e.shiftKey)}
                >
                  {t("assignedItems")}
                  <ArrowUpDown />
                </Button>
              </TableHead>
              <TableHead>
                <span className="sr-only">{t("edit")}</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((tag) => (
              <TableRow key={tag.id}>
                <TableCell>
                  {editing === tag.id ? (
                    <form
                      id="tag-inline"
                      onSubmit={save}
                      className="flex flex-wrap gap-2"
                    >
                      {fields}
                      {form.formState.errors.label && (
                        <span className="text-xs text-destructive">
                          {form.formState.errors.label.message ??
                            t("tagNameError")}
                        </span>
                      )}
                    </form>
                  ) : (
                    <TagBadge label={tag.label} color={tag.color} />
                  )}
                </TableCell>
                <TableCell>{count(tag.id)}</TableCell>
                <TableCell>
                  {canManage && (
                    <div className="flex gap-1">
                      {editing === tag.id ? (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            type="submit"
                            form="tag-inline"
                            aria-label={t("save")}
                          >
                            <Save />
                          </Button>
                          <IconAction
                            label={t("cancel")}
                            onClick={() => setEditing(null)}
                          >
                            <X />
                          </IconAction>
                        </>
                      ) : (
                        <>
                          <IconAction
                            label={`${t("edit")}: ${tag.label}`}
                            onClick={() => {
                              setEditing(tag.id)
                              form.reset({
                                label: tag.label,
                                color: tag.color as (typeof colors)[number],
                              })
                            }}
                          >
                            <Pencil />
                          </IconAction>
                          <IconAction
                            label={`${t("delete")}: ${tag.label}`}
                            onClick={() => setPending(tag.id)}
                          >
                            <Trash2 />
                          </IconAction>
                        </>
                      )}
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Confirm
        open={!!pending}
        onOpenChange={(open) => !open && setPending(null)}
        title={t("deleteTagTitle")}
        description={t("deleteTagHelp")}
        onConfirm={() => {
          if (!canManage || !pending) return
          update((s) => ({
            ...s,
            tags: {
              ...s.tags,
              [s.organization]: s.tags[s.organization].map((tag) =>
                tag.id === pending ? { ...tag, deleted: true } : tag
              ),
            },
          }))
          setPending(null)
          toast.success(t("changesSaved"))
        }}
      />
    </>
  )
}
