import { EventCard } from "@/components/event-card";
import { getPublicEvents } from "@/features/events/api";

export default async function HomePage() {
  const events = await getPublicEvents();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-6 sm:px-8">
      <section className="grid gap-8 py-12 lg:grid-cols-[1fr_360px] lg:items-end">
        <div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">
            Local-first ticketing
          </p>
          <h1 className="max-w-3xl text-5xl font-black leading-[0.95] tracking-tight text-zinc-950 sm:text-7xl">
            Shows should be easy to find and easier to run.
          </h1>
        </div>
        <p className="max-w-md text-lg leading-8 text-zinc-700">
          LocalShow helps small venues, DIY organizers, and bands publish events, sell tickets, and
          check fans in without heavyweight ticketing software.
        </p>
      </section>

      <section className="pb-12">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Upcoming shows</h2>
            <p className="mt-1 text-sm text-zinc-600">Seeded from the API while the product grows.</p>
          </div>
          <a href="/events" className="text-sm font-semibold text-teal-700">
            View all
          </a>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </section>
    </main>
  );
}
