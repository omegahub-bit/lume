import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getPublicCatalog } from "@/lib/api/public";
import { youtubeId } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/galeria")({
  loader: () => getPublicCatalog(),
  component: Galeria,
});

function Galeria() {
  const initial = Route.useLoaderData();
  const { data, isPending } = useQuery({
    queryKey: ["catalog"],
    queryFn: () => getPublicCatalog(),
    initialData: initial,
  });
  const media = data?.media ?? [];

  return (
    <div className="min-h-dvh bg-bg">
      <SiteHeader />
      <main className="page-gutter py-12 md:py-16">
        <p className="kicker">Arquivo</p>
        <h1 className="mt-3 font-display text-[clamp(2.5rem,6vw,5rem)] text-fg">Galeria</h1>
        <p className="mt-4 max-w-lg text-sm text-muted">
          Fotos e vídeos da casa. O painel da equipe atualiza este arquivo.
        </p>

        {isPending ? (
          <div className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-photo animate-pulse rounded-lg bg-surface" />
            ))}
          </div>
        ) : (
          <div className="mt-12 columns-1 gap-3 sm:columns-2 lg:columns-3">
            {media.map((item, i) => {
              const yt = item.kind === "video" ? youtubeId(item.url) : null;
              return (
                <figure
                  key={item.id}
                  className={cn("mb-3 break-inside-avoid overflow-hidden rounded-lg bg-surface")}
                >
                  {item.kind === "video" && yt ? (
                    <iframe
                      title={item.title || "Vídeo"}
                      src={`https://www.youtube.com/embed/${yt}`}
                      className="aspect-video w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : item.kind === "video" ? (
                    <video
                      className="w-full"
                      controls
                      playsInline
                      preload="metadata"
                      poster="/images/hero.jpg"
                    >
                      <source src={item.url} type="video/mp4" />
                    </video>
                  ) : (
                    <img
                      src={item.url}
                      alt={item.title}
                      className={cn("w-full object-cover", i % 5 === 0 ? "aspect-poster" : "aspect-photo")}
                    />
                  )}
                  {item.title ? (
                    <figcaption className="px-3 py-2 text-xs uppercase tracking-[0.14em] text-muted">
                      {item.title}
                    </figcaption>
                  ) : null}
                </figure>
              );
            })}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
