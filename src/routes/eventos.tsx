import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { EventCard } from "@/components/event-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getPublicCatalog } from "@/lib/api/public";
import { formatEventDateLong } from "@/lib/format";

export const Route = createFileRoute("/eventos")({
  loader: () => getPublicCatalog(),
  component: Eventos,
});

function Eventos() {
  const initial = Route.useLoaderData();
  const { data, isPending } = useQuery({
    queryKey: ["catalog"],
    queryFn: () => getPublicCatalog(),
    initialData: initial,
  });
  const next = data?.nextEvent;
  const rest = (data?.upcoming ?? []).filter((e) => e.id !== next?.id);
  const past = (data?.events ?? []).filter(
    (e) => !data?.upcoming?.some((u) => u.id === e.id),
  );

  return (
    <div className="min-h-dvh bg-bg">
      <SiteHeader />
      <main className="page-gutter py-12 md:py-16">
        <p className="kicker">Agenda</p>
        <h1 className="mt-3 font-display text-[clamp(2.5rem,6vw,5rem)] text-fg">
          Noites na casa
        </h1>

        {next ? (
          <article className="mt-12 overflow-hidden rounded-xl bg-surface md:grid md:grid-cols-2 md:items-stretch">
            <img
              src={next.coverUrl || "/images/hero.jpg"}
              alt=""
              className="aspect-tall w-full object-cover md:aspect-auto md:max-h-[34rem] md:h-full"
            />
            <div className="flex flex-col justify-between p-6 md:p-10">
              <div>
                <p className="kicker text-accent">Em destaque</p>
                <h2 className="mt-3 font-display text-5xl text-fg">{next.title}</h2>
                <p className="mt-3 text-sm capitalize text-muted">
                  {formatEventDateLong(next.eventDate, next.startTime)}
                </p>
                <p className="mt-6 max-w-md text-base leading-relaxed text-fg/80">
                  {next.description}
                </p>
                {next.lineup ? (
                  <p className="mt-4 text-sm text-muted">{next.lineup}</p>
                ) : null}
              </div>
              <Link
                to="/eventos/$slug"
                params={{ slug: next.slug }}
                className="mt-8 inline-flex h-12 w-fit items-center rounded-md bg-accent px-6 text-xs uppercase tracking-[0.18em] text-accent-fg"
              >
                Ver evento
              </Link>
            </div>
          </article>
        ) : null}

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {isPending
            ? [1, 2, 3].map((i) => (
                <div key={i} className="aspect-poster animate-pulse rounded-xl bg-surface" />
              ))
            : rest.map((event) => <EventCard key={event.id} event={event} />)}
        </div>

        {past.length > 0 ? (
          <section className="mt-20">
            <p className="kicker">Arquivo</p>
            <h2 className="mt-2 font-display text-3xl text-fg">Noites anteriores</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {past.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </section>
        ) : null}
      </main>
      <SiteFooter />
    </div>
  );
}
