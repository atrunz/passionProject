import Link from "next/link";
import { Calendar, MapPin, UserRound } from "lucide-react";
import type { PublicEvent } from "@localshow/shared";
import { formatCurrency, formatEventDate } from "@/lib/format";

type EventCardProps = {
  event: PublicEvent;
};

export function EventCard({ event }: EventCardProps) {
  return (
    <Link
      href={`/events/${event.slug}`}
      className="group flex min-h-72 flex-col justify-between rounded-lg border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md"
    >
      <div>
        {event.posterUrl ? (
          <img
            src={event.posterUrl}
            alt={`${event.title} poster`}
            className="mb-5 aspect-[4/3] w-full rounded-md object-cover"
          />
        ) : null}
        <div className="mb-5 flex items-center justify-between gap-3">
          <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-teal-800">
            {event.genre.replace("_", " ")}
          </span>
          <span className="text-sm font-semibold text-zinc-500">
            {formatCurrency(event.minPriceCents)}
          </span>
        </div>
        <h3 className="text-2xl font-black leading-tight tracking-tight text-zinc-950">
          {event.title}
        </h3>
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-zinc-600">{event.description}</p>
      </div>
      <div className="mt-6 space-y-2 text-sm text-zinc-600">
        <div className="flex items-center gap-2">
          <UserRound className="size-4 text-teal-700" />
          <span>{event.organizerName}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="size-4 text-teal-700" />
          <span>{formatEventDate(event.startsAt)}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="size-4 text-teal-700" />
          <span>
            {event.venueName}, {event.city}
          </span>
        </div>
      </div>
    </Link>
  );
}
