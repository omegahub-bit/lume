import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { GROK_PROVIDERS, authClient, authEnabled, signIn } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "up") {
        const { error: err } = await authClient.signUp.email({
          email,
          password,
          name: name || email.split("@")[0],
          callbackURL: "/painel",
        });
        if (err) throw new Error(err.message);
      } else {
        const { error: err } = await authClient.signIn.email({
          email,
          password,
          callbackURL: "/painel",
        });
        if (err) throw new Error(err.message);
      }
      window.location.href = "/painel";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível entrar.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-dvh place-items-center bg-bg px-6 py-12">
      <div className="w-full max-w-sm">
        <Link to="/" className="font-display text-4xl text-fg">
          LUME
        </Link>
        <p className="mt-6 kicker">Equipe</p>
        <h1 className="mt-2 font-display text-4xl text-fg">
          {mode === "in" ? "Entrar" : "Criar acesso"}
        </h1>
        <p className="mt-2 text-sm text-muted">
          Painel interno da casa. O primeiro login vira admin; os demais aguardam aprovação.
        </p>

        {authEnabled ? (
          <div className="mt-8 space-y-3">
            {GROK_PROVIDERS.map((p) => (
              <Button
                key={p.providerId}
                type="button"
                variant="secondary"
                className="w-full"
                onClick={() => signIn(p.providerId, { callbackURL: "/painel" })}
              >
                Continuar com {p.label}
              </Button>
            ))}

            <div className="flex items-center gap-3 py-2">
              <span className="h-px flex-1 bg-border" />
              <span className="text-xs uppercase tracking-[0.16em] text-subtle">ou e-mail</span>
              <span className="h-px flex-1 bg-border" />
            </div>

            <form onSubmit={onSubmit} className="space-y-3">
              {mode === "up" ? (
                <Field label="Nome">
                  <Input value={name} onChange={(e) => setName(e.target.value)} required />
                </Field>
              ) : null}
              <Field label="E-mail">
                <Input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Field>
              <Field label="Senha">
                <Input
                  type="password"
                  autoComplete={mode === "up" ? "new-password" : "current-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                  required
                />
              </Field>
              {error ? <p className="text-sm text-danger">{error}</p> : null}
              <Button type="submit" className="w-full" disabled={busy}>
                {busy ? "Aguarde…" : mode === "in" ? "Entrar" : "Criar conta"}
              </Button>
            </form>

            <button
              type="button"
              className="w-full pt-2 text-sm text-muted hover:text-fg"
              onClick={() => {
                setMode(mode === "in" ? "up" : "in");
                setError(null);
              }}
            >
              {mode === "in" ? "Precisa de uma conta? Criar acesso" : "Já tem conta? Entrar"}
            </button>
          </div>
        ) : (
          <p className="mt-6 text-sm text-muted">O acesso da equipe está desativado.</p>
        )}

        <Link to="/" className="mt-10 inline-block text-sm text-subtle hover:text-fg">
          Voltar à casa
        </Link>
      </div>
    </main>
  );
}
