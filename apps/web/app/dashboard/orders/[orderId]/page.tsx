import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, CreditCard, Mail, ReceiptText, Ticket } from "lucide-react";
import { getOrganizerOrder } from "@/features/dashboard/api";
import { formatCurrency, formatEventDate } from "@/lib/format";
import { getServerAuthToken } from "@/lib/server-auth-token";
import { ResendConfirmationButton } from "./resend-confirmation-button";

export const dynamic = "force-dynamic";

type OrderDetailPageProps = {
  params: Promise<{
    orderId: string;
  }>;
};

function getStatusClass(status: string) {
  if (status === "PAID" || status === "ACTIVE") {
    return "bg-teal-50 text-teal-800";
  }

  if (status === "CHECKED_IN") {
    return "bg-blue-50 text-blue-800";
  }

  if (status === "REFUNDED") {
    return "bg-amber-50 text-amber-800";
  }

  if (status === "CANCELED" || status === "VOID") {
    return "bg-red-50 text-red-700";
  }

  return "bg-zinc-100 text-zinc-700";
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { orderId } = await params;
  const authToken = await getServerAuthToken();
  let order;

  try {
    order = await getOrganizerOrder(orderId, authToken);
  } catch {
    notFound();
  }

  const checkedInCount = order.tickets.filter((ticket) => ticket.status === "CHECKED_IN").length;

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8">
      <Link
        href="/dashboard/orders"
        className="inline-flex items-center gap-2 text-sm font-bold text-zinc-600 hover:text-zinc-950"
      >
        ← Orders
      </Link>

      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">
            Order detail
          </p>
          <h1 className="mt-2 text-4xl font-black tracking-tight text-zinc-950">
            {order.user.name ?? "Fan order"}
          </h1>
          <p className="mt-2 text-sm text-zinc-600">{order.id}</p>
        </div>
        <span
          className={`inline-flex rounded-full px-3 py-1.5 text-xs font-black uppercase tracking-wide ${getStatusClass(order.status)}`}
        >
          {order.status}
        </span>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <ReceiptText className="size-5 text-teal-700" />
          <p className="mt-4 text-sm font-semibold text-zinc-500">Total</p>
          <p className="mt-1 text-3xl font-black tracking-tight text-zinc-950">
            {formatCurrency(order.totalCents)}
          </p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <Ticket className="size-5 text-teal-700" />
          <p className="mt-4 text-sm font-semibold text-zinc-500">Tickets</p>
          <p className="mt-1 text-3xl font-black tracking-tight text-zinc-950">
            {checkedInCount}/{order.tickets.length}
          </p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">
            checked in
          </p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <Calendar className="size-5 text-teal-700" />
          <p className="mt-4 text-sm font-semibold text-zinc-500">Placed</p>
          <p className="mt-1 text-lg font-black tracking-tight text-zinc-950">
            {formatEventDate(order.createdAt)}
          </p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <CreditCard className="size-5 text-teal-700" />
          <p className="mt-4 text-sm font-semibold text-zinc-500">Payment</p>
          <p className="mt-1 text-lg font-black tracking-tight text-zinc-950">
            {order.paymentProvider ?? "manual"}
          </p>
        </div>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-black tracking-tight text-zinc-950">Purchased items</h2>
              <Link
                href={`/events/${order.event.slug}`}
                className="mt-2 inline-flex text-sm font-bold text-teal-700 hover:text-teal-900"
              >
                {order.event.title}
              </Link>
              <p className="mt-1 text-sm text-zinc-600">{formatEventDate(order.event.startsAt)}</p>
            </div>
            <Link
              href={`/dashboard/events/${order.event.id}/attendees`}
              className="inline-flex items-center gap-2 rounded-md border border-zinc-300 px-3 py-2 text-sm font-bold text-zinc-800 transition hover:bg-zinc-50"
            >
              Attendees
            </Link>
          </div>

          <div className="mt-5 divide-y divide-zinc-100 rounded-md border border-zinc-200">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-4 p-4">
                <div>
                  <p className="font-black text-zinc-950">{item.ticketType.name}</p>
                  <p className="mt-1 text-sm text-zinc-600">
                    {item.quantity} × {formatCurrency(item.unitPriceCents)}
                  </p>
                </div>
                <p className="text-sm font-black text-zinc-950">
                  {formatCurrency(item.quantity * item.unitPriceCents)}
                </p>
              </div>
            ))}
          </div>

          <h2 className="mt-8 text-xl font-black tracking-tight text-zinc-950">Issued tickets</h2>
          <div className="mt-5 grid gap-3">
            {order.tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-zinc-200 p-4"
              >
                <div className="min-w-0">
                  <p className="truncate font-mono text-sm font-black text-zinc-950">{ticket.code}</p>
                  <p className="mt-1 text-xs font-semibold text-zinc-500">{ticket.id}</p>
                </div>
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-black uppercase tracking-wide ${getStatusClass(ticket.status)}`}
                >
                  {ticket.status.replace("_", " ")}
                </span>
              </div>
            ))}
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-black tracking-tight text-zinc-950">Customer</h2>
            <p className="mt-4 font-black text-zinc-950">{order.user.name ?? "Fan"}</p>
            <div className="mt-2 flex items-center gap-2 text-sm text-zinc-600">
              <Mail className="size-4 text-teal-700" />
              <span className="min-w-0 truncate">{order.user.email}</span>
            </div>
            <p className="mt-4 rounded-md bg-teal-50 px-3 py-2 text-sm font-bold text-teal-800">
              Credit: {order.performerAttribution?.name ?? "General sale"}
            </p>
            <div className="mt-5">
              <ResendConfirmationButton orderId={order.id} disabled={order.status !== "PAID"} />
            </div>
          </section>

          <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-black tracking-tight text-zinc-950">Payment reference</h2>
            <p className="mt-4 break-all rounded-md border border-zinc-200 bg-zinc-50 p-3 font-mono text-xs text-zinc-700">
              {order.paymentReference ?? order.id}
            </p>
            <p className="mt-3 text-sm leading-6 text-zinc-600">
              Stripe refunds and webhook history can attach here once live payments are enabled.
            </p>
          </section>
        </aside>
      </div>
    </main>
  );
}
