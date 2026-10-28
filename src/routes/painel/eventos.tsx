import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { deleteEvent, getStaffSession, listAllEvents, saveEvent } from "@/lib/api/staff";
import { formatEventDate } from "@/lib/format";
import type { EventItem } from "@/lib/types";
import { VENUE_LABEL } from "@/lib/types";

export const Route = createFileRoute("/painel/eventos")({ component: PainelEventos });

const EMPTY = {
  title: "",
  description: "",
  lineup: "",
  venue: "pista",
  eventDate: "",
  startTime: "23:00",
  endTime: "06:00",
  coverUrl: "",
  videoUrl: "",
  ticketUrl: "",
  featured: false,
  published: true,
};

function PainelEventos() {
  const qc = useQueryClient();
  const session = useQuery({ queryKey: ["staff-session"], queryFn: () => getStaffSession() });
  const list = useQuery({ queryKey: ["staff-events"], queryFn: () => listAllEvents() });
  const canEdit = ["admin", "supervisor"].includes(session.data?.staff?.role ?? "");
  const [editing, setEditing] = useState<Partial<EventItem> | null>(null);
  const form = editing ?? null;

  const save = useMutation({
    mutationFn: () => {
      if (!form || !form.title || !form.eventDate) throw new Error("Preencha título e data.");
      return saveEvent({
        data: {
          id: form.id,
          title: form.title,
          slug: form.slug,
          description: form.description ?? "",
          lineup: form.lineup ?? "",
          venue: form.venue ?? "pista",
          eventDate: form.eventDate,
          startTime: form.startTime ?? "23:00",
          endTime: form.endTime ?? "06:00",
          coverUrl: form.coverUrl ?? "",
          videoUrl: form.videoUrl ?? "",
          ticketUrl: form.ticketUrl ?? "",
          featured: form.featured ?? false,
          published: form.published ?? true,
        },
      });
    },
    onSuccess: () => {
      toast.success("Evento salvo.");
      setEditing(null);
      void qc.invalidateQueries({ queryKey: ["staff-events"] });
      void qc.invalidateQueries({ queryKey: ["catalog"] });
      void qc.invalidateQueries({ queryKey: ["staff-dash"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: number) => deleteEvent({ data: { id } }),
    onSuccess: () => {
      toast.success("Evento removido.");
      void qc.invalidateQueries({ queryKey: ["staff-events"] });
      void qc.invalidateQueries({ queryKey: ["catalog"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <main className="px-5 py-8 md:px-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="kicker">Programação</p>
          <h1 className="mt-2 font-display text-4xl text-fg">Eventos</h1>
        </div>
        {canEdit ? <Button onClick={() => setEditing({ ...EMPTY })}>Novo evento</Button> : null}
      </div>

      {form ? (
        <form
          className="mt-8 rounded-xl border border-border bg-surface p-6"
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate();
          }}
        >
          <h2 className="font-display text-2xl text-fg">
            {form.id ? "Editar evento" : "Novo evento"}
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Field label="Título">
              <Input
                value={form.title ?? ""}
                onChange={(e) => setEditing({ ...form, title: e.target.value })}
                required
              />
            </Field>
            <Field label="Espaço">
              <select
                className="h-11 w-full rounded-md border border-border bg-elevated px-3 text-sm text-fg"
                value={form.venue ?? "pista"}
                onChange={(e) => setEditing({ ...form, venue: e.target.value })}
              >
                {Object.entries(VENUE_LABEL).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Data">
              <Input
                type="date"
                value={form.eventDate ?? ""}
                onChange={(e) => setEditing({ ...form, eventDate: e.target.value })}
                required
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Início">
                <Input
                  type="time"
                  value={form.startTime ?? "23:00"}
                  onChange={(e) => setEditing({ ...form, startTime: e.target.value })}
                />
              </Field>
              <Field label="Fim">
                <Input
                  type="time"
                  value={form.endTime ?? "06:00"}
                  onChange={(e) => setEditing({ ...form, endTime: e.target.value })}
                />
              </Field>
            </div>
            <Field label="Line-up">
              <Input
                value={form.lineup ?? ""}
                onChange={(e) => setEditing({ ...form, lineup: e.target.value })}
              />
            </Field>
            <Field label="URL da capa">
              <Input
                value={form.coverUrl ?? ""}
                onChange={(e) => setEditing({ ...form, coverUrl: e.target.value })}
                placeholder="/images/hero.jpg"
              />
            </Field>
            <Field label="URL do vídeo">
              <Input
                value={form.videoUrl ?? ""}
                onChange={(e) => setEditing({ ...form, videoUrl: e.target.value })}
                placeholder="/videos/hero.mp4 ou YouTube"
              />
            </Field>
            <Field label="URL de ingressos">
              <Input
                value={form.ticketUrl ?? ""}
                onChange={(e) => setEditing({ ...form, ticketUrl: e.target.value })}
              />
            </Field>
          </div>
          <div className="mt-4">
            <Field label="Descrição">
              <Textarea
                value={form.description ?? ""}
                onChange={(e) => setEditing({ ...form, description: e.target.value })}
              />
            </Field>
          </div>
          <div className="mt-4 flex flex-wrap gap-6 text-sm">
            <label className="flex items-center gap-2 text-fg">
              <input
                type="checkbox"
                checked={form.featured ?? false}
                onChange={(e) => setEditing({ ...form, featured: e.target.checked })}
              />
              Destacar como próximo evento
            </label>
            <label className="flex items-center gap-2 text-fg">
              <input
                type="checkbox"
                checked={form.published ?? true}
                onChange={(e) => setEditing({ ...form, published: e.target.checked })}
              />
              Publicado
            </label>
          </div>
          <div className="mt-6 flex gap-3">
            <Button type="submit" disabled={save.isPending}>
              {save.isPending ? "Salvando…" : "Salvar"}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setEditing(null)}>
              Cancelar
            </Button>
          </div>
        </form>
      ) : null}

      <ul className="mt-8 divide-y divide-border border-y border-border">
        {(list.data ?? []).map((event) => (
          <li key={event.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
            <div>
              <p className="text-fg">{event.title}</p>
              <p className="text-sm text-muted">
                {formatEventDate(event.eventDate, event.startTime)} ·{" "}
                {VENUE_LABEL[event.venue] ?? event.venue}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {event.featured ? <Badge tone="accent">Destaque</Badge> : null}
              {!event.published ? <Badge>Rascunho</Badge> : null}
              {canEdit ? (
                <>
                  <Button size="sm" variant="secondary" onClick={() => setEditing(event)}>
                    Editar
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => remove.mutate(event.id)}>
                    Excluir
                  </Button>
                </>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
