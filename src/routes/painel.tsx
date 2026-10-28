import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { CalendarDays, Clapperboard, LayoutDashboard, LogOut, Music, Users } from "lucide-react";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { signOut } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { getStaffSession } from "@/lib/api/staff";
import { ROLE_LABEL, type StaffRole } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/painel")({ component: PainelLayout });

const NAV: { to: string; label: string; icon: typeof LayoutDashboard; roles?: StaffRole[] }[] = [
  { to: "/painel", label: "Resumo", icon: LayoutDashboard },
  { to: "/painel/reservas", label: "Reservas", icon: CalendarDays },
  { to: "/painel/eventos", label: "Eventos", icon: Music, roles: ["admin", "supervisor"] },
  { to: "/painel/midia", label: "Mídia", icon: Clapperboard },
  { to: "/painel/equipe", label: "Equipe", roles: ["admin"], icon: Users },
];

function PainelLayout() {
  const { user, isPending } = useCurrentUserState();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const staffQ = useQuery({
    queryKey: ["staff-session"],
    queryFn: () => getStaffSession(),
    enabled: Boolean(user),
  });

  if (isPending) {
    return (
      <div className="grid min-h-dvh place-items-center bg-bg">
        <p className="kicker">LUME</p>
      </div>
    );
  }
  if (!user) return <RedirectToSignIn />;

  if (staffQ.isPending) {
    return (
      <div className="grid min-h-dvh place-items-center bg-bg">
        <p className="text-sm text-muted">Abrindo o painel…</p>
      </div>
    );
  }

  if (staffQ.data?.pending || !staffQ.data?.staff) {
    return (
      <div className="grid min-h-dvh place-items-center bg-bg px-6">
        <div className="max-w-md text-center">
          <p className="font-display text-5xl text-fg">LUME</p>
          <h1 className="mt-6 font-display text-3xl text-fg">Aguardando aprovação</h1>
          <p className="mt-3 text-sm text-muted">
            Seu acesso foi pedido. Um admin da casa precisa liberar o painel.
          </p>
          <Link to="/" className="mt-8 inline-block text-sm text-muted hover:text-fg">
            Voltar à casa
          </Link>
        </div>
      </div>
    );
  }

  const staff = staffQ.data.staff;
  const links = NAV.filter((item) => !item.roles || item.roles.includes(staff.role));

  return (
    <div className="min-h-dvh bg-bg md:grid md:grid-cols-[220px_1fr]">
      <aside className="border-b border-border md:border-b-0 md:border-r">
        <div className="flex items-center justify-between px-5 py-4 md:block">
          <Link to="/" className="font-display text-2xl text-fg">
            LUME
          </Link>
          <p className="hidden text-xs uppercase tracking-[0.16em] text-subtle md:mt-1 md:block">
            Painel · {ROLE_LABEL[staff.role]}
          </p>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:block md:space-y-1 md:px-3 md:pb-6">
          {links.map((item) => {
            const active =
              item.to === "/painel" ? pathname === "/painel" : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex h-11 shrink-0 items-center gap-2 rounded-md px-3 text-sm",
                  active ? "bg-elevated text-fg" : "text-muted hover:text-fg",
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="hidden items-center justify-between gap-2 px-5 py-4 md:flex">
          <div className="min-w-0">
            <p className="truncate text-sm text-fg">{staff.displayName || staff.email}</p>
            <p className="truncate text-xs text-subtle">{staff.email}</p>
          </div>
          <button
            type="button"
            aria-label="Sair"
            className="grid size-10 place-items-center rounded-md text-muted hover:text-fg"
            onClick={() => void signOut("/")}
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </aside>
      <div className="min-w-0">
        <Outlet />
      </div>
    </div>
  );
}
