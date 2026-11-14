"use client"

import { useTable, type ColumnDef, type RowData } from "@tanstack/react-table"
import { useTranslations } from "next-intl"
import {
  dataTableFeatures,
  type DataTableFeatures,
} from "./data-table-features"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "./table"

export type DataTableColumn<TData extends RowData> = ColumnDef<
  DataTableFeatures,
  TData
>

type DataTableProps<TData extends RowData> = {
  data: TData[]
  columns: DataTableColumn<TData>[]
  getRowId: (row: TData) => string
  columnVisibility?: Record<string, boolean>
  sorting?: { id: string; desc: boolean }[]
  pagination?: { pageIndex: number; pageSize: number }
  rowCount?: number
  columnWidths?: Record<string, number>
  minWidth?: number
}

export function DataTable<TData extends RowData>({
  data,
  columns,
  getRowId,
  columnVisibility = {},
  sorting = [],
  pagination = { pageIndex: 0, pageSize: Math.max(data.length, 1) },
  rowCount = data.length,
  columnWidths,
  minWidth,
}: DataTableProps<TData>) {
  const t = useTranslations()
  const table = useTable({
    features: dataTableFeatures,
    data,
    columns,
    getRowId,
    manualSorting: true,
    manualPagination: true,
    rowCount,
    state: { columnVisibility, sorting, pagination },
  })
  return (
    <div
      className="rounded-lg border"
      data-slot="data-table"
      data-pagination="manual"
    >
      <Table className="data-grid" style={minWidth ? { minWidth } : undefined}>
        {columnWidths && (
          <colgroup>
            {table.getVisibleLeafColumns().map((column) => (
              <col key={column.id} style={{ width: columnWidths[column.id] }} />
            ))}
          </colgroup>
        )}
        <TableHeader>
          {table.getHeaderGroups().map((group) => (
            <TableRow key={group.id}>
              {group.headers.map((header) => (
                <TableHead key={header.id} colSpan={header.colSpan}>
                  {header.isPlaceholder ? null : (
                    <table.FlexRender header={header} />
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    <div
                      className="grid-cell-value"
                      title={
                        typeof cell.getValue() === "string"
                          ? String(cell.getValue())
                          : undefined
                      }
                    >
                      <table.FlexRender cell={cell} />
                    </div>
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={Math.max(1, table.getVisibleLeafColumns().length)}
              >
                {t("empty")}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
