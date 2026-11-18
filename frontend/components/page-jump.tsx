"use client"
import { useId, useRef, useState } from "react"
import { useTranslations } from "next-intl"
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
  const lastSubmitted = useRef(page)
  const target = Number(value)
  const valid =
    /^[1-9]\d*$/.test(value) &&
    Number.isSafeInteger(target) &&
    target <= pageCount
  const commit = () => {
    if (disabled) return
    if (!valid) {
      setValue(String(page))
      return
    }
    if (target !== page && target !== lastSubmitted.current) {
      lastSubmitted.current = target
      onGo(target)
    }
  }
  return (
    <form
      className="flex items-center gap-2"
      aria-label={t("goToPage")}
      onSubmit={(event) => {
        event.preventDefault()
        commit()
      }}
    >
      <Label htmlFor={id} className="sr-only sm:not-sr-only">
        {t("pageLabel")}
      </Label>
      <Input
        id={id}
        className="w-14 text-center tabular-nums"
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={6}
        required
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onBlur={(event) => {
          // Explicit navigation buttons take precedence over an uncommitted draft.
          if (
            event.relatedTarget instanceof Element &&
            event.relatedTarget.closest("[data-page-navigation]")
          ) {
            setValue(String(page))
            return
          }
          commit()
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault()
            commit()
          }
        }}
        disabled={disabled}
        aria-label={t("goToPage")}
        aria-invalid={!!value && !valid && !disabled}
      />
      <span className="text-sm whitespace-nowrap">
        {t("ofLabel")} {disabled ? "…" : pageCount}
      </span>
    </form>
  )
}
