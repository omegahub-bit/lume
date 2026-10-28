import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { todayIso } from "@/lib/format";
import type {
  EventItem,
  MediaItem,
  Occupancy,
  ReservationItem,
  SpaceItem,
} from "@/lib/types";

type EventRow = {
  id: number;
  title: string;
  slug: string;
  description: string;
  lineup: string;
  venue: string;
  event_date: string;
  start_time: string;
  end_time: string;
  cover_url: string;
  video_url: string;
  ticket_url: string;
  featured: boolean;
  published: boolean;
};

type SpaceRow = {
  id: number;
  kind: "mesa" | "salao";
  code: string;
  name: string;
  zone: string;
  capacity: number;
  min_spend: number;
  description: string;
  available: boolean;
};

type MediaRow = {
  id: number;
  kind: "photo" | "video";
  url: string;
  title: string;
  event_id: number | null;
  created_at: string;
};

function mapEvent(row: EventRow): EventItem {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    lineup: row.lineup,
    venue: row.venue,
    eventDate: row.event_date,
    startTime: row.start_time,
    endTime: row.end_time,
    coverUrl: row.cover_url,
    videoUrl: row.video_url,
    ticketUrl: row.ticket_url,
    featured: row.featured,
    published: row.published,
  };
}

function mapSpace(row: SpaceRow): SpaceItem {
  return {
    id: row.id,
    kind: row.kind,
    code: row.code,
    name: row.name,
    zone: row.zone,
    capacity: row.capacity,
    minSpend: row.min_spend,
    description: row.description,
    available: row.available,
  };
}

function mapMedia(row: MediaRow): MediaItem {
  return {
    id: row.id,
    kind: row.kind,
    url: row.url,
    title: row.title,
    eventId: row.event_id,
    createdAt: String(row.created_at),
  };
}

export const getPublicCatalog = createServerFn({ method: "GET" }).handler(
  async () => {
    const sql = await getSql();
    const events = await sql<EventRow>`
      select id, title, slug, description, lineup, venue, event_date, start_time,
             end_time, cover_url, video_url, ticket_url, featured, published
      from events
      where published = true
      order by event_date asc, start_time asc
    `;
    const spaces = await sql<SpaceRow>`
      select id, kind, code, name, zone, capacity, min_spend, description, available
      from spaces
      order by sort_order asc
    `;
    const media = await sql<MediaRow>`
      select id, kind, url, title, event_id, created_at
      from media
      order by created_at desc
    `;

    const mapped = events.map(mapEvent);
    const today = todayIso();
    const upcoming = mapped.filter((e) => e.eventDate >= today);
    const nextEvent = upcoming.find((e) => e.featured) ?? upcoming[0] ?? null;

    return {
      events: mapped,
      upcoming,
      nextEvent,
      spaces: spaces.map(mapSpace),
      media: media.map(mapMedia),
    };
  },
);

export const getEventBySlug = createServerFn({ method: "GET" })
  .validator(z.object({ slug: z.string().min(1) }))
  .handler(async ({ data }) => {
    const sql = await getSql();
    const rows = await sql<EventRow>`
      select id, title, slug, description, lineup, venue, event_date, start_time,
             end_time, cover_url, video_url, ticket_url, featured, published
      from events
      where slug = ${data.slug} and published = true
      limit 1
    `;
    return rows[0] ? mapEvent(rows[0]) : null;
  });

export const getOccupancy = createServerFn({ method: "GET" })
  .validator(z.object({ date: z.string().min(8) }))
  .handler(async ({ data }) => {
    const sql = await getSql();
    const rows = await sql<{ space_id: number; status: Occupancy["status"] }>`
      select space_id, status
      from reservations
      where reserved_for = ${data.date}::date
        and status in ('pending', 'confirmed')
    `;
    return rows.map((r) => ({ spaceId: r.space_id, status: r.status }) satisfies Occupancy);
  });

const reservationInput = z.object({
  spaceId: z.number().int().positive(),
  guestName: z.string().trim().min(2).max(80),
  guestEmail: z.email(),
  guestPhone: z.string().trim().min(8).max(30),
  partySize: z.number().int().min(1).max(200),
  reservedFor: z.string().min(8),
  notes: z.string().trim().max(400).optional().default(""),
});

export const createReservation = createServerFn({ method: "POST" })
  .validator(reservationInput)
  .handler(async ({ data }) => {
    const sql = await getSql();
    const today = todayIso();
    if (data.reservedFor < today) {
      throw new Error("Essa data já passou.");
    }

    const spaceRows = await sql<SpaceRow>`
      select id, kind, code, name, zone, capacity, min_spend, description, available
      from spaces where id = ${data.spaceId} limit 1
    `;
    const space = spaceRows[0];
    if (!space || !space.available) {
      throw new Error("Esse espaço não está disponível.");
    }
    if (data.partySize > space.capacity) {
      throw new Error(`Capacidade máxima: ${space.capacity} pessoas.`);
    }

    const taken = await sql<{ n: number }>`
      select count(*)::int as n from reservations
      where space_id = ${data.spaceId}
        and reserved_for = ${data.reservedFor}::date
        and status in ('pending', 'confirmed')
    `;
    if ((taken[0]?.n ?? 0) > 0) {
      throw new Error("Esse espaço já está reservado nessa data.");
    }

    const inserted = await sql<{ id: number }>`
      insert into reservations (
        space_id, guest_name, guest_email, guest_phone, party_size, reserved_for, notes
      ) values (
        ${data.spaceId}, ${data.guestName}, ${data.guestEmail}, ${data.guestPhone},
        ${data.partySize}, ${data.reservedFor}::date, ${data.notes ?? ""}
      )
      returning id
    `;

    return {
      id: inserted[0].id,
      spaceName: space.name,
      spaceCode: space.code,
    };
  });

export const getOccupiedHallDates = createServerFn({ method: "GET" }).handler(
  async () => {
    const sql = await getSql();
    const rows = await sql<{ reserved_for: string; code: string }>`
      select r.reserved_for, s.code
      from reservations r
      join spaces s on s.id = r.space_id
      where s.kind = 'salao'
        and r.status in ('pending', 'confirmed')
        and r.reserved_for >= current_date
      order by r.reserved_for
    `;
    return rows.map((r) => ({ date: r.reserved_for, code: r.code }));
  },
);

export type PublicReservationReceipt = {
  id: number;
  spaceName: string;
  spaceCode: string;
};

export type { ReservationItem };
