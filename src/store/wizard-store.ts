"use client";

import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";
import { TicketCategory } from "@/generated/prisma/enums";
import type { BuyerInput, TicketQuantitiesInput } from "@/lib/validations/purchase.schema";
import type { WizardAttendee } from "@/types";

const CATEGORY_ORDER: { key: keyof TicketQuantitiesInput; category: TicketCategory }[] = [
  { key: "adultQty", category: TicketCategory.ADULT },
  { key: "minorQty", category: TicketCategory.MINOR },
  { key: "freeQty", category: TicketCategory.FREE },
];

function localId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

/** Reconstruye la lista de asistentes para que coincida con las cantidades
 * elegidas, conservando los nombres ya cargados cuando el usuario vuelve
 * atrás y cambia una cantidad. */
function resizeAttendees(
  quantities: TicketQuantitiesInput,
  previous: WizardAttendee[],
): WizardAttendee[] {
  const next: WizardAttendee[] = [];
  for (const { key, category } of CATEGORY_ORDER) {
    const count = quantities[key];
    const existing = previous.filter((a) => a.category === category);
    for (let i = 0; i < count; i++) {
      next.push(existing[i] ?? { localId: localId(), category, name: "" });
    }
  }
  return next;
}

const EMPTY_QUANTITIES: TicketQuantitiesInput = { adultQty: 0, minorQty: 0, freeQty: 0 };

type WizardStore = {
  eventId: string | null;
  buyer: BuyerInput | null;
  quantities: TicketQuantitiesInput;
  attendees: WizardAttendee[];
  voluntaryContributionCents: number;
  /** Código público de la compra, asignado una vez creada en el paso "resumen". */
  purchaseCode: string | null;

  setEventId: (eventId: string) => void;
  setBuyer: (buyer: BuyerInput) => void;
  setQuantities: (quantities: TicketQuantitiesInput) => void;
  setAttendeeName: (localId: string, name: string) => void;
  setVoluntaryContribution: (cents: number) => void;
  setPurchaseCode: (code: string) => void;
  reset: () => void;
};

export const useWizardStore = create<WizardStore>()(
  persist(
    (set) => ({
      eventId: null,
      buyer: null,
      quantities: EMPTY_QUANTITIES,
      attendees: [],
      voluntaryContributionCents: 0,
      purchaseCode: null,

      setEventId: (eventId) => set({ eventId }),
      setBuyer: (buyer) => set({ buyer }),
      setQuantities: (quantities) =>
        set((state) => ({
          quantities,
          attendees: resizeAttendees(quantities, state.attendees),
        })),
      setAttendeeName: (id, name) =>
        set((state) => ({
          attendees: state.attendees.map((a) => (a.localId === id ? { ...a, name } : a)),
        })),
      setVoluntaryContribution: (cents) => set({ voluntaryContributionCents: cents }),
      setPurchaseCode: (code) => set({ purchaseCode: code }),
      reset: () =>
        set({
          eventId: null,
          buyer: null,
          quantities: EMPTY_QUANTITIES,
          attendees: [],
          voluntaryContributionCents: 0,
          purchaseCode: null,
        }),
    }),
    {
      name: "bekeff-wizard",
      storage: createJSONStorage<WizardStore>(() => {
        const noopStorage: StateStorage = {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
        return typeof window !== "undefined" ? sessionStorage : noopStorage;
      }),
    },
  ),
);
