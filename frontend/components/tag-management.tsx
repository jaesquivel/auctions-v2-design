"use client"
import { useState } from "react"
import { useTranslations, useLocale } from "next-intl"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, ArrowUpDown } from "lucide-react"
import { usePreview, colors, type Tag } from "@/lib/preview-store"
import { useRouter } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
  FieldDescription,
} from "@/components/ui/field"
import { normalizeTagColor, tagPalette } from "@/lib/tag-colors"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { DataTable } from "@/components/ui/data-table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Confirm, PageHeading, TagBadge, IconAction } from "./shared"
const tagSchema = z.object({
  label: z.string().trim().min(1).max(40),
  color: z
    .string()
    .trim()
    .refine((value) => normalizeTagColor(value) !== null)
    .transform((value) =>
      colors.includes(value as (typeof colors)[number])
        ? value
        : normalizeTagColor(value)!
    ),
  description: z.string().trim().max(2000),
})
export function TagManagement({ create = false }: { create?: boolean }) {
  const { state } = usePreview()
  return (
    <TagManagementBody
      key={`${state.user}:${state.organization}:${create}`}
      create={create}
    />
  )
}
function TagManagementBody({ create = false }: { create?: boolean }) {
  const t = useTranslations()
  const locale = useLocale()
  const router = useRouter()
  const { state, update, canManage } = usePreview()
  const [creating, setCreating] = useState(create)
  const [editing, setEditing] = useState<string | null>(null)
  const [pending, setPending] = useState<string | null>(null)
  const [sorts, setSorts] = useState<
    {
      field: "label" | "count"
      desc: boolean
    }[]
  >([{ field: "label", desc: false }])
  const form = useForm<z.infer<typeof tagSchema>>({
    resolver: zodResolver(tagSchema),
    defaultValues: { label: "", color: "gray", description: "" },
  })
  const closeForm = () => {
    setEditing(null)
    setCreating(false)
    form.reset({ label: "", color: "gray", description: "" })
    if (create) router.replace("/tags")
  }
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
    closeForm()
    toast.success(t("changesSaved"))
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
  const isPreset = colors.includes(selectedColor as (typeof colors)[number])
  const colorValue = isPreset ? selectedColor : "custom"
  const colorHex = normalizeTagColor(selectedColor) ?? tagPalette.gray
  const presetLabels =
    locale === "es"
      ? {
          gray: "Gris",
          blue: "Azul",
          green: "Verde",
          amber: "Ámbar",
          red: "Rojo",
          purple: "Morado",
        }
      : {
          gray: "Gray",
          blue: "Blue",
          green: "Green",
          amber: "Amber",
          red: "Red",
          purple: "Purple",
        }
  const colorOptions = [
    ...colors.map((value) => ({
      value,
      label: presetLabels[value],
      hex: tagPalette[value],
    })),
    { value: "custom", label: t("customColor"), hex: colorHex },
  ]
  const swatch = (hex: string) => (
    <span
      aria-hidden="true"
      className="size-3 shrink-0 rounded-full border"
      style={{ backgroundColor: hex }}
    />
  )
  const colorInput = (
    <Select
      items={colorOptions}
      value={colorValue}
      onValueChange={(value) => {
        if (value !== null)
          form.setValue("color", value === "custom" ? colorHex : value, {
            shouldDirty: true,
            shouldValidate: true,
          })
      }}
    >
      <SelectTrigger id="tag-color" aria-label={t("color")}>
        <SelectValue>
          <span className="flex items-center gap-2">
            {swatch(colorHex)}
            {colorOptions.find((option) => option.value === colorValue)?.label}
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {colorOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {swatch(option.hex)}
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
  const fields = (
    <FieldGroup>
      <Field data-invalid={!!form.formState.errors.label}>
        <FieldLabel htmlFor="tag-name">{t("tagLabel")}</FieldLabel>
        {nameInput}
        {form.formState.errors.label && (
          <FieldError>
            {form.formState.errors.label.message ?? t("tagNameError")}
          </FieldError>
        )}
      </Field>
      <Field>
        <FieldLabel htmlFor="tag-color">{t("color")}</FieldLabel>
        {colorInput}
      </Field>
      <Field data-invalid={!!form.formState.errors.color}>
        <FieldLabel htmlFor="tag-html-color">{t("htmlColor")}</FieldLabel>
        <Input
          id="tag-html-color"
          value={isPreset ? colorHex : selectedColor}
          onChange={(event) =>
            form.setValue("color", event.target.value, {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
          maxLength={7}
          placeholder="#2563EB"
          autoComplete="off"
          spellCheck={false}
          aria-invalid={!!form.formState.errors.color}
          aria-describedby="tag-html-color-help"
        />
        <FieldDescription id="tag-html-color-help">
          {t("htmlColorHelp")}
        </FieldDescription>
        {form.formState.errors.color && (
          <FieldError>{t("htmlColorError")}</FieldError>
        )}
      </Field>
      <Field data-invalid={!!form.formState.errors.description}>
        <FieldLabel htmlFor="tag-description">{t("description")}</FieldLabel>
        <Textarea
          id="tag-description"
          rows={3}
          maxLength={2000}
          className="max-h-48"
          aria-invalid={!!form.formState.errors.description}
          aria-describedby="tag-description-help"
          {...form.register("description")}
        />
        <FieldDescription id="tag-description-help">
          {t("tagDescriptionHelp")}
        </FieldDescription>
        {form.formState.errors.description && (
          <FieldError>{t("tagDescriptionError")}</FieldError>
        )}
      </Field>
    </FieldGroup>
  )
  return (
    <>
      <PageHeading title={t("tagCatalog")} description={t("tagHelp")}>
        {canManage && (
          <Button
            onClick={() => {
              form.reset({ label: "", color: "gray", description: "" })
              setEditing(null)
              setCreating(true)
            }}
          >
            <Plus />
            {t("createTag")}
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
            cell: ({ row }) => (
              <span className="block truncate" title={row.original.label}>
                <TagBadge
                  label={row.original.label}
                  color={row.original.color}
                  compact
                />
              </span>
            ),
          },
          {
            id: "description",
            accessorFn: (tag) => tag.description ?? "",
            header: t("description"),
            cell: ({ row }) => (
              <span
                className="block truncate"
                title={row.original.description || undefined}
              >
                {row.original.description || "—"}
              </span>
            ),
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
                      <IconAction
                        label={`${t("edit")}: ${tag.label}`}
                        onClick={() => {
                          setEditing(tag.id)
                          form.reset({
                            label: tag.label,
                            color: tag.color,
                            description: tag.description ?? "",
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
                    </div>
                  )}
                </>
              )
            },
          },
        ]}
        columnWidths={{
          label: 280,
          description: 420,
          count: 170,
          actions: 100,
        }}
        minWidth={970}
        sorting={sorts.map((sort) => ({ id: sort.field, desc: sort.desc }))}
      />
      <Dialog
        open={(creating || editing !== null) && canManage}
        onOpenChange={(open) => {
          if (!open) closeForm()
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t(creating ? "createTag" : "editTag")}</DialogTitle>
            <DialogDescription>{t("tagFormHelp")}</DialogDescription>
          </DialogHeader>
          <form onSubmit={save} className="space-y-5">
            {fields}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeForm}>
                {t("cancel")}
              </Button>
              <Button type="submit">{t("save")}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
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
