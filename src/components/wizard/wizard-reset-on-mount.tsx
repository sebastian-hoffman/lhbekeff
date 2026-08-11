"use client";

import { useEffect } from "react";
import { useWizardStore } from "@/store/wizard-store";

/** Limpia el estado del wizard una vez que la compra quedó confirmada, para
 * que una próxima visita empiece de cero. */
export function WizardResetOnMount() {
  const reset = useWizardStore((state) => state.reset);

  useEffect(() => {
    reset();
  }, [reset]);

  return null;
}
