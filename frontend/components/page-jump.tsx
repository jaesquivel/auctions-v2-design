"use client"
import { useId, useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function PageJump({
  page,
  pageCount,
  disabled,
  onGo,
}: {
  page: number
  pageCount: number
  disabled: boolean
  onGo: (page: number) => void
}) {
  const t = useTranslations()
  const id = useId()
  const [value, setValue] = useState(String(page))
  const target = Number(value)
  const valid =
    /^[1-9]\d*$/.test(value) &&
    Number.isSafeInteger(target) &&
    target <= pageCount
  return (
    <form
      className="flex items-center gap-2"
      aria-label={t("goToPage")}
      onSubmit={(event) => {
        event.preventDefault()
        if (!disabled && valid && target !== page) onGo(target)
      }}
    >
      <Label htmlFor={id} className="sr-only sm:not-sr-only">
        {t("pageLabel")}
      </Label>
      <Input
        id={id}
        className="w-16 sm:w-20"
        type="number"
        inputMode="numeric"
        min={1}
        max={Math.max(pageCount, 1)}
        step={1}
        required
        value={value}
        onChange={(event) => setValue(event.target.value)}
        disabled={disabled}
        aria-label={t("goToPage")}
        aria-invalid={!!value && !valid && !disabled}
      />
      <span className="text-sm whitespace-nowrap">
        {t("ofLabel")} {disabled ? "…" : pageCount}
      </span>
      <Button
        type="submit"
        variant="outline"
        disabled={disabled || !valid || target === page}
      >
        {t("goToPageButton")}
      </Button>
    </form>
  )
}
