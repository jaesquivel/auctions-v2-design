"use client"
import { useTranslations } from "next-intl"
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  EllipsisVertical,
  Plus,
  X,
} from "lucide-react"
import type { Sort } from "@/lib/domain"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { Choice } from "./shared"

export function SortMenu({
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
    <Popover>
      <PopoverTrigger render={<Button variant="outline" />}>
        <ArrowUpDown aria-hidden="true" />
        {t("sortMenu")}
        {sorts.length > 0 && <Badge variant="secondary">{sorts.length}</Badge>}
        <ChevronDown aria-hidden="true" />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 max-w-[calc(100vw-2rem)]">
        <div className="space-y-4">
          <div className="space-y-1">
            <h3 className="font-medium">{t("sortBy")}</h3>
            <p className="text-xs text-muted-foreground">{t("sortMenuHelp")}</p>
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
                    title={t(
                      sort.direction === "asc" ? "ascending" : "descending"
                    )}
                    onClick={() =>
                      patch(index, {
                        direction: sort.direction === "asc" ? "desc" : "asc",
                      })
                    }
                  >
                    <Direction aria-hidden="true" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={t("sortRuleActions", { name })}
                        />
                      }
                    >
                      <EllipsisVertical aria-hidden="true" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        disabled={index === 0}
                        onClick={() => move(index, -1)}
                      >
                        <ArrowUp />
                        {t("sortMoveUp")}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        disabled={index === sorts.length - 1}
                        onClick={() => move(index, 1)}
                      >
                        <ArrowDown />
                        {t("sortMoveDown")}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          onChange(sorts.filter((_, i) => i !== index))
                        }
                      >
                        <X />
                        {t("clearSort")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
            <Button
              variant="ghost"
              size="sm"
              disabled={!sorts.length}
              onClick={() => onChange([])}
            >
              {t("clearAllSorts")}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
