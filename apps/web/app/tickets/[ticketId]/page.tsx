import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, CheckCircle2, Clock, MapPin, Ticket, XCircle } from "lucide-react";
import { getMyTicket } from "@/features/tickets/api";
import { formatCurrency, formatEventDate } from "@/lib/format";
import { getServerAuthToken } from "@/lib/server-auth-token";
import { TicketQrCode } from "../ticket-qr-code";
import { TicketTransferForm } from "./ticket-transfer-form";

export const dynamic = "force-dynamic";

type TicketDetailPageProps = {
  params: Promise<{
    ticketId: string;
  }>;
};

const statusMeta = {
  ACTIVE: {
    label: "Ready for entry",
    className: "border-emerald-200 bg-emerald-50 text-emerald-800",
    Icon: CheckCircle2
  },
  CHECKED_IN: {
    label: "Already checked in",
    className: "border-amber-200 bg-amber-50 text-amber-800",
    Icon: Clock
  },
  VOID: {
    label: "Void ticket",
    className: "border-red-200 bg-red-50 text-red-800",
    Icon: XCircle
  }
} as const;

export default async function TicketDetailPage({ params }: TicketDetailPageProps) {
  const { ticketId } = await params;
  const authToken = await getServerAuthToken();

  try {
    const ticket = await getMyTicket(ticketId, authToken);
    const status = statusMeta[ticket.status];
    const StatusIcon = status.Icon;

    return (
      <main className="mx-auto w-full max-w-5xl px-5 py-8 sm:px-8">
        <Link href="/tickets" className="inline-flex items-center gap-2 text-sm font-bold text-zinc-600 hover:text-zinc-950">
          <ArrowLeft className="size-4" />
          Back to tickets
        </Link>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">Ticket</p>
                <h1 className="mt-2 text-4xl font-black tracking-tight text-zinc-950">{ticket.event.title}</h1>
                <p className="mt-2 text-base font-semibold text-zinc-600">
                  {ticket.ticketType.name} · {formatCurrency(ticket.ticketType.priceCents)}
                </p>
              </div>
              <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-black uppercase tracking-wide ${status.className}`}>
                <StatusIcon className="size-4" />
                {status.label}
              </span>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-md border border-zinc-200 bg-zinc-50 p-4">
                <div className="flex items-center gap-2 text-sm font-bold text-zinc-700">
                  <Calendar className="size-4 text-teal-700" />
                  Date and time
                </div>
                <p className="mt-2 text-lg font-black text-zinc-950">{formatEventDate(ticket.event.startsAt)}</p>
              </div>
              <div className="rounded-md border border-zinc-200 bg-zinc-50 p-4">
                <div className="flex items-center gap-2 text-sm font-bold text-zinc-700">
                  <MapPin className="size-4 text-teal-700" />
                  Location
                </div>
                <p className="mt-2 text-lg font-black text-zinc-950">{ticket.event.venue.name}</p>
                <p className="mt-1 text-sm font-semibold text-zinc-600">
                  {ticket.event.venue.city}, {ticket.event.venue.state}
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-md border border-zinc-200 p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-zinc-700">
                <Ticket className="size-4 text-teal-700" />
                Order details
              </div>
              <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
                <div>
                  <dt className="font-bold uppercase tracking-wide text-zinc-500">Ticket code</dt>
                  <dd className="mt-1 font-mono font-black text-zinc-950">{ticket.code}</dd>
                </div>
                <div>
                  <dt className="font-bold uppercase tracking-wide text-zinc-500">Status</dt>
                  <dd className="mt-1 font-black text-zinc-950">{ticket.status.replace("_", " ")}</dd>
                </div>
                <div>
                  <dt className="font-bold uppercase tracking-wide text-zinc-500">Total paid</dt>
                  <dd className="mt-1 font-black text-zinc-950">
                    {formatCurrency(ticket.order?.totalCents ?? ticket.ticketType.priceCents)}
                  </dd>
                </div>
              </dl>
            </div>
          </section>

          <aside className="rounded-lg border border-zinc-200 bg-white p-6 text-center shadow-sm">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-zinc-500">Door scan</p>
            <div className="mt-5">
              <TicketQrCode code={ticket.code} size={288} />
            </div>
            <p className="mt-5 text-xs font-bold uppercase tracking-wide text-zinc-500">Ticket code</p>
            <p className="mt-2 break-all font-mono text-xl font-black tracking-wide text-zinc-950">{ticket.code}</p>
          </aside>
        </div>

        <TicketTransferForm ticketId={ticket.id} disabled={ticket.status !== "ACTIVE"} />
      </main>
    );
  } catch {
    notFound();
  }
}
