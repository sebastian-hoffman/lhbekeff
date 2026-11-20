"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Download, PackageCheck, Search, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/shared/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { updateProductDeliveryStatuses } from "@/server/actions/admin-purchase.actions";
import type { DeliveryOrder } from "@/server/services/purchase.service";

const dateFormatter = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

function csvCell(value: string) {
  const safeValue = /^[\t\r ]*[=+\-@]/.test(value) ? `'${value}` : value;
  return `"${safeValue.replaceAll('"', '""')}"`;
}

export function DeliveryOrdersTable({ data }: { data: DeliveryOrder[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [actionError, setActionError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const normalizedSearch = search.trim().toLocaleLowerCase("es");
  const filteredOrders = data.filter((order) =>
    order.buyerName.toLocaleLowerCase("es").includes(normalizedSearch)
    || order.buyerEmail.toLocaleLowerCase("es").includes(normalizedSearch),
  );
  const selectedOrders = filteredOrders.filter((order) => selectedIds.has(order.id));
  const allFilteredSelected = filteredOrders.length > 0
    && filteredOrders.every((order) => selectedIds.has(order.id));

  function changeDeliveryStatus(purchaseIds: string[], delivered: boolean, clearSelection = false) {
    setActionError(null);
    startTransition(async () => {
      const result = await updateProductDeliveryStatuses({ purchaseIds, delivered });
      if (!result.success) {
        setActionError(result.error);
        return;
      }
      if (clearSelection) setSelectedIds(new Set());
      router.refresh();
    });
  }

  function toggleOrderSelection(orderId: string, selected: boolean) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (selected) next.add(orderId);
      else next.delete(orderId);
      return next;
    });
  }

  function toggleFilteredSelection(selected: boolean) {
    setSelectedIds((current) => {
      const next = new Set(current);
      for (const order of filteredOrders) {
        if (selected) next.add(order.id);
        else next.delete(order.id);
      }
      return next;
    });
  }

  function downloadCsv() {
    const rows = [
      ["Pedido", "Nombre", "Email", "Teléfono", "Fecha", "Estado de pago", "Entrega", "Productos"],
      ...filteredOrders.map((order) => [
        order.code,
        order.buyerName,
        order.buyerEmail,
        order.buyerPhone,
        dateFormatter.format(order.createdAt),
        order.status === "CONFIRMED" ? "Confirmado" : "Pendiente",
        order.deliveryStatus === "DELIVERED" ? "Entregado" : "Pendiente de entrega",
        order.items.map((item) => `${item.quantity} x ${item.name}${item.size ? ` - Talle ${item.size}` : ""}`).join(", "),
      ]),
    ];
    const content = `\uFEFF${rows.map((row) => row.map(csvCell).join(";")).join("\r\n")}`;
    const url = URL.createObjectURL(new Blob([content], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `entregas-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            aria-label="Buscar pedidos por nombre o email"
            placeholder="Buscar por nombre o email"
            value={search}
            onChange={(event) => {
              setSearch(event.currentTarget.value);
              setSelectedIds(new Set());
            }}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {selectedOrders.length > 0 ? (
            <>
              <span className="text-sm text-muted-foreground" aria-live="polite">
                {selectedOrders.length} seleccionados
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isPending || selectedOrders.every((order) => order.deliveryStatus === "DELIVERED")}
                onClick={() => changeDeliveryStatus(selectedOrders.map((order) => order.id), true, true)}
              >
                <PackageCheck className="size-4" />
                Marcar entregados
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isPending || selectedOrders.every((order) => order.deliveryStatus === "PENDING")}
                onClick={() => changeDeliveryStatus(selectedOrders.map((order) => order.id), false, true)}
              >
                <Undo2 className="size-4" />
                Volver a pendientes
              </Button>
            </>
          ) : null}
          <Button type="button" variant="outline" onClick={downloadCsv} disabled={filteredOrders.length === 0}>
            <Download className="size-4" />
            Descargar CSV
          </Button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        {filteredOrders.length} {filteredOrders.length === 1 ? "pedido" : "pedidos"} · Los rechazados no se incluyen.
      </p>
      {actionError ? <p role="alert" className="text-sm text-destructive">{actionError}</p> : null}

      <div className="overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <input
                  type="checkbox"
                  className="size-4 accent-primary"
                  aria-label="Seleccionar todos los pedidos visibles"
                  checked={allFilteredSelected}
                  onChange={(event) => toggleFilteredSelection(event.currentTarget.checked)}
                />
              </TableHead>
              <TableHead>Pedido</TableHead>
              <TableHead>Comprador</TableHead>
              <TableHead>Productos</TableHead>
              <TableHead>Pago</TableHead>
              <TableHead>Entrega</TableHead>
              <TableHead className="text-right">Acción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.length > 0 ? filteredOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>
                  <input
                    type="checkbox"
                    className="size-4 accent-primary"
                    aria-label={`Seleccionar pedido ${order.code}`}
                    checked={selectedIds.has(order.id)}
                    onChange={(event) => toggleOrderSelection(order.id, event.currentTarget.checked)}
                  />
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <Link href={`/admin/compras/${order.id}`} className="font-medium underline underline-offset-4">
                    {order.code}
                  </Link>
                  <p className="text-xs text-muted-foreground">{dateFormatter.format(order.createdAt)}</p>
                </TableCell>
                <TableCell>
                  <p className="font-medium">{order.buyerName}</p>
                  <a className="text-sm text-muted-foreground underline underline-offset-4" href={`mailto:${order.buyerEmail}`}>
                    {order.buyerEmail}
                  </a>
                  <p className="text-xs text-muted-foreground">{order.buyerPhone}</p>
                </TableCell>
                <TableCell className="min-w-52">
                  <ul className="space-y-1">
                    {order.items.map((item) => (
                      <li key={item.id} className="text-sm">
                        <span className="font-medium tabular-nums">{item.quantity} ×</span> {item.name}
                        {item.size ? <span className="text-muted-foreground"> · Talle {item.size}</span> : null}
                      </li>
                    ))}
                  </ul>
                </TableCell>
                <TableCell><StatusBadge status={order.status} /></TableCell>
                <TableCell>
                  <span className={order.deliveryStatus === "DELIVERED" ? "font-medium text-emerald-700 dark:text-emerald-400" : "text-muted-foreground"}>
                    {order.deliveryStatus === "DELIVERED" ? "Entregado" : "Pendiente"}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isPending}
                    onClick={() => changeDeliveryStatus([order.id], order.deliveryStatus !== "DELIVERED")}
                    aria-label={order.deliveryStatus === "DELIVERED" ? `Deshacer entrega del pedido ${order.code}` : `Marcar entregado el pedido ${order.code}`}
                  >
                    {order.deliveryStatus === "DELIVERED" ? <Undo2 className="size-4" /> : <PackageCheck className="size-4" />}
                    {order.deliveryStatus === "DELIVERED" ? "Deshacer" : "Marcar entregado"}
                  </Button>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  No se encontraron pedidos.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}