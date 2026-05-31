import Link from "next/link";
import { ArrowLeft, CalendarDays, MapPin, Ticket } from "lucide-react";
import { notFound } from "next/navigation";
import { EventCard } from "@/components/event-card";
import { getPublicOrganizer } from "@/features/events/api";

export const dynamic = "force-dynamic";

type OrganizerPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function OrganizerPage({ params }: OrganizerPageProps) {
  const { slug } = await params;
  const organizer = await getPublicOrganizer(slug);

  if (!organizer) {
    notFound();
  }

  const cities = Array.from(
    new Set(organizer.upcomingEvents.map((event) => `${event.city}, ${event.state}`))
  );
  const ticketCount = organizer.upcomingEvents.reduce(
    (total, event) =>
      total + event.ticketTypes.reduce((eventTotal, ticketType) => eventTotal + ticketType.quantityAvailable, 0),
    0
  );

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8">
      <Link
        href="/events"
        className="inline-flex items-center gap-2 text-sm font-bold text-zinc-600 transition hover:text-zinc-950"
      >
        <ArrowLeft className="size-4" />
        Events
      </Link>

      <section className="mt-6 border-b border-zinc-200 pb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">
          Organizer
        </p>
        <div className="mt-3 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div>
            <h1 className="text-5xl font-black leading-none tracking-tight text-zinc-950">
              {organizer.name}
            </h1>
            <p className="mt-4 text-sm font-bold text-zinc-500">@{organizer.slug}</p>
            {organizer.description ? (
              <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-700">
                {organizer.description}
              </p>
            ) : null}
          </div>

          <div className="grid gap-3 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3 text-sm text-zinc-700">
              <CalendarDays className="size-5 text-teal-700" />
              <span>
                {organizer.eventCount} upcoming event{organizer.eventCount === 1 ? "" : "s"}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm text-zinc-700">
              <MapPin className="size-5 text-teal-700" />
              <span>{cities.length ? cities.join(" · ") : "No active cities yet"}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-zinc-700">
              <Ticket className="size-5 text-teal-700" />
              <span>
                {ticketCount} available ticket{ticketCount === 1 ? "" : "s"}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">
              Shows
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-zinc-950">
              Upcoming events
            </h2>
          </div>
          <Link
            href={`/events?city=${encodeURIComponent(organizer.upcomingEvents[0]?.city ?? "")}`}
            className="text-sm font-bold text-teal-700 transition hover:text-teal-900"
          >
            Browse nearby
          </Link>
        </div>

        {organizer.upcomingEvents.length === 0 ? (
          <div className="mt-5 rounded-lg border border-dashed border-zinc-300 bg-white p-8">
            <h3 className="text-xl font-black tracking-tight text-zinc-950">
              No published events yet
            </h3>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              Published events from this organizer will appear here.
            </p>
          </div>
        ) : (
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {organizer.upcomingEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
