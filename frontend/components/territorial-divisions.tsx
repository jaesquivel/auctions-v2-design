"use client"
import { useState } from "react"
import { useTranslations, useLocale } from "next-intl"
import { ChevronRight, ChevronDown, Plus, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { usePreview } from "@/lib/preview-store"
import {
  changeDivisions,
  hydrateDivisions,
  normalizeDivisionName,
  divisionPath,
  initialDivisions,
  territorialConfig,
  visibleDivisions,
  type TerritorialDivision,
  type DivisionCommand,
  type DivisionError,
} from "@/lib/territorial-divisions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DataTable, type DataTableColumn } from "@/components/ui/data-table"
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
import { PageHeading, IconAction, Confirm, Choice } from "./shared"

export function TerritorialDivisions() {
  const { state } = usePreview()
  return <TerritorialDivisionsBody key={state.user} />
}
function TerritorialDivisionsBody() {
  const t = useTranslations()
  const locale = useLocale()
  const { state, update } = usePreview()
  const nodes = hydrateDivisions(state.territorialDivisions ?? initialDivisions)
  const canEdit = !!state.sysadmins?.[state.user]
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [draft, setDraft] = useState<TerritorialDivision | null>(null)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<DivisionError | null>(null)
  const [pending, setPending] = useState<TerritorialDivision | null>(null)
  const levelName = (level: number) => t(territorialConfig.levels[level])
  const close = () => {
    setDraft(null)
    setError(null)
  }
  const begin = (parent: TerritorialDivision | null) => {
    setCreating(true)
    setError(null)
    setDraft({
      id: crypto.randomUUID(),
      name: "",
      code: "",
      area: null,
      altitude: null,
      normalized_name: "",
      level: parent ? parent.level + 1 : 0,
      parentId: parent?.id ?? null,
    })
  }
  const commit = (command: DivisionCommand) => {
    let success = false
    // Recheck current permissions and catalog inside the update, not only rendered controls.
    update((s) => {
      const result = changeDivisions(
        hydrateDivisions(s.territorialDivisions ?? initialDivisions),
        command,
        !!s.sysadmins?.[s.user]
      )
      if (result.error) {
        setError(result.error)
        return s
      }
      success = true
      return { ...s, territorialDivisions: result.divisions }
    })
    if (success) {
      if (command.type === "save" && command.division.parentId)
        setExpanded((old) => new Set([...old, command.division.parentId!]))
      close()
      toast.success(t("changesSaved"))
    }
    return success
  }
  const columns: DataTableColumn<TerritorialDivision>[] = [
    {
      id: "name",
      accessorKey: "name",
      header: t("territoryName"),
      cell: ({ row }) => {
        const n = row.original
        const children = nodes.filter((child) => child.parentId === n.id)
        const open = expanded.has(n.id)
        return (
          <div
            className="flex min-w-0 items-center gap-2"
            style={{ paddingLeft: n.level * 24 }}
          >
            {children.length ? (
              <Button
                variant="ghost"
                size="icon"
                aria-expanded={open}
                aria-label={t(open ? "collapseDivision" : "expandDivision", {
                  name: n.name,
                })}
                onClick={() =>
                  setExpanded((old) => {
                    const next = new Set(old)
                    if (next.has(n.id)) next.delete(n.id)
                    else next.add(n.id)
                    return next
                  })
                }
              >
                {open ? <ChevronDown /> : <ChevronRight />}
              </Button>
            ) : (
              <span className="size-8 shrink-0" aria-hidden="true" />
            )}
            <span className="truncate" title={divisionPath(nodes, n.id)}>
              {n.name}
            </span>
            {children.length > 0 && (
              <span className="text-xs text-muted-foreground">
                {children.length}
              </span>
            )}
          </div>
        )
      },
    },
    {
      id: "level",
      accessorFn: (n) => levelName(n.level),
      header: t("territoryLevel"),
    },
    { id: "code", accessorKey: "code", header: t("territoryCode") },
    ...(["area", "altitude"] as const).map((field) => ({
      id: field,
      accessorKey: field,
      header: t(field === "area" ? "divisionArea" : "divisionAltitude"),
      cell: ({ row }: { row: { original: TerritorialDivision } }) =>
        row.original[field] === null
          ? "—"
          : new Intl.NumberFormat(locale, { maximumFractionDigits: 6 }).format(
              row.original[field]!
            ),
    })),
    ...(canEdit
      ? [
          {
            id: "actions",
            header: () => <span className="sr-only">{t("actions")}</span>,
            cell: ({ row }: { row: { original: TerritorialDivision } }) => {
              const n = row.original
              return (
                <div className="flex justify-end">
                  {n.level < territorialConfig.levels.length - 1 && (
                    <IconAction
                      label={t("addDivisionChild", {
                        level: levelName(n.level + 1),
                        name: n.name,
                      })}
                      onClick={() => begin(n)}
                    >
                      <Plus />
                    </IconAction>
                  )}
                  <IconAction
                    label={t("editDivision", { name: n.name })}
                    onClick={() => {
                      setCreating(false)
                      setError(null)
                      setDraft({ ...n })
                    }}
                  >
                    <Pencil />
                  </IconAction>
                  <IconAction
                    label={t("deleteDivision", { name: n.name })}
                    onClick={() => {
                      setError(null)
                      setPending(n)
                    }}
                  >
                    <Trash2 />
                  </IconAction>
                </div>
              )
            },
          },
        ]
      : []),
  ]
  const parents =
    draft && draft.level > 0
      ? nodes
          .filter((n) => n.level === draft.level - 1)
          .map((n) => ({ value: n.id, label: divisionPath(nodes, n.id) }))
      : []
  return (
    <div className="space-y-6">
      <PageHeading
        title={t("territorialDivisions")}
        description={t("territorialHelp")}
      >
        {canEdit && (
          <Button onClick={() => begin(null)}>
            <Plus />
            {t("addDivision", { level: levelName(0) })}
          </Button>
        )}
      </PageHeading>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {territorialConfig.levels.map((level, i) => (
            <Badge key={level} variant="secondary">
              {t(`${level}Plural`)}: {nodes.filter((n) => n.level === i).length}
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setExpanded(
                new Set(
                  nodes
                    .filter((n) =>
                      nodes.some((child) => child.parentId === n.id)
                    )
                    .map((n) => n.id)
                )
              )
            }
          >
            {t("expandAllDivisions")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setExpanded(new Set())}
          >
            {t("collapseAllDivisions")}
          </Button>
        </div>
      </div>
      <DataTable
        data={visibleDivisions(nodes, expanded)}
        columns={columns}
        getRowId={(n) => n.id}
        minWidth={canEdit ? 1000 : 870}
        columnWidths={{
          name: 340,
          level: 140,
          code: 100,
          area: 140,
          altitude: 150,
          actions: 130,
        }}
      />
      <p className="text-xs text-muted-foreground">
        {t("territorialSource")}{" "}
        <a
          className="underline underline-offset-4"
          href={territorialConfig.sourceUrl}
          target="_blank"
          rel="noreferrer"
        >
          IGN · {territorialConfig.sourceYear}
        </a>
      </p>
      <Dialog
        open={!!draft && canEdit}
        onOpenChange={(open) => {
          if (!open) close()
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {draft &&
                t(creating ? "addDivision" : "editDivisionTitle", {
                  level: levelName(draft.level),
                })}
            </DialogTitle>
            <DialogDescription>{t("territorialFormHelp")}</DialogDescription>
          </DialogHeader>
          {draft && (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                commit({ type: "save", division: draft })
              }}
              className="space-y-6"
            >
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="division-name">
                    {t("territoryName")}
                  </FieldLabel>
                  <Input
                    id="division-name"
                    value={draft.name}
                    maxLength={120}
                    required
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        name: e.target.value,
                        normalized_name: normalizeDivisionName(e.target.value),
                      })
                    }
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="division-code">
                    {t("territoryCode")}
                  </FieldLabel>
                  <Input
                    id="division-code"
                    value={draft.code}
                    maxLength={30}
                    required
                    onChange={(e) =>
                      setDraft({ ...draft, code: e.target.value })
                    }
                  />
                </Field>
                {draft.level > 0 && (
                  <Field>
                    <FieldLabel htmlFor="division-parent">
                      {levelName(draft.level - 1)}
                    </FieldLabel>
                    <Choice
                      id="division-parent"
                      label={levelName(draft.level - 1)}
                      value={draft.parentId ?? ""}
                      options={parents}
                      onChange={(parentId) => setDraft({ ...draft, parentId })}
                    />
                  </Field>
                )}
                <div className="grid grid-cols-2 gap-4">
                  {(["area", "altitude"] as const).map((field) => (
                    <Field key={field}>
                      <FieldLabel htmlFor={`division-${field}`}>
                        {t(
                          field === "area" ? "divisionArea" : "divisionAltitude"
                        )}
                      </FieldLabel>
                      <Input
                        id={`division-${field}`}
                        type="number"
                        step="any"
                        min={field === "area" ? 0 : undefined}
                        value={draft[field] ?? ""}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            [field]:
                              e.target.value === ""
                                ? null
                                : Number(e.target.value),
                          })
                        }
                      />
                    </Field>
                  ))}
                </div>
                <Field>
                  <FieldLabel htmlFor="division-normalized-name">
                    normalized_name
                  </FieldLabel>
                  <Input
                    id="division-normalized-name"
                    value={draft.normalized_name}
                    readOnly
                  />
                  <FieldDescription>
                    {t("divisionNormalizedHelp")}
                  </FieldDescription>
                </Field>
                {error && (
                  <FieldError>{t(`divisionError_${error}`)}</FieldError>
                )}
              </FieldGroup>
              <DialogFooter>
                <Button variant="outline" onClick={close}>
                  {t("cancel")}
                </Button>
                <Button type="submit">{t("save")}</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
      {error && !draft && (
        <p role="alert" className="text-sm text-destructive">
          {t(`divisionError_${error}`)}
        </p>
      )}
      <Confirm
        open={!!pending && canEdit}
        onOpenChange={(open) => {
          if (!open) setPending(null)
        }}
        title={t("deleteDivision", { name: pending?.name ?? "" })}
        description={t("deleteDivisionHelp")}
        onConfirm={() => {
          if (pending) commit({ type: "delete", id: pending.id })
          setPending(null)
        }}
      />
    </div>
  )
}
