import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/eventos", label: "Agenda" },
  { to: "/espacos", label: "A casa" },
  { to: "/reservas", label: "Reservas" },
  { to: "/galeria", label: "Galeria" },
] as const;

export function SiteHeader({ overlay = false }: { overlay?: boolean }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, isPending } = useCurrentUserState();
  const [open, setOpen] = useState(false);

  return (
    <header
      className={cn(
        "z-40 w-full",
        overlay
          ? cn("absolute inset-x-0 top-0", open && "bg-bg")
          : "sticky top-0 border-b border-border bg-bg/90 backdrop-blur-sm",
      )}
    >
      <div className="page-gutter flex h-16 items-center justify-between gap-4 md:h-20">
        <Link to="/" className="font-display text-2xl tracking-tight text-fg md:text-3xl">
          LUME
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "text-xs uppercase tracking-[0.18em] transition-colors duration-150",
                pathname.startsWith(item.to) ? "text-fg" : "text-muted hover:text-fg",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-5 md:flex">
          {isPending ? (
            <div className="h-8 w-16 rounded-sm bg-elevated" />
          ) : (
            <Link
              to="/painel"
              className="text-xs uppercase tracking-[0.18em] text-muted hover:text-fg"
            >
              {user ? "Painel" : "Equipe"}
            </Link>
          )}
          <Link
            to="/reservas"
            className="inline-flex h-10 items-center rounded-md bg-accent px-4 text-xs uppercase tracking-[0.16em] text-accent-fg"
          >
            Reservar
          </Link>
        </div>

        <button
          type="button"
          className="grid size-11 place-items-center rounded-md text-fg md:hidden"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-border bg-bg page-gutter py-6 md:hidden">
          <nav className="flex flex-col gap-1">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="flex h-12 items-center text-sm uppercase tracking-[0.16em] text-fg"
              >
                {item.label}
              </Link>
            ))}
            <Link
              to="/painel"
              onClick={() => setOpen(false)}
              className="flex h-12 items-center text-sm uppercase tracking-[0.16em] text-muted"
            >
              {user ? "Painel" : "Equipe"}
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
