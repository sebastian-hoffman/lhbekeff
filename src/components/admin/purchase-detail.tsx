"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Trash2, XCircle } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { Money } from "@/components/shared/money";
import { StatusBadge } from "@/components/shared/status-badge";
import { categoryLabel } from "@/lib/ticket-number";
import {
  confirmPurchase,
  deletePurchase,
  rejectPurchase,
} from "@/server/actions/admin-purchase.actions";
import type { PurchaseDetail } from "@/server/services/purchase.service";

const dateFormatter = new Intl.DateTimeFormat("es-AR", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function PurchaseDetailView({ purchase }: { purchase: PurchaseDetail }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    setError(null);
    startTransition(async () => {
      const result = await confirmPurchase({ purchaseId: purchase.id });
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  function handleReject() {
    setError(null);
    startTransition(async () => {
      const result = await rejectPurchase({ purchaseId: purchase.id, rejectionReason });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setRejectOpen(false);
      router.refresh();
    });
  }

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      const result = await deletePurchase({ purchaseId: purchase.id });
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.push("/admin/compras");
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight">{purchase.code}</h1>
            <StatusBadge status={purchase.status} />
          </div>
          <p className="text-sm text-muted-foreground">
            {dateFormatter.format(purchase.createdAt)}
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setRejectOpen(true)}
            disabled={isPending || purchase.status === "REJECTED"}
          >
            <XCircle className="size-4" />
            Rechazar
          </Button>
          <Button onClick={handleConfirm} disabled={isPending || purchase.status === "CONFIRMED"}>
            <CheckCircle2 className="size-4" />
            Confirmar pago
          </Button>
        </div>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {purchase.status === "REJECTED" && purchase.rejectionReason ? (
        <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          Motivo de rechazo: {purchase.rejectionReason}
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="Comprador">
          <Row label="Nombre">{purchase.buyerName}</Row>
          <Row label="Email">{purchase.buyerEmail}</Row>
          <Row label="Celular">{purchase.buyerPhone}</Row>
        </Section>

        <Section title="Comprobante">
          <ReceiptPreview purchase={purchase} />
        </Section>
      </div>

      <Section title="Entradas">
        <div className="divide-y divide-border">
          {purchase.tickets.map((ticket) => (
            <div key={ticket.id} className="flex items-center justify-between py-2.5 text-sm">
              <div>
                <p className="font-medium">{ticket.attendeeName}</p>
                <p className="text-xs text-muted-foreground">{categoryLabel(ticket.category)}</p>
              </div>
              <span className="font-mono text-xs text-muted-foreground">
                {ticket.number ?? "Sin asignar"}
              </span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Total">
        <div className="space-y-1.5 text-sm">
          {purchase.adultQty > 0 ? (
            <Row label={`Adultos · ${purchase.adultQty} x`}>
              <Money cents={purchase.adultSubtotalCents} />
            </Row>
          ) : null}
          {purchase.minorQty > 0 ? (
            <Row label={`Menores · ${purchase.minorQty} x`}>
              <Money cents={purchase.minorSubtotalCents} />
            </Row>
          ) : null}
          {purchase.freeQty > 0 ? (
            <Row label={`Niños · ${purchase.freeQty} x`}>
              <Money cents={purchase.freeSubtotalCents} />
            </Row>
          ) : null}
          {purchase.voluntaryContributionCents > 0 ? (
            <Row label="Aporte voluntario">
              <Money cents={purchase.voluntaryContributionCents} />
            </Row>
          ) : null}
          <div className="flex items-center justify-between border-t border-border pt-2 font-semibold">
            <span>Total</span>
            <Money cents={purchase.totalCents} />
          </div>
        </div>
      </Section>

      <div className="flex items-center justify-between gap-4 rounded-2xl border border-destructive/30 bg-destructive/5 p-5">
        <div>
          <h2 className="text-sm font-medium text-destructive">Eliminar compra</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Borra la compra y sus entradas de forma permanente. No se puede deshacer.
          </p>
        </div>
        <Button
          variant="destructive"
          className="shrink-0"
          onClick={() => setDeleteOpen(true)}
          disabled={isPending}
        >
          <Trash2 className="size-4" />
          Eliminar
        </Button>
      </div>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rechazar compra</DialogTitle>
            <DialogDescription>
              Opcionalmente, indicá el motivo. El comprador no será notificado automáticamente.
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
            <Button variant="destructive" onClick={handleReject} disabled={isPending}>
              {isPending ? "Rechazando…" : "Rechazar compra"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar esta compra?</DialogTitle>
            <DialogDescription>
              Se va a borrar la compra {purchase.code} de {purchase.buyerName} y sus{" "}
              {purchase.tickets.length} entradas de forma permanente. Esta acción no se puede
              deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
              {isPending ? "Eliminando…" : "Eliminar compra"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ReceiptPreview({ purchase }: { purchase: PurchaseDetail }) {
  if (!purchase.receiptUrl) {
    return <p className="text-sm text-muted-foreground">Todavía no se subió un comprobante.</p>;
  }

  const src = `/api/uploads/${purchase.receiptUrl}`;
  const isImage = purchase.receiptMimeType?.startsWith("image/");

  if (isImage) {
    return (
      <a href={src} target="_blank" rel="noopener noreferrer" className="block">
        {/* eslint-disable-next-line @next/next/no-img-element -- servido dinámicamente desde un route handler protegido */}
        <img
          src={src}
          alt="Comprobante de pago"
          className="max-h-64 w-full rounded-lg border border-border object-contain"
        />
      </a>
    );
  }

  return (
    <a href={src} target="_blank" rel="noopener noreferrer" className="text-sm text-primary underline underline-offset-4">
      Ver comprobante (PDF)
    </a>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h2 className="mb-3 text-sm font-medium text-muted-foreground">{title}</h2>
      {children}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1">
      <span className="text-muted-foreground">{label}</span>
      <span className="truncate font-medium">{children}</span>
    </div>
  );
}
