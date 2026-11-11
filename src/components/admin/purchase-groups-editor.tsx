"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { BUYER_GROUPS, type BuyerGroup } from "@/lib/buyer-groups";
import { updatePurchaseGroups } from "@/server/actions/admin-purchase.actions";

export function PurchaseGroupsEditor({
  purchaseId,
  initialGroups,
}: {
  purchaseId: string;
  initialGroups: BuyerGroup[];
}) {
  const router = useRouter();
  const [selectedGroups, setSelectedGroups] = useState<BuyerGroup[]>(initialGroups);
  const [savedGroups, setSavedGroups] = useState<BuyerGroup[]>(initialGroups);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setSelectedGroups(initialGroups);
    setSavedGroups(initialGroups);
  }, [initialGroups]);

  const hasChanges =
    selectedGroups.length !== savedGroups.length ||
    selectedGroups.some((group) => !savedGroups.includes(group));

  function toggleGroup(group: BuyerGroup) {
    setSelectedGroups((current) =>
      group === "N/A"
        ? current.includes(group) ? [] : [group]
        : current.includes(group)
          ? current.filter((selected) => selected !== group)
          : [...current.filter((selected) => selected !== "N/A"), group],
    );
    setMessage(null);
    setError(null);
  }

  function saveGroups() {
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const result = await updatePurchaseGroups({ purchaseId, groups: selectedGroups });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setSavedGroups(selectedGroups);
      setMessage("Grupos guardados.");
      router.refresh();
    });
  }

  return (
    <div className="space-y-4 border-t pt-4">
      <fieldset disabled={isPending} className="space-y-3">
        <legend className="text-sm font-semibold">Grupos del comprador</legend>
        <p className="text-xs text-muted-foreground">
          Seleccioná uno o varios grupos. N/A es excluyente; sin selección también se considera N/A.
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {BUYER_GROUPS.map((group) => (
          <label
            key={group}
            className="flex min-h-10 cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted/50 has-checked:border-primary has-checked:bg-primary/5"
          >
            <input
              type="checkbox"
              checked={selectedGroups.includes(group)}
              onChange={() => toggleGroup(group)}
              className="size-4 shrink-0 accent-primary"
            />
            <span>{group}</span>
          </label>
        ))}
        </div>
      </fieldset>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p aria-live="polite" className={error ? "text-sm text-destructive" : "text-sm text-muted-foreground"}>
          {error ?? message ?? (selectedGroups.length > 0 ? `${selectedGroups.length} seleccionados` : "Sin grupos · N/A")}
        </p>
        <Button type="button" size="sm" onClick={saveGroups} disabled={isPending || !hasChanges}>
          {isPending ? "Guardando…" : "Guardar grupos"}
        </Button>
      </div>
    </div>
  );
}