import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getEventBySlug } from "@/lib/api/public";
import { formatEventDateLong } from "@/lib/format";
import { VENUE_LABEL } from "@/lib/types";

export const Route = createFileRoute("/eventos/$slug")({ component: EventDetail });

function EventDetail() {
  const { slug } = Route.useParams();
  const { data, isPending } = useQuery({
    queryKey: ["event", slug],
    queryFn: () => getEventBySlug({ data: { slug } }),
  });

  return (
    <div className="min-h-dvh bg-bg">
      <SiteHeader />
      <main className="page-gutter py-12 md:py-16">
        <Link to="/eventos" className="text-xs uppercase tracking-[0.16em] text-muted hover:text-fg">
          Agenda
        </Link>

        {isPending ? (
          <div className="mt-8 h-96 animate-pulse rounded-xl bg-surface" />
        ) : !data ? (
          <p className="mt-10 text-muted">Evento não encontrado.</p>
        ) : (
          <article className="mt-8 grid gap-10 lg:grid-cols-12">
            <div className="overflow-hidden rounded-xl lg:col-span-7">
              {data.videoUrl && data.videoUrl.endsWith(".mp4") ? (
                <video
                  className="aspect-tall w-full object-cover md:aspect-video lg:aspect-tall"
                  controls
                  playsInline
                  poster={data.coverUrl}
                >
                  <source src={data.videoUrl} type="video/mp4" />
                </video>
              ) : (
                <img
                  src={data.coverUrl || "/images/hero.jpg"}
                  alt=""
                  className="aspect-tall w-full object-cover"
                />
              )}
            </div>
            <div className="lg:col-span-5">
              <p className="kicker text-accent">{VENUE_LABEL[data.venue] ?? data.venue}</p>
              <h1 className="mt-3 font-display text-5xl text-fg md:text-6xl">{data.title}</h1>
              <p className="mt-4 text-sm capitalize text-muted">
                {formatEventDateLong(data.eventDate, data.startTime)} — {data.endTime}
              </p>
              <p className="mt-8 text-base leading-relaxed text-fg/85">{data.description}</p>
              {data.lineup ? (
                <p className="mt-6 text-sm text-muted">
                  <span className="kicker mr-3 inline-block">Line-up</span>
                  {data.lineup}
                </p>
              ) : null}
              <div className="mt-10 flex flex-wrap gap-3">
                <Link
                  to="/reservas"
                  search={{ date: data.eventDate }}
                  className="inline-flex h-12 items-center rounded-md bg-accent px-6 text-xs uppercase tracking-[0.18em] text-accent-fg"
                >
                  Reservar mesa
                </Link>
                {data.ticketUrl ? (
                  <a
                    href={data.ticketUrl}
                    className="inline-flex h-12 items-center rounded-md border border-border-strong px-6 text-xs uppercase tracking-[0.18em] text-fg"
                  >
                    Ingressos
                  </a>
                ) : null}
              </div>
            </div>
          </article>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
