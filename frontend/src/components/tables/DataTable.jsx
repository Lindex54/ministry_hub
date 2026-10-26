"use client";

import { useState } from "react";
import { flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function DataTable({
  columns,
  data,
  searchPlaceholder = "Search records...",
  searchable = true,
  showPageSize = true,
  enableSelection = true,
  initialPageSize = 5,
  rowSelection: controlledRowSelection,
  onRowSelectionChange: controlledOnRowSelectionChange,
  getRowId,
  globalFilterFn = "auto",
}) {
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter, rowSelection: controlledRowSelection ?? rowSelection },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: controlledOnRowSelectionChange ?? setRowSelection,
    getRowId,
    globalFilterFn,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: enableSelection,
    initialState: { pagination: { pageSize: initialPageSize } },
  });

  return (
    <div className="space-y-4">
      {searchable || showPageSize ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {searchable ? (
            <Input
              value={globalFilter ?? ""}
              onChange={(event) => setGlobalFilter(event.target.value)}
              placeholder={searchPlaceholder}
              className="sm:max-w-sm"
              aria-label="Search table"
            />
          ) : <span />}
          {showPageSize ? (
            <Select value={`${table.getState().pagination.pageSize}`} onValueChange={(value) => table.setPageSize(Number(value))}>
              <SelectTrigger className="w-full sm:w-32" aria-label="Rows per page"><SelectValue /></SelectTrigger>
              <SelectContent>{[5, 10, 20].map((size) => <SelectItem key={size} value={`${size}`}>{size} rows</SelectItem>)}</SelectContent>
            </Select>
          ) : null}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} aria-sort={header.column.getIsSorted() === "asc" ? "ascending" : header.column.getIsSorted() === "desc" ? "descending" : undefined}>
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <Button type="button" variant="ghost" size="sm" className="-ml-3 text-xs font-semibold hover:bg-primary/10 hover:text-primary" onClick={header.column.getToggleSortingHandler()}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() === "asc" ? <ArrowUp className="size-3.5" /> : header.column.getIsSorted() === "desc" ? <ArrowDown className="size-3.5" /> : <ArrowUpDown className="size-3 opacity-40" />}
                      </Button>
                    ) : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} className="even:bg-primary/[0.025]" data-state={row.getIsSelected() && "selected"}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                ))}
              </TableRow>
            )) : (
              <TableRow><TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">No results found.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 px-1 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <span>
          {enableSelection
            ? `${table.getFilteredSelectedRowModel().rows.length} of ${table.getFilteredRowModel().rows.length} row(s) selected.`
            : `${table.getFilteredRowModel().rows.length} record(s)`}
        </span>
        <div className="flex items-center gap-2">
          <span>Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}</span>
          <Button type="button" variant="outline" size="icon-sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} aria-label="Previous page"><ChevronLeft /></Button>
          <Button type="button" variant="outline" size="icon-sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} aria-label="Next page"><ChevronRight /></Button>
        </div>
      </div>
    </div>
  );
}
