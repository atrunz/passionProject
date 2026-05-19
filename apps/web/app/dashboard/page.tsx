import Link from "next/link";
import { CalendarPlus, DollarSign, ListChecks, ListMusic, MapPin, Ticket, Users } from "lucide-react";
import { getOrganizerAccount, getOrganizerSummary } from "@/features/dashboard/api";
import { formatCurrency } from "@/lib/format";

export default async function DashboardPage() {
  const [organizer, summary] = await Promise.all([getOrganizerAccount(), getOrganizerSummary()]);

  const stats = [
    {
      label: "Published events",
      value: summary.publishedEventCount,
      detail: `${summary.eventCount} total`,
      icon: ListMusic
    },
    {
      label: "Venues",
      value: summary.venueCount,
      detail: "managed locations",
      icon: MapPin
    },
    {
      label: "Tickets issued",
      value: summary.ticketCount,
      detail: `${summary.checkedInTicketCount} checked in`,
      icon: Ticket
    },
    {
      label: "Mock revenue",
      value: formatCurrency(summary.grossRevenueCents),
      detail: `${summary.paidOrderCount} paid order${summary.paidOrderCount === 1 ? "" : "s"}`,
      icon: DollarSign
    }
  ];

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">Organizer</p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-zinc-950">Dashboard</h1>
          <p className="mt-2 text-sm text-zinc-600">
            {organizer.name} · @{organizer.slug}
          </p>
        </div>
        <Link
          href="/dashboard/events/new"
          className="inline-flex items-center gap-2 rounded-md bg-zinc-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-zinc-700"
        >
          <CalendarPlus className="size-4" />
          Create event
        </Link>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div key={stat.label} className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
              <Icon className="size-5 text-teal-700" />
              <p className="mt-4 text-sm font-semibold text-zinc-500">{stat.label}</p>
              <p className="mt-1 text-3xl font-black tracking-tight text-zinc-950">{stat.value}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                {stat.detail}
              </p>
            </div>
          );
        })}
      </section>

      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <Link
          href="/dashboard/events/new"
          className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <CalendarPlus className="size-6 text-teal-700" />
          <h2 className="mt-4 text-xl font-black tracking-tight">Create event</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            Add a show, choose a venue, and define ticket inventory.
          </p>
        </Link>
        <Link
          href="/dashboard/events"
          className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <ListMusic className="size-6 text-teal-700" />
          <h2 className="mt-4 text-xl font-black tracking-tight">Manage events</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            Review the organizer catalog and open public event pages.
          </p>
        </Link>
        <Link
          href="/dashboard/check-in"
          className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <ListChecks className="size-6 text-teal-700" />
          <h2 className="mt-4 text-xl font-black tracking-tight">Check in</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            Validate a ticket code at the door and prevent duplicate entry.
          </p>
        </Link>
        <Link
          href="/dashboard/venues"
          className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <MapPin className="size-6 text-teal-700" />
          <h2 className="mt-4 text-xl font-black tracking-tight">Venues</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            Add and manage venue locations for future event listings.
          </p>
        </Link>
      </div>

      <section className="mt-8 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <Users className="size-5 text-teal-700" />
          <h2 className="text-xl font-black tracking-tight">Account workflow note</h2>
        </div>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-600">
          This dashboard currently uses a development organizer. When Clerk is connected, this same
          area becomes the post-signup organizer workspace where venue owners create their account,
          add venues, publish events, and run door check-in.
        </p>
      </section>
    </main>
  );
}
