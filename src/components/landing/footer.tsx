import Link from "next/link";
import { Logo } from "@/components/shared/logo";

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-6 py-10 text-sm text-muted-foreground sm:flex-row sm:justify-between">
        <div className="flex items-center gap-2">
          <Logo variant="mark" className="size-8" />
          <span>Bingo Bekeff 2026</span>
        </div>
        <Link href="/admin/login" className="transition-colors hover:text-foreground">
          Panel de administración
        </Link>
      </div>
    </footer>
  );
}
