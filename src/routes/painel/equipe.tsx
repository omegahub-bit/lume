import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  approveStaff,
  declineStaffRequest,
  getStaffSession,
  listTeam,
  setStaffRole,
} from "@/lib/api/staff";
import { ROLE_LABEL, type StaffRole } from "@/lib/types";

export const Route = createFileRoute("/painel/equipe")({ component: PainelEquipe });

function PainelEquipe() {
  const qc = useQueryClient();
  const session = useQuery({ queryKey: ["staff-session"], queryFn: () => getStaffSession() });
  const isAdmin = session.data?.staff?.role === "admin";
  const team = useQuery({
    queryKey: ["staff-team"],
    queryFn: () => listTeam(),
    enabled: isAdmin,
  });
  const me = session.data?.staff?.userId;

  const refresh = () => {
    void qc.invalidateQueries({ queryKey: ["staff-team"] });
    void qc.invalidateQueries({ queryKey: ["staff-dash"] });
  };

  const approve = useMutation({
    mutationFn: (input: { userId: string; role: StaffRole }) => approveStaff({ data: input }),
    onSuccess: () => {
      toast.success("Acesso liberado.");
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const decline = useMutation({
    mutationFn: (userId: string) => declineStaffRequest({ data: { userId } }),
    onSuccess: () => {
      toast.success("Pedido recusado.");
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const changeRole = useMutation({
    mutationFn: (input: { userId: string; role: StaffRole }) => setStaffRole({ data: input }),
    onSuccess: () => {
      toast.success("Cargo atualizado.");
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (session.data?.staff && !isAdmin) {
    return (
      <main className="px-5 py-8 md:px-10">
        <h1 className="font-display text-4xl text-fg">Equipe</h1>
        <p className="mt-3 text-sm text-muted">Só o admin libera acessos e muda cargos.</p>
      </main>
    );
  }

  return (
    <main className="px-5 py-8 md:px-10">
      <p className="kicker">Acessos</p>
      <h1 className="mt-2 font-display text-4xl text-fg">Equipe</h1>
      <p className="mt-2 max-w-lg text-sm text-muted">
        Admin, supervisor e colaborador. Quem entra sem cargo espera aqui.
      </p>

      <section className="mt-10">
        <h2 className="font-display text-2xl text-fg">Pedidos</h2>
        <ul className="mt-4 divide-y divide-border border-y border-border">
          {(team.data?.requests ?? []).length === 0 ? (
            <li className="py-6 text-sm text-muted">Nenhum pedido no momento.</li>
          ) : (
            team.data?.requests.map((req) => (
              <li key={req.userId} className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div>
                  <p className="text-fg">{req.displayName || "Sem nome"}</p>
                  <p className="text-sm text-muted">{req.email}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(["collaborator", "supervisor", "admin"] as StaffRole[]).map((role) => (
                    <Button
                      key={role}
                      size="sm"
                      variant={role === "collaborator" ? "primary" : "secondary"}
                      onClick={() => approve.mutate({ userId: req.userId, role })}
                    >
                      {ROLE_LABEL[role]}
                    </Button>
                  ))}
                  <Button size="sm" variant="ghost" onClick={() => decline.mutate(req.userId)}>
                    Recusar
                  </Button>
                </div>
              </li>
            ))
          )}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl text-fg">Quem entra</h2>
        <ul className="mt-4 divide-y divide-border border-y border-border">
          {(team.data?.members ?? []).map((m) => (
            <li key={m.userId} className="flex flex-wrap items-center justify-between gap-3 py-4">
              <div>
                <p className="text-fg">{m.displayName || m.email}</p>
                <p className="text-sm text-muted">{m.email}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge tone={m.role === "admin" ? "accent" : "muted"}>{ROLE_LABEL[m.role]}</Badge>
                {m.userId !== me ? (
                  <select
                    className="h-10 rounded-md border border-border bg-elevated px-2 text-sm text-fg"
                    value={m.role}
                    onChange={(e) =>
                      changeRole.mutate({
                        userId: m.userId,
                        role: e.target.value as StaffRole,
                      })
                    }
                  >
                    {(["admin", "supervisor", "collaborator"] as StaffRole[]).map((role) => (
                      <option key={role} value={role}>
                        {ROLE_LABEL[role]}
                      </option>
                    ))}
                  </select>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
