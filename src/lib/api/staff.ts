import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { slugify, todayIso } from "@/lib/format";
import type {
  EventItem,
  MediaItem,
  ReservationItem,
  StaffMember,
  StaffRequest,
  StaffRole,
} from "@/lib/types";

type StaffRow = {
  user_id: string;
  email: string;
  display_name: string;
  role: StaffRole;
  created_at: string;
};

type UserRow = { email: string | null; name: string | null };

function mapStaff(row: StaffRow): StaffMember {
  return {
    userId: row.user_id,
    email: row.email,
    displayName: row.display_name,
    role: row.role,
    createdAt: String(row.created_at),
  };
}

async function loadAuthUser(userId: string) {
  const sql = await getSql();
  const rows = await sql<UserRow>`
    select email, name from "user" where id = ${userId} limit 1
  `;
  return {
    email: rows[0]?.email ?? "",
    name: rows[0]?.name ?? "",
  };
}

async function requireStaff(userId: string, roles?: StaffRole[]) {
  const sql = await getSql();
  const rows = await sql<StaffRow>`
    select user_id, email, display_name, role, created_at
    from staff where user_id = ${userId} limit 1
  `;
  const staff = rows[0] ? mapStaff(rows[0]) : null;
  if (!staff) {
    const err = new Error("Forbidden");
    err.name = "ForbiddenError";
    throw err;
  }
  if (roles && !roles.includes(staff.role)) {
    const err = new Error("Forbidden");
    err.name = "ForbiddenError";
    throw err;
  }
  return staff;
}

export const getStaffSession = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const identity = await loadAuthUser(context.userId);

    const existing = await sql<StaffRow>`
      select user_id, email, display_name, role, created_at
      from staff where user_id = ${context.userId} limit 1
    `;
    if (existing[0]) {
      return { staff: mapStaff(existing[0]), pending: false as const };
    }

    const count = await sql<{ n: number }>`select count(*)::int as n from staff`;
    if ((count[0]?.n ?? 0) === 0) {
      await sql`
        insert into staff (user_id, email, display_name, role)
        values (
          ${context.userId},
          ${identity.email || "admin@lume.casa"},
          ${identity.name || "Admin LUME"},
          'admin'
        )
      `;
      const created = await sql<StaffRow>`
        select user_id, email, display_name, role, created_at
        from staff where user_id = ${context.userId} limit 1
      `;
      return { staff: mapStaff(created[0]), pending: false as const };
    }

    await sql`
      insert into staff_requests (user_id, email, display_name)
      values (
        ${context.userId},
        ${identity.email || ""},
        ${identity.name || ""}
      )
      on conflict (user_id) do update set
        email = excluded.email,
        display_name = excluded.display_name
    `;
    return { staff: null, pending: true as const };
  });

export const getStaffDashboard = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await requireStaff(context.userId);
    const sql = await getSql();
    const today = todayIso();

    const pending = await sql<{ n: number }>`
      select count(*)::int as n from reservations where status = 'pending'
    `;
    const tonight = await sql<{ n: number }>`
      select count(*)::int as n from reservations
      where reserved_for = ${today}::date and status in ('pending', 'confirmed')
    `;
    const requests = await sql<{ n: number }>`
      select count(*)::int as n from staff_requests
    `;
    const upcoming = await sql<{
      id: number;
      title: string;
      slug: string;
      event_date: string;
      start_time: string;
    }>`
      select id, title, slug, event_date, start_time
      from events
      where published = true and event_date >= ${today}::date
      order by event_date, start_time
      limit 3
    `;

    return {
      pendingReservations: pending[0]?.n ?? 0,
      tonightReservations: tonight[0]?.n ?? 0,
      staffRequests: requests[0]?.n ?? 0,
      upcoming: upcoming.map((e) => ({
        id: e.id,
        title: e.title,
        slug: e.slug,
        eventDate: e.event_date,
        startTime: e.start_time,
      })),
    };
  });

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

export const listAllEvents = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await requireStaff(context.userId);
    const sql = await getSql();
    const rows = await sql<EventRow>`
      select id, title, slug, description, lineup, venue, event_date, start_time,
             end_time, cover_url, video_url, ticket_url, featured, published
      from events
      order by event_date desc
    `;
    return rows.map(mapEvent);
  });

