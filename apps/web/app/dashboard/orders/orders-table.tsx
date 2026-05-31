"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Download, ReceiptText, Search } from "lucide-react";
import type { OrganizerOrder } from "@/features/dashboard/api";
import { formatCurrency, formatEventDate } from "@/lib/format";

type OrdersTableProps = {
  orders: OrganizerOrder[];
};

const columns = [
  "Order id",
  "Customer name",
  "Customer email",
  "Event",
  "Ticket count",
  "Ticket types",
  "Attributed act",
  "Payment provider",
  "Payment reference",
  "Total cents",
  "Status",
  "Placed at"
];

function getStatusClass(status: string) {
  if (status === "PAID") {
    return "bg-teal-50 text-teal-800";
  }

  if (status === "REFUNDED") {
    return "bg-amber-50 text-amber-800";
  }

  if (status === "CANCELED") {
    return "bg-red-50 text-red-700";
  }

  return "bg-zinc-100 text-zinc-700";
}

function csvEscape(value: string | number | null | undefined) {
  const text = value === null || value === undefined ? "" : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

function getTicketSummary(order: OrganizerOrder) {
  return order.items.map((item) => `${item.quantity}x ${item.ticketType.name}`).join("; ");
}

export function OrdersTable({ orders }: OrdersTableProps) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"ALL" | OrganizerOrder["status"]>("ALL");

  const filteredOrders = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesQuery = normalizedQuery
        ? [
            order.id,
            order.user.name ?? "",
            order.user.email,
            order.event.title,
            order.paymentProvider ?? "",
            order.paymentReference ?? "",
            getTicketSummary(order)
          ]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery)
        : true;
      const matchesStatus = status === "ALL" ? true : order.status === status;

      return matchesQuery && matchesStatus;
    });
  }, [orders, query, status]);

  function exportCsv() {
    const rows = filteredOrders.map((order) => [
      order.id,
      order.user.name ?? "",
      order.user.email,
      order.event.title,
      order.tickets.length,
      getTicketSummary(order),
      order.performerAttribution?.name ?? "General sale",
      order.paymentProvider ?? "",
      order.paymentReference ?? "",
      order.totalCents,
      order.status,
      order.createdAt
    ]);
    const csv = [columns, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = "localshow-orders.csv";
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  if (orders.length === 0) {
    return (
      <div className="p-8 text-center">
        <ReceiptText className="mx-auto size-8 text-zinc-400" />
        <h2 className="mt-3 text-xl font-black tracking-tight text-zinc-950">No orders yet</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-600">
          Mock purchases and future Stripe orders will appear here once fans reserve tickets.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid gap-3 border-b border-zinc-200 p-4 lg:grid-cols-[1fr_180px_auto]">
        <label className="grid gap-2 text-sm font-semibold text-zinc-800">
          Search orders
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Customer, event, payment reference..."
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
            <option value="PAID">Paid</option>
            <option value="PENDING">Pending</option>
            <option value="REFUNDED">Refunded</option>
            <option value="CANCELED">Canceled</option>
          </select>
        </label>
        <button
          type="button"
          onClick={exportCsv}
          disabled={filteredOrders.length === 0}
          className="inline-flex items-center justify-center gap-2 self-end rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-bold text-zinc-800 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download className="size-4" />
          Export CSV
        </button>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="p-8 text-center">
          <h2 className="text-xl font-black tracking-tight text-zinc-950">No matching orders</h2>
          <p className="mt-2 text-sm text-zinc-600">
            Try a different customer, event, payment reference, or status.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 text-xs font-black uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Event</th>
                <th className="px-4 py-3">Tickets</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Placed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="align-top">
                  <td className="px-4 py-4">
                    <Link
                      href={`/dashboard/orders/${order.id}`}
                      className="font-black text-zinc-950 hover:text-teal-700"
                    >
                      {order.user.name ?? "Fan"}
                    </Link>
                    <p className="mt-1 text-xs font-semibold text-zinc-500">{order.user.email}</p>
                  </td>
                  <td className="px-4 py-4">
                    <Link
                      href={`/events/${order.event.slug}`}
                      className="font-black text-teal-700 hover:text-teal-900"
                    >
                      {order.event.title}
                    </Link>
                    <p className="mt-1 text-xs font-semibold text-zinc-500">
                      {formatEventDate(order.event.startsAt)}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <div className="space-y-1">
                      {order.items.map((item) => (
                        <p key={item.id} className="text-zinc-700">
                          <span className="font-bold text-zinc-950">{item.quantity}x</span>{" "}
                          {item.ticketType.name}
                        </p>
                      ))}
                    </div>
                    <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                      {order.tickets.length} issued
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-bold text-zinc-950">{order.paymentProvider ?? "manual"}</p>
                    <p className="mt-1 text-xs font-semibold text-teal-700">
                      {order.performerAttribution?.name ?? "General sale"}
                    </p>
                    <p className="mt-1 max-w-[160px] truncate text-xs font-semibold text-zinc-500">
                      {order.paymentReference ?? order.id}
                    </p>
                  </td>
                  <td className="px-4 py-4 font-black text-zinc-950">
                    {formatCurrency(order.totalCents)}
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-black uppercase tracking-wide ${getStatusClass(order.status)}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-zinc-600">{formatEventDate(order.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
