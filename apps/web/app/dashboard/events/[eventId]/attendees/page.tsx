import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getOrganizerEvent, listOrganizerEventTickets } from "@/features/dashboard/api";
import { formatCurrency, formatEventDate } from "@/lib/format";
import { getServerAuthToken } from "@/lib/server-auth-token";
import { AttendeeExportButton } from "./attendee-export-button";
import { AttendeeList } from "./attendee-list";

export const dynamic = "force-dynamic";

type AttendeesPageProps = {
  params: Promise<{
    eventId: string;
  }>;
};

export default async function AttendeesPage({ params }: AttendeesPageProps) {
  const { eventId } = await params;
  const authToken = await getServerAuthToken();

  try {
    const [event, tickets] = await Promise.all([
      getOrganizerEvent(eventId, authToken),
      listOrganizerEventTickets(eventId, authToken)
    ]);

    const checkedInCount = tickets.filter((ticket) => ticket.status === "CHECKED_IN").length;
    const grossCents = tickets.reduce((total, ticket) => total + ticket.ticketType.priceCents, 0);

    return (
      <main className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8">
        <Link
          href="/dashboard/events"
          className="inline-flex items-center gap-2 text-sm font-bold text-zinc-600 transition hover:text-zinc-950"
        >
          <ArrowLeft className="size-4" />
          Events
        </Link>

        <div className="mt-5 flex flex-wrap items-end justify-between gap-4 border-b border-zinc-200 pb-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">
              Attendees
            </p>
            <h1 className="mt-2 text-4xl font-black tracking-tight text-zinc-950">{event.title}</h1>
            <p className="mt-2 text-sm font-semibold text-zinc-600">
              {formatEventDate(event.startsAt)} · {event.venue.name}
            </p>
          </div>
          <AttendeeExportButton eventTitle={event.title} tickets={tickets} />
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-wide text-zinc-500">Tickets sold</p>
            <p className="mt-2 text-3xl font-black text-zinc-950">{tickets.length}</p>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-wide text-zinc-500">Checked in</p>
            <p className="mt-2 text-3xl font-black text-zinc-950">{checkedInCount}</p>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-wide text-zinc-500">Ticket value</p>
            <p className="mt-2 text-3xl font-black text-zinc-950">{formatCurrency(grossCents)}</p>
          </div>
        </div>

        <section className="mt-6 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
          <AttendeeList eventId={event.id} tickets={tickets} />
        </section>
      </main>
    );
  } catch {
    notFound();
  }
}
