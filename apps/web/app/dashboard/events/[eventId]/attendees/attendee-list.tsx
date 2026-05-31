"use client";

import { useMemo, useState } from "react";
import { Ban, CheckCircle2, Circle, RotateCcw, Search, Ticket } from "lucide-react";
import { useApiAuthToken } from "@/components/auth-token-context";
import { updateOrganizerTicketStatus, type OrganizerEventTicket } from "@/features/dashboard/api";
import { formatCurrency, formatEventDate } from "@/lib/format";

type AttendeeListProps = {
  eventId: string;
  tickets: OrganizerEventTicket[];
};

const statusStyles = {
  ACTIVE: "border-emerald-200 bg-emerald-50 text-emerald-800",
  CHECKED_IN: "border-teal-200 bg-teal-50 text-teal-800",
  VOID: "border-red-200 bg-red-50 text-red-800"
} as const;

export function AttendeeList({ eventId, tickets }: AttendeeListProps) {
  const { getToken } = useApiAuthToken();
  const [ticketRows, setTicketRows] = useState(tickets);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"ALL" | OrganizerEventTicket["status"]>("ALL");
  const [pendingTicketId, setPendingTicketId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filteredTickets = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return ticketRows.filter((ticket) => {
      const buyerName = ticket.owner.name ?? "";
      const matchesQuery = normalizedQuery
        ? [buyerName, ticket.owner.email, ticket.code, ticket.ticketType.name]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery)
        : true;
      const matchesStatus = status === "ALL" ? true : ticket.status === status;

      return matchesQuery && matchesStatus;
    });
  }, [query, status, ticketRows]);

  async function changeTicketStatus(ticket: OrganizerEventTicket, nextStatus: "ACTIVE" | "VOID") {
    setError(null);
    setPendingTicketId(ticket.id);

    try {
      const authToken = await getToken();
      const updated = await updateOrganizerTicketStatus(eventId, ticket.id, nextStatus, authToken);
      setTicketRows((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to update ticket");
    } finally {
      setPendingTicketId(null);
    }
  }

  if (ticketRows.length === 0) {
    return (
      <div className="p-8 text-center">
        <Ticket className="mx-auto size-8 text-zinc-400" />
        <h2 className="mt-3 text-xl font-black tracking-tight text-zinc-950">No tickets yet</h2>
        <p className="mt-2 text-sm text-zinc-600">
          Mock purchases and future paid orders will appear here.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid gap-3 border-b border-zinc-200 p-4 md:grid-cols-[1fr_180px]">
        <label className="grid gap-2 text-sm font-semibold text-zinc-800">
          Search attendee
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Name, email, code..."
              className="w-full rounded-md border border-zinc-300 py-2 pl-9 pr-3 font-normal outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            />
          </div>
        </label>
        <label className="grid gap-2 text-sm font-semibold text-zinc-800">
          Status
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as typeof status)}
            className="rounded-md border border-zinc-300 px-3 py-2 font-normal outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
          >
            <option value="ALL">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="CHECKED_IN">Checked in</option>
            <option value="VOID">Void</option>
          </select>
        </label>
      </div>
      {error ? (
        <div className="border-b border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      ) : null}

      {filteredTickets.length === 0 ? (
        <div className="p-8 text-center">
          <h2 className="text-xl font-black tracking-tight text-zinc-950">No matching attendees</h2>
          <p className="mt-2 text-sm text-zinc-600">
            Try a different name, email, ticket code, or status.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-zinc-200">
          {filteredTickets.map((ticket) => {
            const StatusIcon = ticket.status === "CHECKED_IN" ? CheckCircle2 : Circle;
            const buyerName = ticket.owner.name || ticket.owner.email;
            const isPending = pendingTicketId === ticket.id;

            return (
              <article key={ticket.id} className="grid gap-4 p-5 lg:grid-cols-[1.2fr_1fr_auto]">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-black uppercase tracking-wide ${statusStyles[ticket.status]}`}
                    >
                      <StatusIcon className="size-4" />
                      {ticket.status.replace("_", " ")}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wide text-zinc-500">
                      {ticket.ticketType.name}
                    </span>
                  </div>
                  <h2 className="mt-3 text-lg font-black tracking-tight text-zinc-950">{buyerName}</h2>
                  <p className="mt-1 text-sm font-semibold text-zinc-600">{ticket.owner.email}</p>
                  <p className="mt-2 text-xs font-black uppercase tracking-wide text-teal-700">
                    Credit: {ticket.performerAttribution?.name ?? "General sale"}
                  </p>
                </div>
                <div className="text-sm text-zinc-600">
                  <p className="font-mono font-bold text-zinc-950">{ticket.code}</p>
                  <p className="mt-2">Purchased {formatEventDate(ticket.createdAt)}</p>
                  {ticket.checkedInAt ? <p>Checked in {formatEventDate(ticket.checkedInAt)}</p> : null}
                </div>
                <div className="text-left lg:text-right">
                  <p className="text-sm font-black text-zinc-950">
                    {formatCurrency(ticket.ticketType.priceCents)}
                  </p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-wide text-zinc-500">
                    {ticket.order.status}
                  </p>
                  {ticket.status === "ACTIVE" ? (
                    <button
                      type="button"
                      onClick={() => changeTicketStatus(ticket, "VOID")}
                      disabled={isPending}
                      className="mt-3 inline-flex items-center gap-2 rounded-md border border-red-200 px-3 py-2 text-xs font-black text-red-700 transition hover:bg-red-50 disabled:cursor-wait disabled:opacity-60"
                    >
                      <Ban className="size-3.5" />
                      {isPending ? "Updating..." : "Void"}
                    </button>
                  ) : null}
                  {ticket.status === "VOID" ? (
                    <button
                      type="button"
                      onClick={() => changeTicketStatus(ticket, "ACTIVE")}
                      disabled={isPending}
                      className="mt-3 inline-flex items-center gap-2 rounded-md border border-zinc-300 px-3 py-2 text-xs font-black text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-wait disabled:opacity-60"
                    >
                      <RotateCcw className="size-3.5" />
                      {isPending ? "Updating..." : "Reactivate"}
                    </button>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