const eventInput = z.object({
  id: z.number().int().optional(),
  title: z.string().trim().min(2).max(80),
  slug: z.string().trim().optional(),
  description: z.string().trim().max(1200).optional().default(""),
  lineup: z.string().trim().max(200).optional().default(""),
  venue: z.string().trim().min(1),
  eventDate: z.string().min(8),
  startTime: z.string().min(4),
  endTime: z.string().min(4),
  coverUrl: z.string().trim().max(500).optional().default(""),
  videoUrl: z.string().trim().max(500).optional().default(""),
  ticketUrl: z.string().trim().max(500).optional().default(""),
  featured: z.boolean().optional().default(false),
  published: z.boolean().optional().default(true),
});

export const saveEvent = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(eventInput)
  .handler(async ({ context, data }) => {
    const staff = await requireStaff(context.userId, ["admin", "supervisor"]);
    const sql = await getSql();
    const slug = slugify(data.slug || data.title) || `evento-${Date.now()}`;

    if (data.featured) {
      await sql`update events set featured = false where featured = true`;
    }

    if (data.id) {
      await sql`
        update events set
          title = ${data.title},
          slug = ${slug},
          description = ${data.description ?? ""},
          lineup = ${data.lineup ?? ""},
          venue = ${data.venue},
          event_date = ${data.eventDate}::date,
          start_time = ${data.startTime},
          end_time = ${data.endTime},
          cover_url = ${data.coverUrl ?? ""},
          video_url = ${data.videoUrl ?? ""},
          ticket_url = ${data.ticketUrl ?? ""},
          featured = ${data.featured ?? false},
          published = ${data.published ?? true}
        where id = ${data.id}
      `;
      return { id: data.id, slug };
    }

    const inserted = await sql<{ id: number }>`
      insert into events (
        title, slug, description, lineup, venue, event_date, start_time, end_time,
        cover_url, video_url, ticket_url, featured, published, created_by
      ) values (
        ${data.title}, ${slug}, ${data.description ?? ""}, ${data.lineup ?? ""},
        ${data.venue}, ${data.eventDate}::date, ${data.startTime}, ${data.endTime},
        ${data.coverUrl ?? ""}, ${data.videoUrl ?? ""}, ${data.ticketUrl ?? ""},
        ${data.featured ?? false}, ${data.published ?? true}, ${staff.userId}
      )
      returning id
    `;
    return { id: inserted[0].id, slug };
  });

export const deleteEvent = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ id: z.number().int() }))
  .handler(async ({ context, data }) => {
    await requireStaff(context.userId, ["admin", "supervisor"]);
    const sql = await getSql();
    await sql`delete from events where id = ${data.id}`;
    return { ok: true };
  });

export const listAllMedia = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await requireStaff(context.userId);
    const sql = await getSql();
    const rows = await sql<{
      id: number;
      kind: "photo" | "video";
      url: string;
      title: string;
      event_id: number | null;
      created_at: string;
    }>`
      select id, kind, url, title, event_id, created_at
      from media
      order by created_at desc
    `;
    return rows.map(
      (r) =>
        ({
          id: r.id,
          kind: r.kind,
          url: r.url,
          title: r.title,
          eventId: r.event_id,
          createdAt: String(r.created_at),
        }) satisfies MediaItem,
    );
  });

export const addMedia = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      kind: z.enum(["photo", "video"]),
      url: z.string().trim().min(3).max(600),
      title: z.string().trim().max(80).optional().default(""),
    }),
  )
  .handler(async ({ context, data }) => {
    await requireStaff(context.userId);
    const sql = await getSql();
    const inserted = await sql<{ id: number }>`
      insert into media (kind, url, title, created_by)
      values (${data.kind}, ${data.url}, ${data.title ?? ""}, ${context.userId})
      returning id
    `;
    return { id: inserted[0].id };
  });

export const deleteMedia = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ id: z.number().int() }))
  .handler(async ({ context, data }) => {
    await requireStaff(context.userId, ["admin", "supervisor"]);
    const sql = await getSql();
    await sql`delete from media where id = ${data.id}`;
    return { ok: true };
  });

