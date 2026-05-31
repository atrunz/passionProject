import Link from "next/link";
import { ArrowUpRight, CreditCard, ReceiptText, Search } from "lucide-react";
import { listOrganizerOrders } from "@/features/dashboard/api";
import { formatCurrency } from "@/lib/format";
import { getServerAuthToken } from "@/lib/server-auth-token";
import { OrdersTable } from "./orders-table";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const authToken = await getServerAuthToken();
  const orders = await listOrganizerOrders(authToken);
  const grossCents = orders
    .filter((order) => order.status === "PAID")
    .reduce((total, order) => total + order.totalCents, 0);
  const ticketCount = orders.reduce((total, order) => total + order.tickets.length, 0);

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm font-bold text-zinc-600 hover:text-zinc-950"
      >
        ← Dashboard
      </Link>
      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">
            Organizer sales
          </p>
          <h1 className="mt-2 text-4xl font-black tracking-tight text-zinc-950">Orders</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
            A ledger for customer purchases, payment references, and issued tickets.
          </p>
        </div>
        <Link
          href="/dashboard/events"
          className="inline-flex items-center gap-2 rounded-md border border-zinc-300 bg-white px-4 py-3 text-sm font-bold text-zinc-800 transition hover:bg-zinc-50"
        >
          Events
          <ArrowUpRight className="size-4" />
        </Link>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <ReceiptText className="size-5 text-teal-700" />
          <p className="mt-4 text-sm font-semibold text-zinc-500">Orders</p>
          <p className="mt-1 text-3xl font-black tracking-tight text-zinc-950">{orders.length}</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <CreditCard className="size-5 text-teal-700" />
          <p className="mt-4 text-sm font-semibold text-zinc-500">Gross paid</p>
          <p className="mt-1 text-3xl font-black tracking-tight text-zinc-950">
            {formatCurrency(grossCents)}
          </p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <Search className="size-5 text-teal-700" />
          <p className="mt-4 text-sm font-semibold text-zinc-500">Tickets issued</p>
          <p className="mt-1 text-3xl font-black tracking-tight text-zinc-950">{ticketCount}</p>
        </div>
      </section>

      <section className="mt-8 rounded-lg border border-zinc-200 bg-white shadow-sm">
        <OrdersTable orders={orders} />
      </section>
    </main>
  );
}
