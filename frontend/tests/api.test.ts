import { test } from "node:test"
import assert from "node:assert/strict"
import { defaultQuery } from "../lib/domain.ts"
const base = process.env.PREVIEW_TEST_URL
const request = async (value: unknown) =>
  fetch(`${base}/api/items/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(value),
  })
test(
  "live API returns exactly the requested server page",
  { skip: !base },
  async () => {
    const first = await request({ ...defaultQuery("properties"), pageSize: 5 })
    assert.equal(first.status, 200)
    const a = await first.json()
    const second = await request({
      ...defaultQuery("properties"),
      page: 2,
      pageSize: 5,
    })
    const b = await second.json()
    assert.equal(a.items.length, 5)
    assert.equal(a.total, 50)
    assert.equal(b.items.length, 5)
    assert.equal(
      a.items.some((i: { id: string }) =>
        b.items.some((j: { id: string }) => i.id === j.id)
      ),
      false
    )
  }
)
test(
  "live API rejects mixed-currency amount sorting",
  { skip: !base },
  async () => {
    const result = await request({
      ...defaultQuery("properties"),
      sorts: [{ field: "amount", direction: "asc" }],
    })
    assert.equal(result.status, 400)
    assert.equal((await result.json()).error, "amountCurrencyRequired")
  }
)
test(
  "live detail preserves notice text and excludes non-property location",
  { skip: !base },
  async () => {
    const result = await fetch(`${base}/api/items/DEMO-V01`)
    assert.equal(result.status, 200)
    const { item, originalText } = await result.json()
    assert.equal("locality" in item, false)
    assert.match(originalText, /AVISO SINTÉTICO/)
    assert.ok(item.noticeReference)
    assert.equal((await fetch(`${base}/api/items/NOT-REAL`)).status, 404)
  }
)
test(
  "locale routes and invalid paths are handled by Next",
  { skip: !base },
  async () => {
    assert.equal((await fetch(`${base}/en/properties`)).status, 200)
    assert.equal((await fetch(`${base}/es/not-a-screen`)).status, 404)
  }
)
