import { Calendar, MapPin, Ticket } from "lucide-react";
import { notFound } from "next/navigation";
import { getPublicEvent } from "@/features/events/api";
import { formatCurrency, formatEventDate } from "@/lib/format";
import { TicketPurchaseButton } from "./ticket-purchase-button";

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
        <div className="mt-6 border-t border-zinc-200 pt-5">
          <h2 className="text-lg font-black tracking-tight text-zinc-950">Tickets</h2>
          <div className="mt-4 space-y-3">
            {event.ticketTypes.map((ticketType) => {
              const isSoldOut = ticketType.quantityAvailable <= 0;

              return (
                <div
                  key={ticketType.id}
                  className="rounded-md border border-zinc-200 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-black text-zinc-950">{ticketType.name}</h3>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                        {isSoldOut ? "Sold out" : `${ticketType.quantityAvailable} available`}
                      </p>
                    </div>
                    <span className="text-sm font-black text-zinc-950">
                      {formatCurrency(ticketType.priceCents)}
                    </span>
                  </div>
                  <TicketPurchaseButton ticketTypeId={ticketType.id} disabled={isSoldOut} />
                </div>
              );
            })}
          </div>
        </div>
      </aside>
    </main>
  );
}
