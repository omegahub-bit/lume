import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="page-gutter grid gap-10 py-14 md:grid-cols-3 md:gap-8">
        <div>
          <p className="font-display text-4xl text-fg">LUME</p>
          <p className="mt-3 max-w-xs text-sm text-muted">
            Casa de noite, bar e salão de eventos em Vila Madalena.
          </p>
        </div>
        <div>
          <p className="kicker">Casa</p>
          <p className="mt-3 text-sm text-fg">Rua Harmonia, 412</p>
          <p className="text-sm text-muted">Vila Madalena, São Paulo</p>
          <p className="mt-3 text-sm text-muted">Qui–Sáb, 23h–6h</p>
        </div>
        <div className="flex flex-col gap-2 text-sm">
          <p className="kicker">Reservas</p>
          <Link to="/reservas" className="mt-3 text-fg hover:text-accent">
            Mesas e salão
          </Link>
          <a href="mailto:reservas@lume.casa" className="text-muted hover:text-fg">
            reservas@lume.casa
          </a>
          <Link to="/painel" className="text-muted hover:text-fg">
            Acesso da equipe
          </Link>
        </div>
      </div>
      <div className="page-gutter flex flex-wrap items-center justify-between gap-3 border-t border-border py-5 text-xs text-subtle">
        <span>LUME · São Paulo</span>
        <span>Noite, em estado puro.</span>
      </div>
    </footer>
  );
}
