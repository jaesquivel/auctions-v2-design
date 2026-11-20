"use client"
import { ChevronDown } from "lucide-react"
import { useTranslations } from "next-intl"
import type { DraftTerm } from "@/lib/filter-draft"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Toggle } from "@/components/ui/toggle"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover"
import { Choice, TagBadge } from "./shared"

export function TagFilterOperand({
  term,
  tags,
  label,
  onChange,
}: {
  term: DraftTerm
  tags: { id: string; label: string; color: string }[]
  label: string
  onChange: (patch: Partial<DraftTerm>) => void
}) {
  const t = useTranslations()
  const selected = term.tagIds ?? (term.value ? [term.value] : [])
  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            aria-label={label}
            className="h-auto min-h-8 max-w-full"
          />
        }
      >
        <span className="flex flex-wrap gap-1">
          {selected.length
            ? selected.map((id) => {
                const tag = tags.find((tag) => tag.id === id)
                return (
                  <TagBadge
                    key={id}
                    label={tag?.label ?? t("unavailableTag")}
                    color={tag?.color ?? "slate"}
                  />
                )
              })
            : t("selectTags")}
        </span>
        <ChevronDown aria-hidden="true" />
      </PopoverTrigger>
      <PopoverContent align="start" className="max-h-72 overflow-y-auto">
        <div className="flex flex-col gap-1">
          {tags.map((tag) => (
            <Toggle
              key={tag.id}
              aria-label={tag.label}
              className="justify-start"
              pressed={selected.includes(tag.id)}
              onPressedChange={(pressed) =>
                onChange({
                  value: "",
                  tagIds: pressed
                    ? [...selected, tag.id]
                    : selected.filter((id) => id !== tag.id),
                })
              }
            >
              <TagBadge label={tag.label} color={tag.color} />
            </Toggle>
          ))}
          {selected
            .filter((id) => !tags.some((tag) => tag.id === id))
            .map((id) => (
              <Button
                key={id}
                variant="ghost"
                onClick={() =>
                  onChange({
                    value: "",
                    tagIds: selected.filter((value) => value !== id),
                  })
                }
              >
                {t("removeUnavailableTag")}
              </Button>
            ))}
          {!tags.length && (
            <p className="text-sm text-muted-foreground">
              {t("noAvailableTags")}
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export function DateFilterOperand({
  term,
  label,
  onChange,
}: {
  term: DraftTerm
  label: string
  onChange: (patch: Partial<DraftTerm>) => void
}) {
  const t = useTranslations()
  const relative = term.dateMode === "relative"
  const negative = term.value.startsWith("-")
  return (
    <>
      <Choice
        label={`${label}: ${t("dateOperand")}`}
        value={relative ? "relative" : "specific"}
        onChange={(mode) =>
          onChange({
            dateMode: mode as "specific" | "relative",
            value: mode === "relative" ? "0" : "",
          })
        }
        options={[
          { value: "specific", label: t("specificDate") },
          { value: "relative", label: t("relativeDate") },
        ]}
      />
      {relative ? (
        <>
          <Choice
            label={`${label}: ${t("offsetDirection")}`}
            value={negative ? "minus" : "plus"}
            onChange={(sign) =>
              onChange({
                value:
                  (sign === "minus" ? "-" : "") +
                  term.value.replace(/^[+-]/, ""),
              })
            }
            options={[
              { value: "plus", label: t("plusDays") },
              { value: "minus", label: t("minusDays") },
            ]}
          />
          <Input
            aria-label={`${label}: ${t("numberOfDays")}`}
            className="w-24"
            inputMode="numeric"
            value={term.value.replace(/^[+-]/, "")}
            maxLength={5}
            onChange={(event) => {
              if (/^\d{0,5}$/.test(event.target.value))
                onChange({ value: (negative ? "-" : "") + event.target.value })
            }}
          />
          <span className="text-sm text-muted-foreground">{t("days")}</span>
        </>
      ) : (
        <Input
          aria-label={label}
          className="w-48"
          type="date"
          value={term.value}
          onChange={(event) => onChange({ value: event.target.value })}
        />
      )}
    </>
  )
}
