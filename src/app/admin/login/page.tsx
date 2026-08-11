import { Suspense } from "react";
import { LoginForm } from "@/components/admin/login-form";
import { Logo } from "@/components/shared/logo";

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <Logo variant="mark" className="size-12" />
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Panel de administración</h1>
            <p className="text-sm text-muted-foreground">Bingo Bekeff 2026</p>
          </div>
        </div>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
