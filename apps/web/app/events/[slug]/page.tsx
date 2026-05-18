import { Calendar, MapPin, Ticket } from "lucide-react";
import { notFound } from "next/navigation";
import { getPublicEvent } from "@/features/events/api";
import { formatCurrency, formatEventDate } from "@/lib/format";

type EventPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function EventPage({ params }: EventPageProps) {
  const { slug } = await params;
  const event = await getPublicEvent(slug);

  if (!event) {
    notFound();
  }

  return (
    <main className="mx-auto grid min-h-screen w-full max-w-6xl gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[1fr_360px]">
      <section>
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">
          {event.genre.replace("_", " ")}
        </p>
        <h1 className="text-5xl font-black leading-none tracking-tight text-zinc-950">
          {event.title}
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-700">{event.description}</p>
      </section>

      <aside className="h-fit rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="space-y-4 text-sm text-zinc-700">
          <div className="flex gap-3">
            <Calendar className="mt-0.5 size-5 text-teal-700" />
            <span>{formatEventDate(event.startsAt)}</span>
          </div>
          <div className="flex gap-3">
            <MapPin className="mt-0.5 size-5 text-teal-700" />
            <span>
              {event.venueName}, {event.city}, {event.state}
            </span>
          </div>
          <div className="flex gap-3">
            <Ticket className="mt-0.5 size-5 text-teal-700" />
            <span>From {formatCurrency(event.minPriceCents)}</span>
          </div>
        </div>
        <button className="mt-6 w-full rounded-md bg-zinc-950 px-4 py-3 text-sm font-bold text-white">
          Tickets coming next
        </button>
      </aside>
    </main>
  );
}