type ReservationRow = {
  id: number;
  space_id: number;
  space_name: string;
  space_code: string;
  space_kind: "mesa" | "salao";
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  party_size: number;
  reserved_for: string;
  status: ReservationItem["status"];
  notes: string;
  created_at: string;
};

function mapReservation(row: ReservationRow): ReservationItem {
  return {
    id: row.id,
    spaceId: row.space_id,
    spaceName: row.space_name,
    spaceCode: row.space_code,
    spaceKind: row.space_kind,
    guestName: row.guest_name,
    guestEmail: row.guest_email,
    guestPhone: row.guest_phone,
    partySize: row.party_size,
    reservedFor: row.reserved_for,
    status: row.status,
    notes: row.notes,
    createdAt: String(row.created_at),
  };
}

export const listReservations = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await requireStaff(context.userId);
    const sql = await getSql();
    const rows = await sql<ReservationRow>`
      select r.id, r.space_id, s.name as space_name, s.code as space_code,
             s.kind as space_kind, r.guest_name, r.guest_email, r.guest_phone,
             r.party_size, r.reserved_for, r.status, r.notes, r.created_at
      from reservations r
      join spaces s on s.id = r.space_id
      order by r.reserved_for asc, r.created_at desc
    `;
    return rows.map(mapReservation);
  });

export const setReservationStatus = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      id: z.number().int(),
      status: z.enum(["pending", "confirmed", "declined", "cancelled"]),
    }),
  )
  .handler(async ({ context, data }) => {
    await requireStaff(context.userId);
    const sql = await getSql();
    await sql`
      update reservations set status = ${data.status} where id = ${data.id}
    `;
    return { ok: true };
  });

export const listTeam = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await requireStaff(context.userId, ["admin"]);
    const sql = await getSql();
    const members = await sql<StaffRow>`
      select user_id, email, display_name, role, created_at
      from staff order by created_at asc
    `;
    const requests = await sql<{
      user_id: string;
      email: string;
      display_name: string;
      created_at: string;
    }>`
      select user_id, email, display_name, created_at
      from staff_requests order by created_at asc
    `;
    return {
      members: members.map(mapStaff),
      requests: requests.map(
        (r) =>
          ({
            userId: r.user_id,
            email: r.email,
            displayName: r.display_name,
            createdAt: String(r.created_at),
          }) satisfies StaffRequest,
      ),
    };
  });

export const approveStaff = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      userId: z.string().min(1),
      role: z.enum(["admin", "supervisor", "collaborator"]),
    }),
  )
  .handler(async ({ context, data }) => {
    await requireStaff(context.userId, ["admin"]);
    const sql = await getSql();
    const req = await sql<{
      user_id: string;
      email: string;
      display_name: string;
    }>`
      select user_id, email, display_name from staff_requests
      where user_id = ${data.userId} limit 1
    `;
    const row = req[0];
    if (!row) throw new Error("Pedido não encontrado.");
    await sql`
      insert into staff (user_id, email, display_name, role)
      values (${row.user_id}, ${row.email}, ${row.display_name}, ${data.role})
      on conflict (user_id) do update set role = excluded.role
    `;
    await sql`delete from staff_requests where user_id = ${data.userId}`;
    return { ok: true };
  });

export const setStaffRole = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      userId: z.string().min(1),
      role: z.enum(["admin", "supervisor", "collaborator"]),
    }),
  )
  .handler(async ({ context, data }) => {
    await requireStaff(context.userId, ["admin"]);
    if (data.userId === context.userId) {
      throw new Error("Você não pode alterar o próprio cargo.");
    }
    const sql = await getSql();
    await sql`
      update staff set role = ${data.role} where user_id = ${data.userId}
    `;
    return { ok: true };
  });

export const declineStaffRequest = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ userId: z.string().min(1) }))
  .handler(async ({ context, data }) => {
    await requireStaff(context.userId, ["admin"]);
    const sql = await getSql();
    await sql`delete from staff_requests where user_id = ${data.userId}`;
    return { ok: true };
  });
