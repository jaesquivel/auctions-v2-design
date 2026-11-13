import { detail } from "@/lib/catalog"
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const data = detail(id)
  return data
    ? Response.json(data, { headers: { "Cache-Control": "no-store" } })
    : Response.json({ error: "itemNotFound" }, { status: 404 })
}
