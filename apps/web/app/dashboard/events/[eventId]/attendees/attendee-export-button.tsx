"use client";

import { Download } from "lucide-react";
import type { OrganizerEventTicket } from "@/features/dashboard/api";

type AttendeeExportButtonProps = {
  eventTitle: string;
  tickets: OrganizerEventTicket[];
};

const columns = [
  "Buyer name",
  "Buyer email",
  "Ticket code",
  "Ticket type",
  "Attributed act",
  "Ticket status",
  "Order status",
  "Price cents",
  "Purchased at",
  "Checked in at"
];

function csvEscape(value: string | number | null | undefined) {
  const text = value === null || value === undefined ? "" : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function AttendeeExportButton({ eventTitle, tickets }: AttendeeExportButtonProps) {
  function exportCsv() {
    const rows = tickets.map((ticket) => [
      ticket.owner.name ?? "",
      ticket.owner.email,
      ticket.code,
      ticket.ticketType.name,
      ticket.performerAttribution?.name ?? "General sale",
      ticket.status,
      ticket.order.status,
      ticket.ticketType.priceCents,
      ticket.createdAt,
      ticket.checkedInAt ?? ""
    ]);
    const csv = [columns, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = `${slugify(eventTitle) || "event"}-attendees.csv`;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={exportCsv}
      disabled={tickets.length === 0}
      className="inline-flex items-center gap-2 rounded-md border border-zinc-300 bg-white px-4 py-3 text-sm font-bold text-zinc-800 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Download className="size-4" />
      Export CSV
    </button>
  );
}
