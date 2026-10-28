import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export function formatEventDate(isoDate: string, time?: string) {
  const d = parseISO(isoDate);
  const date = format(d, "d 'de' MMMM", { locale: ptBR });
  if (!time) return date;
  const hh = time.slice(0, 5);
  return `${date} · ${hh}`;
}

export function formatEventDateLong(isoDate: string, time?: string) {
  const d = parseISO(isoDate);
  const date = format(d, "EEEE, d 'de' MMMM", { locale: ptBR });
  if (!time) return date;
  return `${date} · ${time.slice(0, 5)}`;
}

export function formatShortDate(isoDate: string) {
  return format(parseISO(isoDate), "d MMM", { locale: ptBR });
}

export function formatWeekday(isoDate: string) {
  return format(parseISO(isoDate), "EEEE", { locale: ptBR });
}

export function todayIso(timeZone = "America/Sao_Paulo") {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function formatMoney(reais: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(reais);
}

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 72);
}

export function nextClubDate(from = new Date()) {
  const d = new Date(from);
  d.setHours(0, 0, 0, 0);
  for (let i = 0; i < 8; i += 1) {
    const day = d.getDay();
    if (day === 4 || day === 5 || day === 6) {
      return format(d, "yyyy-MM-dd");
    }
    d.setDate(d.getDate() + 1);
  }
  return format(d, "yyyy-MM-dd");
}

export function youtubeId(url: string) {
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/,
  );
  return m?.[1] ?? null;
}
