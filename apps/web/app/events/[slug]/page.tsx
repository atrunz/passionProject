import Link from "next/link";
import { Calendar, MapPin, Ticket, UserRound } from "lucide-react";
import { notFound } from "next/navigation";
import { getPublicEvent } from "@/features/events/api";
import { formatCurrency, formatEventDate } from "@/lib/format";
import { TicketPurchaseButton } from "./ticket-purchase-button";

export const dynamic = "force-dynamic";

type EventPageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    support?: string;
  }>;
};

export default async function EventPage({ params, searchParams }: EventPageProps) {
  const { slug } = await params;
  const { support } = await searchParams;
  const event = await getPublicEvent(slug);

  if (!event) {
    notFound();
  }

  const initialPerformerId =
    event.performers.find((performer) => performer.slug === support || performer.id === support)?.id ?? "";

  return (
    <main className="mx-auto grid min-h-screen w-full max-w-6xl gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[1fr_360px]">
      <section>
        {event.posterUrl ? (
          <img
            src={event.posterUrl}
            alt={`${event.title} poster`}
            className="mb-8 aspect-[16/9] w-full rounded-lg object-cover shadow-sm"
          />
        ) : null}
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
            <UserRound className="mt-0.5 size-5 text-teal-700" />
            <Link
              href={`/organizers/${event.organizerSlug}`}
              className="font-bold text-teal-700 transition hover:text-teal-900"
            >
              {event.organizerName}
            </Link>
          </div>
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
          {event.performers.length > 0 ? (
            <div className="mt-4 rounded-md border border-teal-100 bg-teal-50/60 p-3">
              <p className="text-xs font-black uppercase tracking-wide text-teal-800">Lineup links</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {event.performers.map((performer) => (
                  <Link
                    key={performer.id}
                    href={`/events/${event.slug}?support=${performer.slug}`}
                    className="rounded-full bg-white px-3 py-1 text-xs font-bold text-teal-800 ring-1 ring-teal-100 transition hover:bg-teal-100"
                  >
                    {performer.name}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
          <div className="mt-4 space-y-3">
            {event.ticketTypes.map((ticketType) => {
              const isSoldOut = ticketType.quantityAvailable <= 0;
              const isOnSale = ticketType.salesStatus === "ON_SALE";
              const unavailableLabel = isSoldOut
                ? "Sold out"
                : ticketType.salesStatus === "NOT_STARTED"
                  ? "Not on sale yet"
                  : "Sales ended";
              const salesStatusLabel = isSoldOut
                ? "Sold out"
                : ticketType.salesStatus === "NOT_STARTED" && ticketType.salesStartAt
                  ? `Sales open ${formatEventDate(ticketType.salesStartAt)}`
                  : ticketType.salesStatus === "ENDED"
                    ? "Sales ended"
                    : `${ticketType.quantityAvailable} available`;

              return (
                <div
                  key={ticketType.id}
                  className="rounded-md border border-zinc-200 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-black text-zinc-950">{ticketType.name}</h3>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                        {salesStatusLabel}
                      </p>
                    </div>
                    <span className="text-sm font-black text-zinc-950">
                      {formatCurrency(ticketType.priceCents)}
                    </span>
                  </div>
                  <TicketPurchaseButton
                    ticketTypeId={ticketType.id}
                    priceCents={ticketType.priceCents}
                    available={ticketType.quantityAvailable}
                    disabled={isSoldOut || !isOnSale}
                    disabledLabel={unavailableLabel}
                    performers={event.performers}
                    initialPerformerId={initialPerformerId}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </aside>
    </main>
  );
}
