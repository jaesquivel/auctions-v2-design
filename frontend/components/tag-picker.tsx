"use client"
import { useTranslations } from "next-intl"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover"
import { Toggle } from "@/components/ui/toggle"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { usePreview } from "@/lib/preview-store"
import { TagBadge } from "./shared"
export function TagPicker({ id }: { id: string }) {
  const t = useTranslations()
  const { state, update } = usePreview()
  const definitions = state.tags[state.organization] ?? []
  const selected = state.assignments[state.organization]?.[id] ?? []
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="h-auto justify-start"
          aria-label={`${t("editTags")}: ${id}`}
        >
          <span className="flex flex-wrap gap-1">
            {selected.length ? (
              selected.map((tagId) => {
                const tag = definitions.find((x) => x.id === tagId)
                return tag ? (
                  <TagBadge key={tag.id} label={tag.label} color={tag.color} />
                ) : null
              })
            ) : (
              <span className="text-muted-foreground">
                {t("noAssignedTags")}
              </span>
            )}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start">
        <h3 className="mb-3 font-medium">{t("tags")}</h3>
        <ScrollArea className="h-64">
          <div className="flex flex-col gap-1">
            {definitions
              .filter((tag) => !tag.deleted)
              .map((tag) => (
                <Toggle
                  key={tag.id}
                  pressed={selected.includes(tag.id)}
                  onPressedChange={(pressed) =>
                    update((s) => ({
                      ...s,
                      assignments: {
                        ...s.assignments,
                        [s.organization]: {
                          ...s.assignments[s.organization],
                          [id]: pressed
                            ? [
                                ...new Set([
                                  ...(s.assignments[s.organization]?.[id] ??
                                    []),
                                  tag.id,
                                ]),
                              ]
                            : (
                                s.assignments[s.organization]?.[id] ?? []
                              ).filter((x) => x !== tag.id),
                        },
                      },
                    }))
                  }
                  className="justify-start"
                  aria-label={tag.label}
                >
                  <TagBadge label={tag.label} color={tag.color} />
                </Toggle>
              ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
