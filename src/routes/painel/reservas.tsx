import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { listReservations, setReservationStatus, getStaffSession } from "@/lib/api/staff";
import { formatEventDate } from "@/lib/format";
import { STATUS_LABEL, type ReservationStatus } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/painel/reservas")({ component: PainelReservas });

const TONE: Record<ReservationStatus, "pending" | "success" | "danger" | "muted"> = {
  pending: "pending",
  confirmed: "success",
  declined: "danger",
  cancelled: "muted",
};

function PainelReservas() {
  const qc = useQueryClient();
  const session = useQuery({ queryKey: ["staff-session"], queryFn: () => getStaffSession() });
  const list = useQuery({ queryKey: ["staff-reservations"], queryFn: () => listReservations() });
  const canManage = Boolean(session.data?.staff);

  const mutate = useMutation({
    mutationFn: (input: { id: number; status: ReservationStatus }) =>
      setReservationStatus({ data: input }),
    onSuccess: () => {
      toast.success("Reserva atualizada.");
      void qc.invalidateQueries({ queryKey: ["staff-reservations"] });
      void qc.invalidateQueries({ queryKey: ["staff-dash"] });
      void qc.invalidateQueries({ queryKey: ["occupancy"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = list.data ?? [];

  return (
    <main className="px-5 py-8 md:px-10">
      <p className="kicker">Controle</p>
      <h1 className="mt-2 font-display text-4xl text-fg">Reservas</h1>
      <p className="mt-2 max-w-lg text-sm text-muted">
        Pedidos de mesa e de salão. A equipe confirma, recusa ou cancela.
      </p>

      <div className="mt-8 overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-surface text-xs uppercase tracking-[0.14em] text-subtle">
            <tr>
              <th className="px-4 py-3 font-medium">Data</th>
              <th className="px-4 py-3 font-medium">Espaço</th>
              <th className="px-4 py-3 font-medium">Convidado</th>
              <th className="px-4 py-3 font-medium">Pax</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted">
                  Nenhuma reserva ainda.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-t border-border">
                  <td className="px-4 py-3 capitalize text-fg">
                    {formatEventDate(r.reservedFor)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-fg">{r.spaceCode}</span>
                    <span className="text-muted"> · {r.spaceName}</span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-fg">{r.guestName}</p>
                    <p className="text-xs text-muted">
                      {r.guestPhone} · {r.guestEmail}
                    </p>
                    {r.notes ? <p className="mt-1 text-xs text-subtle">{r.notes}</p> : null}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-fg">{r.partySize}</td>
                  <td className="px-4 py-3">
                    <Badge tone={TONE[r.status]}>{STATUS_LABEL[r.status]}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    {canManage && (r.status === "pending" || r.status === "confirmed") ? (
                      <div className="flex justify-end gap-2">
                        {r.status === "pending" ? (
                          <Button
                            size="sm"
                            onClick={() => mutate.mutate({ id: r.id, status: "confirmed" })}
                          >
                            Confirmar
                          </Button>
                        ) : null}
                        <Button
                          size="sm"
                          variant="secondary"
                          className={cn(r.status === "confirmed" && "text-danger")}
                          onClick={() =>
                            mutate.mutate({
                              id: r.id,
                              status: r.status === "pending" ? "declined" : "cancelled",
                            })
                          }
                        >
                          {r.status === "pending" ? "Recusar" : "Cancelar"}
                        </Button>
                      </div>
                    ) : null}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
