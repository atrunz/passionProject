import Link from "next/link";
import { EventCard } from "@/components/event-card";
import { getPublicEvents } from "@/features/events/api";

export default async function HomePage() {
  const events = await getPublicEvents();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-6 sm:px-8">
      <header className="flex items-center justify-between border-b border-zinc-200 pb-5">
        <Link href="/" className="text-xl font-black tracking-tight">
          LocalShow
        </Link>
        <nav className="flex items-center gap-3 text-sm font-medium text-zinc-700">
          <Link href="/events">Events</Link>
          <Link href="/tickets">Tickets</Link>
          <Link
            href="/dashboard"
            className="rounded-md bg-zinc-900 px-3 py-2 text-white transition hover:bg-zinc-700"
          >
            Organizer
          </Link>
        </nav>
      </header>

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
          <Link href="/events" className="text-sm font-semibold text-teal-700">
            View all
          </Link>
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
