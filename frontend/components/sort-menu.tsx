"use client"
import { useTranslations } from "next-intl"
import {
  ArrowUp,
  ArrowDown,
  ChevronUp,
  ChevronDown,
  Plus,
  Trash2,
} from "lucide-react"
import type { Sort } from "@/lib/domain"
import { Button } from "@/components/ui/button"

import { Choice } from "./shared"

export function SortControls({
  sorts,
  options,
  onChange,
}: {
  sorts: Sort[]
  options: { value: string; label: string }[]
  onChange: (sorts: Sort[]) => void
}) {
  const t = useTranslations()
  const nextField = options.find(
    (o) => o.value !== "amount" && !sorts.some((s) => s.field === o.value)
  )
  const patch = (index: number, values: Partial<Sort>) =>
    onChange(sorts.map((s, i) => (i === index ? { ...s, ...values } : s)))
  const move = (index: number, delta: number) => {
    const target = index + delta
    if (target < 0 || target >= sorts.length) return
    const next = [...sorts]
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(next)
  }
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h3 className="font-medium">{t("sortBy")}</h3>
          <p className="text-xs text-muted-foreground">{t("sortDraftHelp")}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={!sorts.length}
          onClick={() => onChange([])}
        >
          {t("clearSorting")}
        </Button>
      </div>
      <div className="space-y-2">
        {!sorts.length && (
          <p className="text-sm text-muted-foreground">{t("noSorts")}</p>
        )}
        {sorts.map((sort, index) => {
          const name =
            options.find((o) => o.value === sort.field)?.label ?? sort.field
          const Direction = sort.direction === "asc" ? ArrowUp : ArrowDown
          return (
            <div key={sort.field} className="flex items-center gap-2">
              <span className="w-3 shrink-0 text-xs text-muted-foreground">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1 [&>button]:w-full">
                <Choice
                  label={`${t("sortBy")} ${index + 1}`}
                  value={sort.field}
                  options={options.filter(
                    (o) =>
                      o.value === sort.field ||
                      !sorts.some((s) => s.field === o.value)
                  )}
                  onChange={(field) =>
                    patch(index, { field: field as Sort["field"] })
                  }
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                aria-label={t("toggleSortDirection", {
                  name,
                  direction: t(
                    sort.direction === "asc" ? "ascending" : "descending"
                  ),
                })}
                title={t(sort.direction === "asc" ? "ascending" : "descending")}
                onClick={() =>
                  patch(index, {
                    direction: sort.direction === "asc" ? "desc" : "asc",
                  })
                }
              >
                <Direction aria-hidden="true" />
              </Button>
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`${t("sortMoveUp")}: ${name}`}
                  title={t("sortMoveUp")}
                  disabled={index === 0}
                  onClick={() => move(index, -1)}
                >
                  <ChevronUp aria-hidden="true" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`${t("sortMoveDown")}: ${name}`}
                  title={t("sortMoveDown")}
                  disabled={index === sorts.length - 1}
                  onClick={() => move(index, 1)}
                >
                  <ChevronDown aria-hidden="true" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`${t("clearSort")}: ${name}`}
                  title={t("clearSort")}
                  onClick={() => onChange(sorts.filter((_, i) => i !== index))}
                >
                  <Trash2 aria-hidden="true" />
                </Button>
              </div>
            </div>
          )
        })}
      </div>
      <div className="flex items-center justify-between gap-2 border-t pt-3">
        <Button
          variant="outline"
          size="sm"
          disabled={sorts.length >= 5 || !nextField}
          onClick={() => {
            if (nextField)
              onChange([
                ...sorts,
                {
                  field: nextField.value as Sort["field"],
                  direction: "asc",
                },
              ])
          }}
        >
          <Plus />
          {t("addSort")}
        </Button>
      </div>
    </div>
  )
}
