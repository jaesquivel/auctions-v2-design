"use client"
import { useEffect, useRef, useState } from "react"
import { useTranslations } from "next-intl"
import { Tag, Minus } from "lucide-react"
import { toast } from "sonner"
import { usePreview } from "@/lib/preview-store"
import type { Query } from "@/lib/domain"
import {
  bulkTagAssignments,
  matchingItemIds,
  tagChangeItemIds,
} from "@/lib/bulk-tags"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"
import { TagBadge } from "./shared"

export function BulkTagActions({
  query,
  total,
}: {
  query: Query
  total: number
}) {
  const t = useTranslations()
  const { state, update } = usePreview()
  const definitions = (state.tags[state.organization] ?? []).filter(
    (tag) => !tag.deleted
  )
  const assignments = state.assignments[state.organization] ?? {}
  const [itemIds, setItemIds] = useState<string[] | null>(null)
  const [loadError, setLoadError] = useState(false)
  const pending = useRef<AbortController | null>(null)
  const [confirmation, setConfirmation] = useState<{
    tagId: string
    action: "add" | "remove"
    itemIds: string[]
  } | null>(null)
  const confirmedTag = definitions.find((tag) => tag.id === confirmation?.tagId)
  const changeIds = confirmation
    ? tagChangeItemIds(
        assignments,
        confirmation.itemIds,
        confirmation.tagId,
        confirmation.action
      )
    : []
  const prepare = (tagId: string, action: "add" | "remove") => {
    if (!itemIds || pending.current) return
    setConfirmation({
      tagId,
      action,
      itemIds: tagChangeItemIds(assignments, itemIds, tagId, action),
    })
  }
  useEffect(() => () => pending.current?.abort(), [])
  const loadMatches = async () => {
    if (itemIds !== null || pending.current) return
    const controller = new AbortController()
    pending.current = controller
    setLoadError(false)
    try {
      const ids = await matchingItemIds(query, async (pageQuery) => {
        const response = await fetch("/api/items/query", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(pageQuery),
          signal: controller.signal,
        })
        if (!response.ok) throw Error("Cannot load matching items")
        return response.json()
      })
      if (!controller.signal.aborted) setItemIds(ids)
    } catch {
      if (!controller.signal.aborted) setLoadError(true)
    } finally {
      if (pending.current === controller) pending.current = null
    }
  }
  const apply = () => {
    if (!confirmation || !confirmedTag || !changeIds.length) return
    const { tagId, action } = confirmation
    let applied = false
    let changed = 0
    update((s) => {
      if (
        s.user !== state.user ||
        s.organization !== state.organization ||
        !(s.tags[s.organization] ?? []).some(
          (tag) => tag.id === tagId && !tag.deleted
        )
      )
        return s
      applied = true
      const result = bulkTagAssignments(
        s.assignments[s.organization] ?? {},
        confirmation.itemIds,
        tagId,
        action
      )
      changed = result.changed
      return {
        ...s,
        assignments: { ...s.assignments, [s.organization]: result.assignments },
      }
    })
    setConfirmation(null)
    if (!applied) return
    toast.success(
      t(action === "add" ? "bulkTagAdded" : "bulkTagRemoved", {
        count: changed,
      })
    )
  }
  return (
    <div className="flex flex-wrap items-center gap-2">
      {(["add", "remove"] as const).map((action) => {
        const tags =
          action === "add"
            ? definitions
            : definitions.filter((tag) =>
                itemIds?.some((id) => assignments[id]?.includes(tag.id))
              )
        const Icon = action === "add" ? Tag : Minus
        return (
          <DropdownMenu
            key={action}
            onOpenChange={(open) => {
              if (open) void loadMatches()
            }}
          >
            <DropdownMenuTrigger
              render={
                <Button
                  variant="outline"
                  disabled={!total || !definitions.length}
                />
              }
            >
              <Icon />
              {t(action === "add" ? "bulkAddTag" : "bulkRemoveTag")}
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="max-h-80 w-72 max-w-[calc(100vw-2rem)] overflow-y-auto"
            >
              <DropdownMenuGroup>
                <DropdownMenuLabel>
                  {t("bulkTagScope", { count: total })}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {loadError ? (
                  <p
                    role="alert"
                    className="px-2 py-2 text-sm text-destructive"
                  >
                    {t("bulkTagLoadError")}
                  </p>
                ) : itemIds === null ? (
                  <p className="px-2 py-2 text-sm text-muted-foreground">
                    {t("loadingItems")}
                  </p>
                ) : !tags.length ? (
                  <p className="px-2 py-2 text-sm text-muted-foreground">
                    {t("noAssignedTags")}
                  </p>
                ) : (
                  tags.map((tag) => (
                    <DropdownMenuItem
                      key={tag.id}
                      title={tag.label}
                      disabled={
                        action === "add" &&
                        itemIds!.every((id) =>
                          assignments[id]?.includes(tag.id)
                        )
                      }
                      onClick={() => prepare(tag.id, action)}
                    >
                      <TagBadge label={tag.label} color={tag.color} compact />
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      })}
      <span className="text-xs text-muted-foreground">
        {t("bulkTagScope", { count: total })}
      </span>
      <AlertDialog
        open={!!confirmation}
        onOpenChange={(open) => {
          if (!open) setConfirmation(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t(
                confirmation?.action === "remove"
                  ? "bulkTagConfirmRemoveTitle"
                  : "bulkTagConfirmAddTitle"
              )}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                confirmation?.action === "remove"
                  ? "bulkTagConfirmRemove"
                  : "bulkTagConfirmAdd",
                { count: changeIds.length, tag: confirmedTag?.label ?? "" }
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              variant={
                confirmation?.action === "remove" ? "destructive" : "default"
              }
              disabled={!confirmedTag || !changeIds.length}
              onClick={apply}
            >
              {t(
                confirmation?.action === "remove"
                  ? "bulkRemoveTag"
                  : "bulkAddTag"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
