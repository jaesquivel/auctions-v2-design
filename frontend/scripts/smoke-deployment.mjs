import assert from "node:assert/strict"

const base = new URL(process.env.PREVIEW_TEST_URL ?? "http://127.0.0.1:3000")
async function get(path) {
  const response = await fetch(new URL(path, base), {
    signal: AbortSignal.timeout(15000),
  })
  assert.equal(response.status, 200, path)
  return response
}
const health = await (await get("/api/health")).json()
assert.equal(health.status, "ok")
for (const locale of ["en", "es"]) {
  const html = await (await get(`/${locale}/properties`)).text()
  assert.ok(html.includes(locale === "en" ? "Properties" : "Propiedades"))
  const assets = [
    ...html.matchAll(/(?:src|href)="([^"]*\/_next\/static\/[^"]+)"/g),
  ].map((match) => match[1].replaceAll("&amp;", "&"))
  assert.ok(assets.length > 0, "Page must reference built static assets")
  // Check both CSS and JavaScript rather than accepting an HTML-only deployment.
  for (const suffix of [".css", ".js"]) {
    const asset = assets.find((value) =>
      new URL(value, base).pathname.endsWith(suffix)
    )
    assert.ok(asset, suffix)
    await get(asset)
  }
}
await get("/brand/gavel-dark.svg")
await get("/fonts/geist-latin.woff2")
for (const category of ["properties", "vehicles", "other"]) {
  const response = await fetch(new URL("/api/items/query", base), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      category,
      page: 1,
      pageSize: 5,
      expression: { operator: "AND", groups: [] },
      currency: null,
      sorts: [{ field: "date", direction: "asc" }],
    }),
    signal: AbortSignal.timeout(15000),
  })
  assert.equal(response.status, 200)
  const page = await response.json()
  assert.equal(page.total, 50)
  assert.equal(page.items.length, 5)
  const item = await (
    await get(`/api/items/${encodeURIComponent(page.items[0].id)}`)
  ).json()
  assert.equal(item.item.category, category)
  assert.ok(item.originalText.length > 0)
}
console.log(
  `Deployment smoke checks passed: health, both locales, CSS/JS, brand/fonts, all categories and original notices (${base.origin}).`
)
