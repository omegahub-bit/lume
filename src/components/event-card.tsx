import { Link } from "@tanstack/react-router";
import { formatEventDate, formatWeekday } from "@/lib/format";
import type { EventItem } from "@/lib/types";
import { VENUE_LABEL } from "@/lib/types";

export function EventCard({ event }: { event: EventItem }) {
  return (
    <Link
      to="/eventos/$slug"
      params={{ slug: event.slug }}
      className="group block"
    >
      <article className="overflow-hidden rounded-xl bg-surface">
        <div className="relative aspect-poster overflow-hidden">
          <img
            src={event.coverUrl || "/images/hero.jpg"}
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
          <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-bg/90 to-transparent p-4">
            <p className="kicker text-accent">
              {event.featured ? "Em destaque" : formatWeekday(event.eventDate)}
            </p>
            <h3 className="mt-1 font-display text-3xl text-fg">{event.title}</h3>
          </div>
        </div>
        <div className="flex items-start justify-between gap-3 p-4">
          <div>
            <p className="text-sm text-fg">{formatEventDate(event.eventDate, event.startTime)}</p>
            <p className="mt-1 text-sm text-muted">{event.lineup}</p>
          </div>
          <p className="kicker shrink-0 pt-1">{VENUE_LABEL[event.venue] ?? event.venue}</p>
        </div>
      </article>
    </Link>
  );
}
