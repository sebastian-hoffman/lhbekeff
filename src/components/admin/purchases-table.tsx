"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  type ColumnDef,
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
  deletePurchase,
  rejectPurchase,
} from "@/server/actions/admin-purchase.actions";
import type { PurchaseListItem } from "@/server/services/purchase.service";

const dateFormatter = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function PurchasesTable({ data }: { data: PurchaseListItem[] }) {
  const router = useRouter();
  const [globalFilter, setGlobalFilter] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<PurchaseListItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<PurchaseListItem | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleConfirm(purchase: PurchaseListItem) {
    setActionError(null);
    startTransition(async () => {
      const result = await confirmPurchase({ purchaseId: purchase.id });
      if (!result.success) {
        setActionError(result.error);
        return;
      }
      router.refresh();
    });
  }

  function handleRejectSubmit() {
    if (!rejectTarget) return;
    setActionError(null);
    startTransition(async () => {
      const result = await rejectPurchase({
        purchaseId: rejectTarget.id,
        rejectionReason,
      });
      if (!result.success) {
        setActionError(result.error);
        return;
      }
      setRejectTarget(null);
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

  const columns: ColumnDef<PurchaseListItem>[] = [
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

  const table = useReactTable({
    data,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 15 } },
  });

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, email o código…"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="pl-9"
        />
      </div>

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
        open={!!rejectTarget}
        onOpenChange={(open) => {
          if (!open) {
            setRejectTarget(null);
            setRejectionReason("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rechazar compra</DialogTitle>
            <DialogDescription>
              {rejectTarget ? (
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
              {isPending ? "Rechazando…" : "Rechazar compra"}
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
