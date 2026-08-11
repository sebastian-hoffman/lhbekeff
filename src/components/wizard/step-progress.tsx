"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const STEPS = [
  { path: "/reservar", label: "Tus datos" },
  { path: "/reservar/entradas", label: "Entradas" },
  { path: "/reservar/asistentes", label: "Asistentes" },
  { path: "/reservar/aporte", label: "Aporte" },
  { path: "/reservar/resumen", label: "Resumen" },
];

export function StepProgress() {
  const pathname = usePathname();
  const currentIndex = STEPS.findIndex((step) => step.path === pathname);

  if (currentIndex === -1) return null;

  return (
    <div className="border-b border-border bg-secondary/30">
      <div className="mx-auto flex max-w-lg items-center gap-1.5 px-6 pt-4">
        {STEPS.map((step, index) => (
          <div
            key={step.path}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors",
              index <= currentIndex ? "bg-primary" : "bg-border",
            )}
          />
        ))}
      </div>
      <p className="mx-auto max-w-lg px-6 py-3 text-xs font-medium text-muted-foreground">
        Paso {currentIndex + 1} de {STEPS.length} · {STEPS[currentIndex].label}
      </p>
    </div>
  );
}
