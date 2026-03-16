import { KeyRound, LayoutDashboard, ShieldCheck } from "lucide-react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { LoginForm } from "@/features/auth/components/login-form";
import { getServerSession } from "@/features/auth/api";
import { getLandingRoute } from "@/features/auth/utils";

const FEATURE_CARDS = [
  {
    description: "Cookies HttpOnly y sesión hidratada.",
    icon: KeyRound,
    label: "Auth",
  },
  {
    description: "Helpers listos para permisos y navegación.",
    icon: ShieldCheck,
    label: "RBAC",
  },
  {
    description: "Dashboard, sidebar, header y placeholders.",
    icon: LayoutDashboard,
    label: "Shell",
  },
] as const;

export default async function LoginPage() {
  const cookieStore = await cookies();
  const session = await getServerSession(cookieStore.toString());

  if (session) {
    redirect(getLandingRoute(session));
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(86,101,255,0.16),transparent_36%),linear-gradient(180deg,transparent,rgba(255,255,255,0.45))]" />
      <div className="relative grid w-full max-w-6xl gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <section className="space-y-6">
          <p className="text-sm font-semibold tracking-[0.24em] text-primary uppercase">FACFAST FRONTEND</p>
          <div className="space-y-4">
            <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
              Base administrativa lista para crecer por módulos.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              Esta fase monta autenticación, sesión, shell privado, navegación, permisos y soporte
              multi-sucursal sin entrar todavía a los CRUD completos.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {FEATURE_CARDS.map((card) => (
              <div key={card.label} className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-card/80 p-4">
                <div className="w-fit rounded-xl border border-primary/15 bg-primary/8 p-2 text-primary">
                  <card.icon className="size-4" />
                </div>
                <div>
                  <p className="text-2xl font-semibold">{card.label}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{card.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-md">
          <LoginForm />
        </section>
      </div>
    </main>
  );
}
