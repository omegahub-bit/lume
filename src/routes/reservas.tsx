import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { FloorPlan, SpaceMeta } from "@/components/floor-plan";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import { createReservation, getOccupancy, getPublicCatalog } from "@/lib/api/public";
import { formatMoney, nextClubDate } from "@/lib/format";
import type { SpaceItem } from "@/lib/types";
import { cn } from "@/lib/utils";

type Search = { date?: string; tab?: "mesa" | "salao" };

export const Route = createFileRoute("/reservas")({
  validateSearch: (raw: Record<string, unknown>): Search => ({
    date: typeof raw.date === "string" ? raw.date : undefined,
    tab: raw.tab === "salao" ? "salao" : "mesa",
  }),
  loader: () => getPublicCatalog(),
  component: Reservas,
});

function Reservas() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const qc = useQueryClient();
  const initialData = Route.useLoaderData();
  const catalog = useQuery({
    queryKey: ["catalog"],
    queryFn: () => getPublicCatalog(),
    initialData,
  });
  const date = search.date ?? nextClubDate();
  const tab = search.tab ?? "mesa";

  const occupancy = useQuery({
    queryKey: ["occupancy", date],
    queryFn: () => getOccupancy({ data: { date } }),
  });

  const spaces = catalog.data?.spaces ?? [];
  const visible = spaces.filter((s) => s.kind === tab);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selected = visible.find((s) => s.id === selectedId) ?? null;

  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [partySize, setPartySize] = useState(2);
  const [notes, setNotes] = useState("");
  const [done, setDone] = useState<{ name: string; code: string } | null>(null);

  const takenIds = useMemo(
    () => new Set((occupancy.data ?? []).map((o) => o.spaceId)),
    [occupancy.data],
  );

  const mutation = useMutation({
    mutationFn: () => {
      if (!selected) throw new Error("Escolha um espaço.");
      return createReservation({
        data: {
          spaceId: selected.id,
          guestName,
          guestEmail,
          guestPhone,
          partySize,
          reservedFor: date,
          notes,
        },
      });
    },
    onSuccess: (res) => {
      setDone({ name: res.spaceName, code: res.spaceCode });
      toast.success("Pedido enviado. A casa confirma por e-mail.");
      void qc.invalidateQueries({ queryKey: ["occupancy"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  function selectSpace(space: SpaceItem) {
    setSelectedId(space.id);
    setPartySize(Math.min(space.capacity, Math.max(2, partySize)));
    setDone(null);
  }

  return (
    <div className="min-h-dvh bg-bg">
      <SiteHeader />
      <main className="page-gutter py-12 md:py-16">
        <p className="kicker">Reservas</p>
        <h1 className="mt-3 font-display text-[clamp(2.5rem,6vw,5rem)] text-fg">
          Mesas e salão
        </h1>
        <p className="mt-4 max-w-xl text-sm text-muted">
          Escolha a data, o espaço na planta e envie o pedido. Mesas têm consumo
          mínimo. O salão é exclusivo — uma data, um evento.
        </p>

        <div className="mt-10 flex flex-wrap items-end gap-4">
          <Field label="Data da noite">
            <Input
              type="date"
              value={date}
              min={new Date().toISOString().slice(0, 10)}
              onChange={(e) => {
                setSelectedId(null);
                setDone(null);
                void navigate({ search: (prev) => ({ ...prev, date: e.target.value }) });
              }}
              className="w-auto min-w-48"
            />
          </Field>
          <div className="flex h-11 rounded-md border border-border p-1">
            {(["mesa", "salao"] as const).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setSelectedId(null);
                  void navigate({ search: (prev) => ({ ...prev, tab: key }) });
                }}
                className={cn(
                  "h-full rounded-sm px-4 text-xs uppercase tracking-[0.16em]",
                  tab === key ? "bg-accent text-accent-fg" : "text-muted hover:text-fg",
                )}
              >
                {key === "mesa" ? "Mesas" : "Salão"}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <FloorPlan
              kind={tab}
              spaces={visible}
              occupancy={occupancy.data ?? []}
              selectedId={selectedId}
              onSelect={selectSpace}
            />
            <ul className="mt-6 grid gap-2 sm:grid-cols-2">
              {visible.map((space) => {
                const taken = takenIds.has(space.id);
                return (
                  <li key={space.id}>
                    <button
                      type="button"
                      disabled={taken}
                      onClick={() => selectSpace(space)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-md border px-3 py-3 text-left text-sm",
                        selectedId === space.id
                          ? "border-accent bg-accent/10"
                          : "border-border",
                        taken && "opacity-40",
                      )}
                    >
                      <span>
                        <span className="font-medium text-fg">{space.code}</span>
                        <span className="text-muted"> · {space.name}</span>
                      </span>
                      <span className="text-xs text-muted">
                        {taken ? "ocupado" : `${space.capacity} pax`}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="lg:col-span-6">
            {done ? (
              <div className="rounded-xl border border-border bg-surface p-6 md:p-8">
                <p className="kicker text-accent">Pedido recebido</p>
                <h2 className="mt-3 font-display text-4xl text-fg">A casa responde.</h2>
                <p className="mt-4 text-sm text-muted">
                  {done.code} · {done.name} para {date}. Pedidos ficam pendentes até a
                  supervisão confirmar.
                </p>
                <Button
                  className="mt-8"
                  variant="secondary"
                  onClick={() => {
                    setDone(null);
                    setSelectedId(null);
                    setGuestName("");
                    setGuestEmail("");
                    setGuestPhone("");
                    setNotes("");
                  }}
                >
                  Fazer outro pedido
                </Button>
              </div>
            ) : selected ? (
              <form
                className="rounded-xl border border-border bg-surface p-6 md:p-8"
                onSubmit={(e) => {
                  e.preventDefault();
                  mutation.mutate();
                }}
              >
                <SpaceMeta space={selected} />
                <p className="mt-3 text-sm text-muted">
                  Até {selected.capacity} pessoas
                  {selected.minSpend > 0 ? ` · consumo mín. ${formatMoney(selected.minSpend)}` : ""}
                </p>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <Field label="Nome">
                    <Input
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      required
                    />
                  </Field>
                  <Field label="Telefone">
                    <Input
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      required
                    />
                  </Field>
                  <Field label="E-mail">
                    <Input
                      type="email"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      required
                    />
                  </Field>
                  <Field label="Pessoas">
                    <Input
                      type="number"
                      min={1}
                      max={selected.capacity}
                      value={partySize}
                      onChange={(e) => setPartySize(Number(e.target.value))}
                      required
                    />
                  </Field>
                </div>
                <div className="mt-4">
                  <Field label="Observações">
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Aniversário, horário de chegada, restrições…"
                    />
                  </Field>
                </div>
                <Button type="submit" className="mt-6 w-full" size="lg" disabled={mutation.isPending}>
                  {mutation.isPending ? "Enviando…" : "Enviar pedido"}
                </Button>
              </form>
            ) : (
              <div className="rounded-xl border border-dashed border-border p-8 text-sm text-muted">
                Selecione um espaço livre na planta para continuar.
              </div>
            )}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
