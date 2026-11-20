"use client"
import { useTranslations } from "next-intl"
import { useId } from "react"
import type { Category } from "@/lib/domain"
import { columnKeys, defaultColumns } from "@/lib/listing-view"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"

export const listingLabelKey = (key: string) =>
  (
    ({
      locality: "location",
      amount: "base",
      date: "nextEvent",
      reference: "noticeReference",
    }) as Record<string, string>
  )[key] ?? key
export function ColumnsControls({
  category,
  selected,
  onChange,
}: {
  category: Category
  selected: string[]
  onChange: (columns: string[]) => void
}) {
  const t = useTranslations()
  const id = useId()
  return (
    <section className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h3 className="font-medium">{t("columns")}</h3>
          <p className="text-sm text-muted-foreground">
            {t("columnsViewHelp")}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onChange(defaultColumns(category))}
        >
          {t("resetColumns")}
        </Button>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {columnKeys(category).map((key) => (
          <label
            key={key}
            htmlFor={`${id}-${key}`}
            className="flex items-center gap-3 rounded-lg border p-3 text-sm"
          >
            <Checkbox
              id={`${id}-${key}`}
              checked={selected.includes(key)}
              disabled={selected.length === 1 && selected.includes(key)}
              onCheckedChange={(checked) =>
                onChange(
                  checked
                    ? [...selected, key]
                    : selected.filter((value) => value !== key)
                )
              }
            />
            {t(listingLabelKey(key))}
          </label>
        ))}
      </div>
    </section>
  )
}
