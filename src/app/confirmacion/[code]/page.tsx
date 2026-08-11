import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";
import { Money } from "@/components/shared/money";
import { WizardResetOnMount } from "@/components/wizard/wizard-reset-on-mount";
import { getPurchaseByCode } from "@/server/services/purchase.service";

export default async function ConfirmacionPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const purchase = await getPurchaseByCode(code);
  if (!purchase) notFound();

  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <WizardResetOnMount />
      <Logo variant="mark" className="size-14" />
      <CheckCircle2 className="mt-6 size-12 text-primary" />
      <h1 className="mt-4 text-2xl font-semibold tracking-tight">¡Gracias por tu compra!</h1>
      <p className="mt-2 max-w-sm text-muted-foreground">
        Tu compra quedó registrada. En breve verificaremos el pago.
      </p>

      <div className="mt-8 w-full max-w-xs space-y-3 rounded-2xl border border-border bg-card p-5 text-left">
        <div>
          <p className="text-xs text-muted-foreground">Código de compra</p>
          <p className="text-lg font-semibold tracking-wide">{purchase.code}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="text-lg font-semibold">
            <Money cents={purchase.totalCents} />
          </p>
        </div>
      </div>

      <Button asChild variant="outline" className="mt-8">
        <Link href="/">Volver al inicio</Link>
      </Button>
    </div>
  );
}
