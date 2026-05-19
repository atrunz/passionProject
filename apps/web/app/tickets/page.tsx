import Link from "next/link";
import { Calendar, MapPin, Ticket } from "lucide-react";
import { listMyTickets } from "@/features/tickets/api";
import { formatCurrency, formatEventDate } from "@/lib/format";
import { TicketQrCode } from "./ticket-qr-code";

export default async function TicketsPage() {
  const tickets = await listMyTickets();

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8">
      <div className="border-b border-zinc-200 pb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">Fan</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight text-zinc-950">My tickets</h1>
      </div>

      {tickets.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed border-zinc-300 bg-white p-8">
          <h2 className="text-xl font-black tracking-tight">No tickets yet</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            Reserve a ticket from an event page and it will appear here.
          </p>
          <Link href="/events" className="mt-5 inline-flex rounded-md bg-zinc-950 px-4 py-3 text-sm font-bold text-white">
            Browse events
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {tickets.map((ticket) => (
            <article key={ticket.id} className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-teal-700">
                    {ticket.status}
                  </p>
                  <h2 className="mt-2 text-2xl font-black tracking-tight text-zinc-950">
                    {ticket.event.title}
                  </h2>
                  <p className="mt-1 text-sm font-semibold text-zinc-600">
                    {ticket.ticketType.name} · {formatCurrency(ticket.ticketType.priceCents)}
                  </p>
                </div>
                <Ticket className="size-6 text-teal-700" />
              </div>
              <div className="mt-5 space-y-2 text-sm text-zinc-600">
                <div className="flex items-center gap-2">
                  <Calendar className="size-4 text-teal-700" />
                  <span>{formatEventDate(ticket.event.startsAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="size-4 text-teal-700" />
                  <span>
                    {ticket.event.venue.name}, {ticket.event.venue.city}, {ticket.event.venue.state}
                  </span>
                </div>
              </div>
              <div className="mt-5 rounded-md border border-dashed border-zinc-300 bg-zinc-50 p-4 text-center">
                <TicketQrCode code={ticket.code} />
                <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">Ticket code</p>
                <p className="mt-2 font-mono text-lg font-black tracking-wide text-zinc-950">
                  {ticket.code}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
