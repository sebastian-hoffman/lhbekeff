import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { StepProgress } from "@/components/wizard/step-progress";

export default function ReservarLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-lg items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="size-4" />
            Inicio
          </Link>
          <Logo variant="mark" className="size-8" />
        </div>
      </header>
      <StepProgress />
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col px-6 py-8">
        {children}
      </main>
    </div>
  );
}
