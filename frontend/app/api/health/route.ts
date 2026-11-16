export const dynamic = "force-dynamic"

export function GET() {
  return Response.json(
    { status: "ok", application: "auctions", mode: "prototype" },
    { headers: { "Cache-Control": "no-store" } }
  )
}
