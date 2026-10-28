import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { addMedia, deleteMedia, getStaffSession, listAllMedia } from "@/lib/api/staff";
import { youtubeId } from "@/lib/format";

export const Route = createFileRoute("/painel/midia")({ component: PainelMidia });

function PainelMidia() {
  const qc = useQueryClient();
  const session = useQuery({ queryKey: ["staff-session"], queryFn: () => getStaffSession() });
  const list = useQuery({ queryKey: ["staff-media"], queryFn: () => listAllMedia() });
  const canDelete = ["admin", "supervisor"].includes(session.data?.staff?.role ?? "");

  const [kind, setKind] = useState<"photo" | "video">("photo");
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");

  const add = useMutation({
    mutationFn: () => addMedia({ data: { kind, url, title } }),
    onSuccess: () => {
      toast.success("Mídia adicionada à galeria.");
      setUrl("");
      setTitle("");
      void qc.invalidateQueries({ queryKey: ["staff-media"] });
      void qc.invalidateQueries({ queryKey: ["catalog"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: number) => deleteMedia({ data: { id } }),
    onSuccess: () => {
      toast.success("Removido.");
      void qc.invalidateQueries({ queryKey: ["staff-media"] });
      void qc.invalidateQueries({ queryKey: ["catalog"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <main className="px-5 py-8 md:px-10">
      <p className="kicker">Arquivo</p>
      <h1 className="mt-2 font-display text-4xl text-fg">Fotos e vídeos</h1>
      <p className="mt-2 max-w-lg text-sm text-muted">
        Cole a URL de uma imagem, um MP4 hospedado ou um link do YouTube. Colaboradores podem
        adicionar; exclusão é da supervisão.
      </p>

      <form
        className="mt-8 grid gap-4 rounded-xl border border-border bg-surface p-6 md:grid-cols-12"
        onSubmit={(e) => {
          e.preventDefault();
          add.mutate();
        }}
      >
        <div className="md:col-span-2">
          <Field label="Tipo">
            <select
              className="h-11 w-full rounded-md border border-border bg-elevated px-3 text-sm text-fg"
              value={kind}
              onChange={(e) => setKind(e.target.value as "photo" | "video")}
            >
              <option value="photo">Foto</option>
              <option value="video">Vídeo</option>
            </select>
          </Field>
        </div>
        <div className="md:col-span-5">
          <Field label="URL">
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://… ou /images/arquivo.jpg"
              required
            />
          </Field>
        </div>
        <div className="md:col-span-3">
          <Field label="Título">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </Field>
        </div>
        <div className="flex items-end md:col-span-2">
          <Button type="submit" className="w-full" disabled={add.isPending}>
            Adicionar
          </Button>
        </div>
      </form>

      <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {(list.data ?? []).map((item) => {
          const yt = item.kind === "video" ? youtubeId(item.url) : null;
          return (
            <figure key={item.id} className="overflow-hidden rounded-lg bg-surface">
              {item.kind === "video" && yt ? (
                <img
                  src={`https://img.youtube.com/vi/${yt}/hqdefault.jpg`}
                  alt=""
                  className="aspect-video w-full object-cover"
                />
              ) : item.kind === "video" ? (
                <video className="aspect-video w-full object-cover" muted playsInline>
                  <source src={item.url} type="video/mp4" />
                </video>
              ) : (
                <img src={item.url} alt="" className="aspect-photo w-full object-cover" />
              )}
              <figcaption className="flex items-center justify-between gap-2 px-3 py-2">
                <span className="truncate text-xs text-muted">{item.title || item.kind}</span>
                {canDelete ? (
                  <button
                    type="button"
                    className="text-xs text-subtle hover:text-danger"
                    onClick={() => remove.mutate(item.id)}
                  >
                    Excluir
                  </button>
                ) : null}
              </figcaption>
            </figure>
          );
        })}
      </div>
    </main>
  );
}
