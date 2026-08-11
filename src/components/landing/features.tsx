import { Dices, HeartHandshake, UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/utils";

const FEATURES = [
  {
    icon: Dices,
    title: "Experiencia completa",
    description: "La entrada incluye toda la experiencia del Bingo y todos los cartones.",
    accent: "bg-primary/10 text-primary",
  },
  {
    icon: UtensilsCrossed,
    title: "Buffet a tu disposición",
    description: "Durante el evento vas a poder comprar comidas y bebidas en el buffet.",
    accent: "bg-brand-gold/15 text-brand-gold",
  },
  {
    icon: HeartHandshake,
    title: "Apoyás a Bekeff",
    description: "Tu compra apoya el proyecto Bekeff en Lamroth.",
    accent: "bg-brand-sky/15 text-brand-sky",
  },
];

export function Features() {
  return (
    <section className="border-t border-border bg-secondary/40">
      <div className="mx-auto grid max-w-5xl gap-10 px-6 py-14 sm:grid-cols-3 sm:py-16">
        {FEATURES.map(({ icon: Icon, title, description, accent }) => (
          <div
            key={title}
            className="flex flex-col items-center gap-3 text-center sm:items-start sm:text-left"
          >
            <div className={cn("flex size-11 shrink-0 items-center justify-center rounded-xl", accent)}>
              <Icon className="size-5" />
            </div>
            <h3 className="font-medium">{title}</h3>
            <p className="text-sm text-balance text-muted-foreground">{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
