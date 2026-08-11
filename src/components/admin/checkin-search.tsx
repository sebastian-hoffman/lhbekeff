"use client";

import { useState, useTransition } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { categoryLabel } from "@/lib/ticket-number";
import { checkInTicket, searchTickets, type TicketSearchResult } from "@/server/actions/checkin.actions";

export function CheckinSearch() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query.trim(), 250);
  const queryClient = useQueryClient();
  const [pendingId, startTransition] = useTransition();

  const { data, isFetching } = useQuery({
    queryKey: ["checkin-search", debouncedQuery],
    queryFn: () => searchTickets({ query: debouncedQuery }),
    enabled: debouncedQuery.length > 0,
  });

  function handleCheckIn(ticket: TicketSearchResult) {
    startTransition(async () => {
      const result = await checkInTicket({ ticketId: ticket.id });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(
        result.alreadyCheckedIn
          ? `${ticket.attendeeName} ya había ingresado.`
          : `Ingreso registrado: ${ticket.attendeeName}.`,
      );
      queryClient.invalidateQueries({ queryKey: ["checkin-search", debouncedQuery] });
    });
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-md">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          autoFocus
          placeholder="Buscar por nombre, número o código…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-12 pl-9 text-base"
        />
      </div>

      {debouncedQuery.length === 0 ? (
        <p className="text-sm text-muted-foreground">Empezá a escribir para buscar una entrada.</p>
      ) : isFetching ? (
        <p className="text-sm text-muted-foreground">Buscando…</p>
      ) : data && data.length > 0 ? (
        <div className="divide-y divide-border rounded-xl border border-border">
          {data.map((ticket) => (
            <div key={ticket.id} className="flex items-center justify-between gap-4 p-4">
              <div className="min-w-0">
                <p className="truncate font-medium">{ticket.attendeeName}</p>
                <p className="text-sm text-muted-foreground">
                  {categoryLabel(ticket.category)} · {ticket.number} · {ticket.purchaseCode}
                </p>
              </div>
              {ticket.checkedIn ? (
                <span className="flex shrink-0 items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="size-4" />
                  Ingresó
                </span>
              ) : (
                <Button className="shrink-0" onClick={() => handleCheckIn(ticket)} disabled={pendingId}>
                  Registrar ingreso
                </Button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No se encontraron entradas confirmadas.</p>
      )}
    </div>
  );
}
