import { Features } from "@/components/landing/features";
import { Footer } from "@/components/landing/footer";
import { Hero } from "@/components/landing/hero";
import { PricingPreview } from "@/components/landing/pricing-preview";
import { getActiveEvent } from "@/server/services/event.service";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const event = await getActiveEvent();

  if (!event) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-24 text-center">
        <p className="text-muted-foreground">
          No hay ningún evento activo en este momento. Volvé a intentarlo más tarde.
        </p>
      </main>
    );
  }

  return (
    <>
      <main className="flex-1">
        <Hero event={event} />
        <Features />
        <PricingPreview event={event} />
      </main>
      <Footer />
    </>
  );
}
