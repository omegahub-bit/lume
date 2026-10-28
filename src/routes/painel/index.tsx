import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { getStaffDashboard, getStaffSession } from "@/lib/api/staff";
import { formatEventDate } from "@/lib/format";

export const Route = createFileRoute("/painel/")({ component: PainelHome });

function PainelHome() {
  const dash = useQuery({ queryKey: ["staff-dash"], queryFn: () => getStaffDashboard() });
  const session = useQuery({ queryKey: ["staff-session"], queryFn: () => getStaffSession() });
  const role = session.data?.staff?.role;
  const d = dash.data;

  return (
    <main className="px-5 py-8 md:px-10">
      <p className="kicker">Painel</p>
      <h1 className="mt-2 font-display text-4xl text-fg">
        Boa noite{session.data?.staff?.displayName ? `, ${session.data.staff.displayName.split(" ")[0]}` : ""}.
      </h1>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <Stat label="Pedidos pendentes" value={d?.pendingReservations ?? "—"} to="/painel/reservas" />
        <Stat label="Reservas hoje" value={d?.tonightReservations ?? "—"} to="/painel/reservas" />
        {role === "admin" ? (
          <Stat label="Acessos aguardando" value={d?.staffRequests ?? "—"} to="/painel/equipe" />
        ) : (
          <Stat label="Próximos eventos" value={d?.upcoming.length ?? "—"} to="/painel/eventos" />
        )}
      </div>

      <section className="mt-12">
        <p className="kicker">Agenda</p>
        <h2 className="mt-2 font-display text-3xl text-fg">Próximos eventos</h2>
        <ul className="mt-6 divide-y divide-border border-y border-border">
          {(d?.upcoming ?? []).length === 0 ? (
            <li className="py-6 text-sm text-muted">Nenhum evento publicado à frente.</li>
          ) : (
            d?.upcoming.map((e) => (
              <li key={e.id} className="flex items-center justify-between gap-4 py-4">
                <div>
                  <p className="text-fg">{e.title}</p>
                  <p className="text-sm text-muted">{formatEventDate(e.eventDate, e.startTime)}</p>
                </div>
                <Link to="/eventos/$slug" params={{ slug: e.slug }} className="text-xs uppercase tracking-[0.14em] text-muted hover:text-fg">
                  Ver
                </Link>
              </li>
            ))
          )}
        </ul>
      </section>
    </main>
  );
}

function Stat({ label, value, to }: { label: string; value: number | string; to: string }) {
  return (
    <Link to={to} className="rounded-xl border border-border bg-surface p-5">
      <p className="kicker">{label}</p>
      <p className="mt-3 font-display text-5xl tabular-nums text-fg">{value}</p>
    </Link>
  );
}
