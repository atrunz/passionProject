import Link from "next/link";
import { Calendar, MapPin, Plus, Ticket } from "lucide-react";
import { listOrganizerEvents } from "@/features/dashboard/api";
import { formatCurrency, formatEventDate } from "@/lib/format";

export default async function DashboardEventsPage() {
  const events = await listOrganizerEvents();

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 pb-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">
            Organizer
          </p>
          <h1 className="mt-2 text-4xl font-black tracking-tight text-zinc-950">Events</h1>
        </div>
        <Link
          href="/dashboard/events/new"
          className="inline-flex items-center gap-2 rounded-md bg-zinc-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-zinc-700"
        >
          <Plus className="size-4" />
          New event
        </Link>
      </div>

      <div className="mt-6 grid gap-4">
        {events.map((event) => {
          const minPrice = event.ticketTypes[0]?.priceCents ?? 0;

          return (
            <article key={event.id} className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-teal-800">
                      {event.status}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wide text-zinc-500">
                      {event.genre.replace("_", " ")}
                    </span>
                  </div>
                  <h2 className="mt-3 text-2xl font-black tracking-tight text-zinc-950">
                    {event.title}
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
                    {event.description}
                  </p>
                </div>
                <Link
                  href={`/events/${event.slug}`}
                  className="text-sm font-bold text-teal-700 hover:text-teal-900"
                >
                  View public page
                </Link>
              </div>
              <div className="mt-5 grid gap-3 text-sm text-zinc-600 sm:grid-cols-3">
                <div className="flex items-center gap-2">
                  <Calendar className="size-4 text-teal-700" />
                  <span>{formatEventDate(event.startsAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="size-4 text-teal-700" />
                  <span>
                    {event.venue.name}, {event.venue.city}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Ticket className="size-4 text-teal-700" />
                  <span>
                    {event.ticketTypes.length} type{event.ticketTypes.length === 1 ? "" : "s"} from{" "}
                    {formatCurrency(minPrice)}
                  </span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
}
