import { listing } from "@/lib/catalog"
import { querySchema } from "@/lib/domain"
export async function POST(request: Request) {
  try {
    const text = await request.text()
    if (text.length > 100000)
      return Response.json({ error: "Request too large" }, { status: 413 })
    const result = querySchema.safeParse(JSON.parse(text))
    if (!result.success)
      return Response.json(
        {
          error: result.error.issues.some(
            (i) => i.message === "amountCurrencyRequired"
          )
            ? "amountCurrencyRequired"
            : "validationError",
        },
        { status: 400 }
      )
    return Response.json(listing(result.data), {
      headers: { "Cache-Control": "no-store" },
    })
  } catch {
    return Response.json({ error: "validationError" }, { status: 400 })
  }
}
