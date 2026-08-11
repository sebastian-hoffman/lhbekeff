import Link from "next/link";
import { redirect } from "next/navigation";
import { LayoutDashboard, ListChecks, LogOut, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";
import { getAdminSession } from "@/lib/auth/session";
import { adminLogout } from "@/server/actions/admin-auth.actions";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/compras", label: "Compras", icon: Receipt },
  { href: "/admin/ingreso", label: "Ingreso", icon: ListChecks },
];

export default async function AdminProtectedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3 sm:px-6">
          <Link href="/admin" className="flex shrink-0 items-center gap-2">
            <Logo variant="mark" className="size-8" />
            <span className="hidden text-sm font-medium sm:inline">Bekeff 2026 · Admin</span>
          </Link>

          <nav className="flex items-center gap-1">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
              <Button key={href} asChild variant="ghost" size="sm" className="gap-1.5">
                <Link href={href}>
                  <Icon className="size-4" />
                  <span className="hidden sm:inline">{label}</span>
                </Link>
              </Button>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-3">
            <span className="hidden text-sm text-muted-foreground md:inline">{session.name}</span>
            <form action={adminLogout}>
              <Button variant="outline" size="sm" type="submit" className="gap-1.5">
                <LogOut className="size-4" />
                <span className="hidden sm:inline">Salir</span>
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">{children}</main>
    </div>
  );
}
