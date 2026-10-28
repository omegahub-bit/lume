import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { EventCard } from "@/components/event-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getPublicCatalog } from "@/lib/api/public";
import { formatEventDateLong } from "@/lib/format";
import { VENUE_LABEL } from "@/lib/types";

export const Route = createFileRoute("/")({
  loader: () => getPublicCatalog(),
  component: Home,
});

function Home() {
  const initial = Route.useLoaderData();
  const { data, isPending } = useQuery({
    queryKey: ["catalog"],
    queryFn: () => getPublicCatalog(),
    initialData: initial,
  });

  const next = data?.nextEvent ?? null;
  const upcoming = (data?.upcoming ?? []).filter((e) => e.id !== next?.id).slice(0, 3);
  const photos = (data?.media ?? []).filter((m) => m.kind === "photo").slice(0, 6);

  return (
    <div className="min-h-dvh bg-bg">
      <SiteHeader overlay />

      <section className="relative min-h-dvh overflow-hidden">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          poster="/images/hero.jpg"
        >
          <source src="/videos/hero.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-linear-to-t from-bg via-bg/55 to-bg/25" />

        <div className="relative flex min-h-dvh flex-col justify-end page-gutter pb-16 pt-28 md:pb-20">
          <p className="kicker text-accent">Casa de noite · Vila Madalena</p>
          <h1 className="mt-4 max-w-4xl font-display text-[clamp(3.5rem,12vw,9rem)] leading-[0.9] text-fg">
            LUME
          </h1>
          <p className="mt-4 max-w-md text-base text-fg/80 md:text-lg">
            Pista, bar e salão. Uma noite, por vez.
          </p>

          {isPending ? (
            <div className="mt-12 h-28 w-full max-w-xl animate-pulse rounded-xl bg-elevated/80" />
          ) : next ? (
            <Link
              to="/eventos/$slug"
              params={{ slug: next.slug }}
              className="group mt-12 flex max-w-2xl items-stretch gap-4 border-t border-border pt-6"
            >
              <img
                src={next.coverUrl || "/images/hero.jpg"}
                alt=""
                className="hidden h-28 w-20 shrink-0 rounded-md object-cover sm:block"
              />
              <div className="flex min-w-0 flex-1 items-end justify-between gap-4">
                <div>
                  <p className="kicker text-accent">Próximo evento</p>
                  <h2 className="mt-2 font-display text-4xl text-fg md:text-5xl">{next.title}</h2>
                  <p className="mt-2 text-sm capitalize text-muted">
                    {formatEventDateLong(next.eventDate, next.startTime)}
                    {next.lineup ? ` · ${next.lineup}` : ""}
                  </p>
                </div>
                <ArrowUpRight className="mb-1 size-6 shrink-0 text-accent transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </Link>
          ) : null}

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/reservas"
              className="inline-flex h-12 items-center rounded-md bg-accent px-6 text-xs uppercase tracking-[0.18em] text-accent-fg"
            >
              Reservar mesa
            </Link>
            <Link
              to="/eventos"
              className="inline-flex h-12 items-center rounded-md border border-border-strong px-6 text-xs uppercase tracking-[0.18em] text-fg"
            >
              Ver agenda
            </Link>
          </div>
        </div>
      </section>

      <section className="page-gutter grid gap-10 border-t border-border py-20 md:grid-cols-12 md:py-28">
        <p className="kicker md:col-span-3">A casa</p>
        <div className="md:col-span-8">
          <h2 className="font-display text-[clamp(2rem,4vw,3.5rem)] text-fg">
            Uma sala escura, um bar curto, um salão para o que não cabe na pista.
          </h2>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted">
            LUME abre de quinta a sábado em Vila Madalena. Mesas com consumo mínimo,
            camarotes com vista, salão para eventos privados. O som é da casa.
            A reserva é o único caminho.
          </p>
        </div>
      </section>

      <section className="page-gutter pb-20">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="kicker">Agenda</p>
            <h2 className="mt-2 font-display text-4xl text-fg">Próximas noites</h2>
          </div>
          <Link to="/eventos" className="text-xs uppercase tracking-[0.16em] text-muted hover:text-fg">
            Ver todas
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {next ? <EventCard event={next} /> : null}
          {upcoming.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </section>

      <section className="page-gutter grid gap-4 pb-20 md:grid-cols-3">
        {[
          {
            to: "/espacos" as const,
            img: "/images/hero.jpg",
            kicker: "Pista",
            title: "A casa aberta",
            copy: VENUE_LABEL.pista,
          },
          {
            to: "/espacos" as const,
            img: "/images/bar.jpg",
            kicker: "Bar",
            title: "Carta curta",
            copy: "Luz baixa, poucas mesas altas.",
          },
          {
            to: "/espacos" as const,
            img: "/images/salao.jpg",
            kicker: "Salão",
            title: "Eventos privados",
            copy: "Até 150 pessoas. Data exclusiva.",
          },
        ].map((card) => (
          <Link key={card.kicker} to={card.to} className="group relative block overflow-hidden rounded-xl">
            <img
              src={card.img}
              alt=""
              className="aspect-tall w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-linear-to-t from-bg via-bg/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5">
              <p className="kicker text-accent">{card.kicker}</p>
              <h3 className="mt-1 font-display text-3xl text-fg">{card.title}</h3>
              <p className="mt-1 text-sm text-muted">{card.copy}</p>
            </div>
          </Link>
        ))}
      </section>

      <section className="page-gutter pb-24">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="kicker">Arquivo</p>
            <h2 className="mt-2 font-display text-4xl text-fg">Galeria</h2>
          </div>
          <Link to="/galeria" className="text-xs uppercase tracking-[0.16em] text-muted hover:text-fg">
            Ver galeria
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {photos.map((item) => (
            <img
              key={item.id}
              src={item.url}
              alt={item.title}
              className="aspect-photo h-full w-full rounded-lg object-cover"
            />
          ))}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
