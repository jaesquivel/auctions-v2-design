"use client"
import { useTranslations } from "next-intl"
import { Tag, Minus } from "lucide-react"
import { toast } from "sonner"
import { usePreview } from "@/lib/preview-store"
import { bulkTagAssignments } from "@/lib/bulk-tags"
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
import { TagBadge } from "./shared"

export function BulkTagActions({ itemIds }: { itemIds: string[] }) {
  const t = useTranslations()
  const { state, update } = usePreview()
  const definitions = (state.tags[state.organization] ?? []).filter(
    (tag) => !tag.deleted
  )
  const assignments = state.assignments[state.organization] ?? {}
  const apply = (tagId: string, action: "add" | "remove") => {
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
      const result = bulkTagAssignments(
        s.assignments[s.organization] ?? {},
        itemIds,
        tagId,
        action
      )
      changed = result.changed
      return {
        ...s,
        assignments: { ...s.assignments, [s.organization]: result.assignments },
      }
    })
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
                itemIds.some((id) => assignments[id]?.includes(tag.id))
              )
        const Icon = action === "add" ? Tag : Minus
        return (
          <DropdownMenu key={action}>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="outline"
                  disabled={!itemIds.length || !tags.length}
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
                  {t("bulkTagScope", { count: itemIds.length })}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {tags.map((tag) => (
                  <DropdownMenuItem
                    key={tag.id}
                    title={tag.label}
                    disabled={
                      action === "add" &&
                      itemIds.every((id) => assignments[id]?.includes(tag.id))
                    }
                    onClick={() => apply(tag.id, action)}
                  >
                    <TagBadge label={tag.label} color={tag.color} compact />
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      })}
      <span className="text-xs text-muted-foreground">
        {t("bulkTagScope", { count: itemIds.length })}
      </span>
    </div>
  )
}
