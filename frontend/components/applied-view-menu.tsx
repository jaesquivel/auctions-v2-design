"use client"
import { ChevronDown } from "lucide-react"
import { useTranslations } from "next-intl"
import { usePreview, queryKey } from "@/lib/preview-store"
import type { Category, Query } from "@/lib/domain"
import {
  applySavedView,
  applyDefaultView,
  isDefaultView,
  viewMatches,
} from "@/lib/saved-views"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu"
export function AppliedViewMenu({
  category,
  query,
  columns,
}: {
  category: Category
  query: Query
  columns: string[]
}) {
  const t = useTranslations()
  const { state, update } = usePreview()
  const views = state.savedFilters.filter(
    (view) =>
      view.owner === state.user &&
      view.organization === state.organization &&
      view.query.category === category
  )
  const preferred = state.appliedViewIds?.[queryKey(state.user, category)]
  const active =
    views.find(
      (view) => view.id === preferred && viewMatches(view, query, columns)
    ) ?? views.find((view) => viewMatches(view, query, columns))
  const defaultSelected =
    isDefaultView(query, columns) && (preferred === "__default__" || !active)
  const currentName = defaultSelected
    ? t("defaultView")
    : (active?.name ?? t("customView"))
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            aria-label={`${t("currentView")}: ${currentName}`}
            className="max-w-full"
          />
        }
      >
        <span className="max-w-64 truncate">{currentName}</span>
        <ChevronDown aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="max-h-80 w-72 max-w-[calc(100vw-2rem)] overflow-y-auto"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel>{t("savedFiltersMenu")}</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={defaultSelected ? "__default__" : (active?.id ?? "")}
            onValueChange={(id) =>
              update((s) =>
                id === "__default__"
                  ? applyDefaultView(s, category)
                  : applySavedView(s, id, category)
              )
            }
          >
            <DropdownMenuRadioItem value="__default__">
              {t("defaultViewNoFilters")}
            </DropdownMenuRadioItem>
            {views.map((view) => (
              <DropdownMenuRadioItem key={view.id} value={view.id}>
                <span className="max-w-64 truncate" title={view.name}>
                  {view.name}
                </span>
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
          {!views.length && (
            <p className="px-2 py-2 text-sm text-muted-foreground">
              {t("noSavedViewsListing")}
            </p>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
