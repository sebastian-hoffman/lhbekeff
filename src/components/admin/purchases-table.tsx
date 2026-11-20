"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  type ColumnDef,
  type RowSelectionState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  Eye,
  MoreHorizontal,
  Search,
  Trash2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Money } from "@/components/shared/money";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  confirmPurchase,
  confirmPurchases,
  deletePurchase,
  rejectPurchase,
  rejectPurchases,
} from "@/server/actions/admin-purchase.actions";
import type { PurchaseListItem } from "@/server/services/purchase.service";

const dateFormatter = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const STATUS_LABELS: Record<PurchaseListItem["status"], string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmada",
  REJECTED: "Rechazada",
};
const MAX_BULK_PURCHASES = 100;

function csvCell(value: string) {
  const safeValue = /^[\t\r ]*[=+\-@]/.test(value) ? `'${value}` : value;
  return `"${safeValue.replaceAll('"', '""')}"`;
}

function receiptShareHref(token: string) {
  return `/api/shared-receipts/${encodeURIComponent(token)}`;
}

export function PurchasesTable({ data }: { data: PurchaseListItem[] }) {
  const router = useRouter();
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<PurchaseListItem["status"] | "ALL">("ALL");
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [copiedReceiptId, setCopiedReceiptId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<PurchaseListItem | null>(null);
  const [bulkRejectIds, setBulkRejectIds] = useState<string[] | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<PurchaseListItem | null>(null);
  const [isPending, startTransition] = useTransition();
  const selectedPurchaseIds = Object.keys(rowSelection).filter((id) => rowSelection[id]);
  const selectedPurchases = data.filter((purchase) => selectedPurchaseIds.includes(purchase.id));

  function handleConfirmSelected() {
    setActionError(null);
    startTransition(async () => {
      const result = await confirmPurchases({ purchaseIds: selectedPurchaseIds });
      if (!result.success) {
        setActionError(result.error);
        return;
      }
      setRowSelection({});
      router.refresh();
    });
  }

  function handleRejectSelected() {
    setActionError(null);
    setRejectTarget(null);
    setRejectionReason("");
    setBulkRejectIds(selectedPurchaseIds);
  }

  function handleConfirm(purchase: PurchaseListItem) {
    setActionError(null);
    startTransition(async () => {
      const result = await confirmPurchase({ purchaseId: purchase.id });
      if (!result.success) {
        setActionError(result.error);
        return;
      }
      setRowSelection({});
      router.refresh();
    });
  }

  function handleRejectSubmit() {
    if (!rejectTarget && !bulkRejectIds) return;
    setActionError(null);
    startTransition(async () => {
      const result = bulkRejectIds
        ? await rejectPurchases({ purchaseIds: bulkRejectIds, rejectionReason })
        : await rejectPurchase({ purchaseId: rejectTarget!.id, rejectionReason });
      if (!result.success) {
        setActionError(result.error);
        return;
      }
      setRejectTarget(null);
      setBulkRejectIds(null);
      setRowSelection({});
      setRejectionReason("");
      router.refresh();
    });
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setActionError(null);
    startTransition(async () => {
      const result = await deletePurchase({ purchaseId: deleteTarget.id });
      if (!result.success) {
        setActionError(result.error);
        return;
      }
      setDeleteTarget(null);
      router.refresh();
    });
  }

  async function copyReceiptLink(purchase: PurchaseListItem) {
    if (!purchase.receiptShareToken) return;
    try {
      const url = new URL(receiptShareHref(purchase.receiptShareToken), window.location.origin).toString();
      await navigator.clipboard.writeText(url);
      setCopiedReceiptId(purchase.id);
      setActionError(null);
    } catch {
      setActionError("No se pudo copiar el enlace. Abrí el comprobante y copiá la dirección del navegador.");
    }
  }

  const columns: ColumnDef<PurchaseListItem>[] = [
    {
      id: "select",
      enableSorting: false,
      enableGlobalFilter: false,
      header: ({ table }) => (
        <input
          type="checkbox"
          className="size-4 accent-primary"
          aria-label="Seleccionar compras de esta página, hasta 100 en total"
          checked={table.getIsAllPageRowsSelected()}
          disabled={!table.getIsAllPageRowsSelected() && selectedPurchaseIds.length + table.getRowModel().rows.filter((row) => !row.getIsSelected()).length > MAX_BULK_PURCHASES}
          onChange={(event) => table.toggleAllPageRowsSelected(event.currentTarget.checked)}
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          className="size-4 accent-primary"
          aria-label={`Seleccionar compra ${row.original.code}`}
          checked={row.getIsSelected()}
          disabled={!row.getIsSelected() && selectedPurchaseIds.length >= MAX_BULK_PURCHASES}
          onChange={row.getToggleSelectedHandler()}
        />
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Fecha",
      cell: ({ getValue }) => dateFormatter.format(getValue<Date>()),
    },
    {
      accessorKey: "buyerName",
      header: "Comprador",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.buyerName}</p>
          <p className="text-xs text-muted-foreground">{row.original.code}</p>
        </div>
      ),
    },
    { accessorKey: "buyerEmail", header: "Email" },
    { accessorKey: "buyerPhone", header: "Teléfono" },
    {
      accessorKey: "buyerGroups",
      header: "Grupos",
      cell: ({ row }) => row.original.buyerGroups.length > 0
        ? <span className="block max-w-48 text-xs leading-relaxed">{row.original.buyerGroups.join(", ")}</span>
        : <span className="text-muted-foreground">N/A</span>,
    },
    {
      id: "receipt",
      header: "Comprobante",
      cell: ({ row }) => {
        const purchase = row.original;
        if (!purchase.receiptShareToken) {
          return <span className="text-muted-foreground">No recibido</span>;
        }
        const format = purchase.receiptMimeType?.split("/").at(-1)?.toUpperCase() ?? "Archivo";
        return (
          <div className="min-w-36 space-y-1">
            <p className="text-xs text-muted-foreground">Recibido · {format}</p>
            <div className="flex items-center gap-2 text-xs">
              <a
                href={receiptShareHref(purchase.receiptShareToken)}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary underline underline-offset-4"
              >
                Abrir
              </a>
              <button
                type="button"
                onClick={() => void copyReceiptLink(purchase)}
                className="inline-flex items-center gap-1 font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground"
                aria-label={`Copiar link del comprobante ${purchase.code}; vence en 7 días`}
              >
                <Copy className="size-3" aria-hidden="true" />
                {copiedReceiptId === purchase.id ? "Copiado" : "Copiar link"}
              </button>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "totalCents",
      header: "Total",
      cell: ({ getValue }) => <Money cents={getValue<number>()} />,
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ getValue }) => <StatusBadge status={getValue<PurchaseListItem["status"]>()} />,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const purchase = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon-sm" disabled={isPending}>
                <MoreHorizontal className="size-4" />
                <span className="sr-only">Acciones</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/admin/compras/${purchase.id}`}>
                  <Eye />
                  Ver detalle
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                disabled={purchase.status === "CONFIRMED"}
                onSelect={() => handleConfirm(purchase)}
              >
                <CheckCircle2 />
                Confirmar pago
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={purchase.status === "REJECTED"}
                onSelect={() => setRejectTarget(purchase)}
              >
                <XCircle />
                Rechazar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onSelect={() => setDeleteTarget(purchase)}>
                <Trash2 />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const filteredData = statusFilter === "ALL"
    ? data
    : data.filter((purchase) => purchase.status === statusFilter);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { globalFilter, rowSelection },
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    getRowId: (purchase) => purchase.id,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 15 } },
  });

  function downloadCsv() {
    const purchases = table.getFilteredRowModel().rows.map((row) => row.original);
    const csvRows = [
      ["Fecha", "Código", "Comprador", "Email", "Teléfono", "Grupos", "Estado", "Comprobante", "Formato", "Link compartible (7 días)", "Total (ARS)"],
      ...purchases.map((purchase) => [
        dateFormatter.format(purchase.createdAt),
        purchase.code,
        purchase.buyerName,
        purchase.buyerEmail,
        purchase.buyerPhone,
        purchase.buyerGroups.length > 0 ? purchase.buyerGroups.join(", ") : "N/A",
        STATUS_LABELS[purchase.status],
        purchase.receiptShareToken ? "Recibido" : "No recibido",
        purchase.receiptMimeType ?? "",
        purchase.receiptShareToken
          ? new URL(receiptShareHref(purchase.receiptShareToken), window.location.origin).toString()
          : "",
        (purchase.totalCents / 100).toFixed(2),
      ]),
    ];
    const content = `\uFEFF${csvRows.map((row) => row.map(csvCell).join(";")).join("\r\n")}`;
    const url = URL.createObjectURL(new Blob([content], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `compras-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, email o código…"
              value={globalFilter}
              onChange={(e) => {
                setGlobalFilter(e.target.value);
                setRowSelection({});
              }}
              className="pl-9"
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <span className="sr-only">Filtrar por estado</span>
            <select
              aria-label="Filtrar compras por estado"
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm sm:w-auto"
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.currentTarget.value as PurchaseListItem["status"] | "ALL");
                setRowSelection({});
                table.setPageIndex(0);
              }}
            >
              <option value="ALL">Todos los estados</option>
              <option value="PENDING">Pendientes</option>
              <option value="CONFIRMED">Confirmadas</option>
              <option value="REJECTED">Rechazadas</option>
            </select>
          </label>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {selectedPurchases.length > 0 ? (
            <>
              <span className="text-sm text-muted-foreground" aria-live="polite">
                {selectedPurchases.length} / {MAX_BULK_PURCHASES} seleccionadas
              </span>
              <Button
                type="button"
                variant="outline"
                onClick={handleConfirmSelected}
                disabled={isPending || selectedPurchases.every((purchase) => purchase.status === "CONFIRMED")}
              >
                <CheckCircle2 className="size-4" />
                Confirmar pago
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleRejectSelected}
                disabled={isPending || selectedPurchases.every((purchase) => purchase.status === "REJECTED")}
              >
                <XCircle className="size-4" />
                Rechazar
              </Button>
            </>
          ) : null}
          <Button type="button" variant="outline" onClick={downloadCsv} disabled={table.getFilteredRowModel().rows.length === 0}>
            <Download className="size-4" />
            Descargar CSV
          </Button>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Los links compartibles de comprobantes vencen a los 7 días y dan acceso únicamente a ese archivo.
      </p>

      {actionError ? <p className="text-sm text-destructive">{actionError}</p> : null}

      <div className="rounded-xl border border-border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
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
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  No se encontraron compras.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} compras
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            {table.getState().pagination.pageIndex + 1} / {Math.max(1, table.getPageCount())}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            disabled={!table.getCanNextPage()}
            onClick={() => table.nextPage()}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <Dialog
        open={!!rejectTarget || bulkRejectIds !== null}
        onOpenChange={(open) => {
          if (!open) {
            setRejectTarget(null);
            setBulkRejectIds(null);
            setRejectionReason("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{bulkRejectIds ? "Rechazar compras" : "Rechazar compra"}</DialogTitle>
            <DialogDescription>
              {bulkRejectIds ? (
                <>{bulkRejectIds.length} compras seleccionadas. Podés indicar un motivo común (opcional).</>
              ) : rejectTarget ? (
                <>
                  {rejectTarget.code} · {rejectTarget.buyerName}. Opcionalmente, indicá el motivo.
                </>
              ) : null}
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Motivo (opcional)"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleRejectSubmit} disabled={isPending}>
              {isPending ? "Rechazando…" : bulkRejectIds ? "Rechazar compras" : "Rechazar compra"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar esta compra?</DialogTitle>
            <DialogDescription>
              {deleteTarget ? (
                <>
                  Se va a borrar la compra {deleteTarget.code} de {deleteTarget.buyerName} y sus
                  entradas de forma permanente. Esta acción no se puede deshacer.
                </>
              ) : null}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={isPending}>
              {isPending ? "Eliminando…" : "Eliminar compra"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
