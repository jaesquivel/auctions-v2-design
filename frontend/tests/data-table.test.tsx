import { test } from "node:test"
import assert from "node:assert/strict"
import { renderToStaticMarkup } from "react-dom/server"
import { NextIntlClientProvider } from "next-intl"
import {
  DataTable,
  type DataTableColumn,
} from "../components/ui/data-table.tsx"
type Row = { id: string; name: string; amount: string }
const rows: Row[] = Array.from({ length: 25 }, (_, n) => ({
  id: `item-${n}`,
  name: `Record-${n}`,
  amount: String(n),
}))
const columns: DataTableColumn<Row>[] = [
  {
    id: "name",
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => row.original.name,
  },
  {
    id: "amount",
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => row.original.amount,
  },
]
function render(props: Partial<Parameters<typeof DataTable<Row>>[0]> = {}) {
  return renderToStaticMarkup(
    <NextIntlClientProvider
      locale="en"
      messages={{ empty: "No results" }}
      timeZone="America/Costa_Rica"
    >
      <DataTable<Row>
        data={rows}
        columns={columns}
        getRowId={(row) => row.id}
        {...props}
      />
    </NextIntlClientProvider>
  )
}

test("DataTable retains the entire authoritative server page without client repagination", () => {
  const html = render({
    pagination: { pageIndex: 2, pageSize: 5 },
    rowCount: 150,
  })
  assert.equal((html.match(/data-slot="table-row"/g) ?? []).length, 26)
  assert.match(html, /data-slot="data-table"/)
  assert.match(html, /data-pagination="manual"/)
})
test("DataTable applies controlled visibility without dropping records", () => {
  const html = render({ columnVisibility: { amount: false } })
  assert.ok(!html.includes(">Amount<"))
  assert.equal((html.match(/data-slot="table-cell"/g) ?? []).length, 25)
})
test("manual sorting preserves server order rather than reordering the current page", () => {
  const html = render({ sorting: [{ id: "name", desc: true }] })
  assert.ok(html.indexOf(">Record-0<") < html.indexOf(">Record-24<"))
})
