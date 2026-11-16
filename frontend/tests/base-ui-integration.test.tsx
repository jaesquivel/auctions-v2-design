import { test } from "node:test"
import assert from "node:assert/strict"
import { renderToStaticMarkup } from "react-dom/server"
import { NextIntlClientProvider } from "next-intl"
import Link from "next/link"
import { Button } from "../components/ui/button.tsx"
import { Choice } from "../components/shared.tsx"
import { TagPicker } from "../components/tag-picker.tsx"
import { PreviewProvider } from "../lib/preview-store.tsx"
import messages from "../messages/en.json"
import type { ReactNode } from "react"

function render(children: ReactNode) {
  return renderToStaticMarkup(
    <NextIntlClientProvider
      locale="en"
      messages={messages}
      timeZone="America/Costa_Rica"
    >
      <PreviewProvider>{children}</PreviewProvider>
    </NextIntlClientProvider>
  )
}
test("Base UI link buttons remain a single navigable anchor", () => {
  const html = renderToStaticMarkup(
    <Button render={<Link href="/en/properties" />} nativeButton={false}>
      Properties
    </Button>
  )
  assert.match(html, /<a[^>]+href="\/en\/properties"/)
  assert.ok(!html.includes("<button"))
  assert.match(html, />Properties<\/a>/)
})
test("Base UI Select displays the option label rather than its stored identifier", () => {
  const html = render(
    <Choice
      value="date"
      label="Sort by"
      options={[{ value: "date", label: "Next Auction" }]}
      onChange={() => {}}
    />
  )
  assert.match(html, /Next Auction/)
  assert.match(html, /role="combobox"/)
})
test("Base UI tag trigger preserves colored badges without nested buttons", () => {
  const html = render(<TagPicker id="DEMO-A01" compact />)
  assert.equal((html.match(/<button\b/g) ?? []).length, 1)
  assert.match(html, /Pendiente de estudio/)
  assert.match(html, /Consultar fuente/)
})
