import { EventCard } from "@/components/event-card";
import { getPublicEvents } from "@/features/events/api";

export default async function EventsPage() {
  const events = await getPublicEvents();

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">Discover</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight text-zinc-950">Upcoming events</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </main>
  );
}
