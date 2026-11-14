"use client"
import { useState } from "react"
import { useTranslations, useLocale } from "next-intl"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, Save, X, ArrowUpDown } from "lucide-react"
import { usePreview, colors, type Tag } from "@/lib/preview-store"
import { Link, useRouter } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field"
import { DataTable } from "@/components/ui/data-table"
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
  const nameInput = (
    <Input
      id="tag-name"
      aria-invalid={!!form.formState.errors.label}
      aria-label={t("tagLabel")}
      {...form.register("label")}
      maxLength={40}
    />
  )
  const colorInput = (
    <Choice
      id="tag-color"
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
  )
  const fields = (
    <>
      {nameInput}
      {colorInput}
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
                <FieldGroup>
                  <Field data-invalid={!!form.formState.errors.label}>
                    <FieldLabel htmlFor="tag-name">{t("tagLabel")}</FieldLabel>
                    {nameInput}
                    {form.formState.errors.label && (
                      <FieldError>
                        {form.formState.errors.label.message ??
                          t("tagNameError")}
                      </FieldError>
                    )}
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="tag-color">{t("color")}</FieldLabel>
                    {colorInput}
                  </Field>
                </FieldGroup>
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
      <DataTable<Tag>
        data={sorted}
        getRowId={(tag) => tag.id}
        columns={[
          {
            id: "label",
            header: () => (
              <>
                <Button
                  variant="ghost"
                  onClick={(e) => sort("label", e.shiftKey)}
                >
                  {t("tagLabel")}
                  <ArrowUpDown />
                </Button>
              </>
            ),
            cell: ({ row }) => {
              const tag = row.original
              return (
                <>
                  {editing === tag.id ? (
                    <form
                      id="tag-inline"
                      onSubmit={save}
                      className="flex flex-nowrap gap-2"
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
                    <span className="block truncate" title={tag.label}>
                      <TagBadge label={tag.label} color={tag.color} compact />
                    </span>
                  )}
                </>
              )
            },
          },
          {
            id: "count",
            header: () => (
              <>
                <Button
                  variant="ghost"
                  onClick={(e) => sort("count", e.shiftKey)}
                >
                  {t("assignedItems")}
                  <ArrowUpDown />
                </Button>
              </>
            ),
            cell: ({ row }) => {
              const tag = row.original
              return <>{count(tag.id)}</>
            },
          },
          {
            id: "actions",
            header: () => (
              <>
                <span className="sr-only">{t("edit")}</span>
              </>
            ),
            cell: ({ row }) => {
              const tag = row.original
              return (
                <>
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
                </>
              )
            },
          },
        ]}
        columnWidths={{ label: 520, count: 170, actions: 100 }}
        minWidth={790}
        sorting={sorts.map((sort) => ({ id: sort.field, desc: sort.desc }))}
      />
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
