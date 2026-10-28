import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const Route = createFileRoute("/espacos")({ component: Espacos });

const ROOMS = [
  {
    kicker: "Pista",
    title: "A casa aberta",
    copy: "O centro da noite. Som da casa, luz baixa, pista de concreto. Mesas de lounge na borda — quem quer ficar perto do DJ reserva P1, P2 ou P3.",
    img: "/images/hero.jpg",
  },
  {
    kicker: "Bar",
    title: "Carta curta",
    copy: "Uma banca de pedra, poucas altas, o serviço que atravessa a madrugada. A high table B1 é a única mesa do bar com reserva.",
    img: "/images/bar.jpg",
  },
  {
    kicker: "Camarote",
    title: "Vista fechada",
    copy: "Dois camarotes sobre a pista. Sofás, serviço dedicado, consumo mínimo. C1 encara o DJ; C2 é mais recolhido.",
    img: "/images/camarote.jpg",
  },
  {
    kicker: "Mezanino",
    title: "Acima da pista",
    copy: "Uma faixa mais quieta. Mesas M1 e M2, vista aberta, afters da casa quando a pista esvazia.",
    img: "/images/mezanino.jpg",
  },
  {
    kicker: "Salão",
    title: "Eventos privados",
    copy: "O salão principal cabe 150. O lounge anexo, 40. Data exclusiva, palco e som da casa. Casamentos, lançamentos, jantares longos.",
    img: "/images/salao.jpg",
  },
];

function Espacos() {
  return (
    <div className="min-h-dvh bg-bg">
      <SiteHeader />
      <main>
        <section className="relative">
          <img src="/images/facade.jpg" alt="" className="h-[52vh] w-full object-cover" />
          <div className="absolute inset-0 bg-linear-to-t from-bg via-bg/40 to-bg/20" />
          <div className="absolute inset-x-0 bottom-0 page-gutter pb-10">
            <p className="kicker text-accent">A casa</p>
            <h1 className="mt-3 font-display text-[clamp(2.75rem,7vw,6rem)] text-fg">
              Três salas, uma porta.
            </h1>
          </div>
        </section>

        <section className="page-gutter divide-y divide-border py-6">
          {ROOMS.map((room, i) => (
            <article
              key={room.kicker}
              className="grid gap-8 py-12 md:grid-cols-12 md:items-center"
            >
              <div className={i % 2 === 1 ? "md:order-2 md:col-span-6" : "md:col-span-6"}>
                <img src={room.img} alt="" className="aspect-video w-full rounded-xl object-cover" />
              </div>
              <div className="md:col-span-6">
                <p className="kicker">{room.kicker}</p>
                <h2 className="mt-2 font-display text-4xl text-fg md:text-5xl">{room.title}</h2>
                <p className="mt-4 max-w-md text-base leading-relaxed text-muted">{room.copy}</p>
              </div>
            </article>
          ))}
        </section>

        <section className="page-gutter pb-20">
          <div className="rounded-xl border border-border bg-surface p-8 md:flex md:items-center md:justify-between md:p-10">
            <div>
              <p className="kicker">Reservas</p>
              <h2 className="mt-2 font-display text-4xl text-fg">Escolha a mesa na planta.</h2>
            </div>
            <Link
              to="/reservas"
              className="mt-6 inline-flex h-12 items-center rounded-md bg-accent px-6 text-xs uppercase tracking-[0.18em] text-accent-fg md:mt-0"
            >
              Abrir reservas
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
