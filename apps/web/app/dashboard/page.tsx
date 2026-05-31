import Link from "next/link";
import {
  CalendarPlus,
  CheckCircle2,
  Circle,
  DollarSign,
  ListChecks,
  ListMusic,
  Mail,
  MapPin,
  ReceiptText,
  Rocket,
  Settings,
  Ticket
} from "lucide-react";
import { getOrganizerAccount, getOrganizerSummary } from "@/features/dashboard/api";
import { formatCurrency } from "@/lib/format";
import { getServerAuthToken } from "@/lib/server-auth-token";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const authToken = await getServerAuthToken();
  const [organizer, summary] = await Promise.all([
    getOrganizerAccount(authToken),
    getOrganizerSummary(authToken)
  ]);

  const stats = [
    {
      label: "Published events",
      value: summary.publishedEventCount,
      detail: `${summary.eventCount} total`,
      icon: ListMusic
    },
    {
      label: "Locations",
      value: summary.venueCount,
      detail: "saved places",
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
  const checklist = [
    {
      label: "Finish organizer profile",
      detail: "Set a public name, slug, and short description.",
      href: "/dashboard/account",
      complete: Boolean(organizer.name && organizer.slug && organizer.description)
    },
    {
      label: "Add your first location",
      detail: "Save at least one bar, venue, DIY space, or show address.",
      href: "/dashboard/venues",
      complete: summary.venueCount > 0
    },
    {
      label: "Publish your first event",
      detail: "Create a public listing with ticket inventory.",
      href: "/dashboard/events/new",
      complete: summary.publishedEventCount > 0
    },
    {
      label: "Confirm door workflow",
      detail: "Use ticket wallet QR codes with the check-in screen.",
      href: "/dashboard/check-in",
      complete: summary.ticketCount > 0 || summary.checkedInTicketCount > 0
    }
  ];
  const completedSteps = checklist.filter((item) => item.complete).length;
  const setupPercent = Math.round((completedSteps / checklist.length) * 100);

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">Organizer</p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-zinc-950">Dashboard</h1>
          <p className="mt-2 text-sm text-zinc-600">
            {organizer.name} ·{" "}
            <Link
              href={`/organizers/${organizer.slug}`}
              className="font-bold text-teal-700 transition hover:text-teal-900"
            >
              @{organizer.slug}
            </Link>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/account"
            className="inline-flex items-center gap-2 rounded-md border border-zinc-300 bg-white px-4 py-3 text-sm font-bold text-zinc-800 transition hover:bg-zinc-50"
          >
            <Settings className="size-4" />
            Account
          </Link>
          <Link
            href="/dashboard/events/new"
            className="inline-flex items-center gap-2 rounded-md bg-zinc-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-zinc-700"
          >
            <CalendarPlus className="size-4" />
            Create event
          </Link>
        </div>
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

      <section className="mt-8 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">
              Setup
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-zinc-950">
              Organizer launch checklist
            </h2>
          </div>
          <div className="text-right">
            <p className="text-3xl font-black tracking-tight text-zinc-950">{setupPercent}%</p>
            <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">
              {completedSteps} of {checklist.length} done
            </p>
          </div>
        </div>

        <div className="mt-5 h-2 overflow-hidden rounded-full bg-zinc-100">
          <div className="h-full rounded-full bg-teal-600" style={{ width: `${setupPercent}%` }} />
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {checklist.map((item) => {
            const Icon = item.complete ? CheckCircle2 : Circle;

            return (
              <Link
                key={item.label}
                href={item.href}
                className="rounded-md border border-zinc-200 p-4 transition hover:border-zinc-300 hover:bg-zinc-50"
              >
                <div className="flex items-start gap-3">
                  <Icon
                    className={`mt-0.5 size-5 ${item.complete ? "text-teal-700" : "text-zinc-400"}`}
                  />
                  <div>
                    <p className="font-black tracking-tight text-zinc-950">{item.label}</p>
                    <p className="mt-1 text-sm leading-6 text-zinc-600">{item.detail}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <Link
          href="/dashboard/events/new"
          className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <CalendarPlus className="size-6 text-teal-700" />
          <h2 className="mt-4 text-xl font-black tracking-tight">Create event</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            Add a show, choose a location, and define ticket inventory.
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
          href="/dashboard/orders"
          className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <ReceiptText className="size-6 text-teal-700" />
          <h2 className="mt-4 text-xl font-black tracking-tight">Orders</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            Review purchases, customer emails, payment references, and issued tickets.
          </p>
        </Link>
      </div>

      <section className="mt-8 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-black tracking-tight">Recommended next move</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-600">
          Work the checklist from top to bottom. It mirrors the real organizer onboarding flow:
          profile, location, first event, and door operations.
        </p>
      </section>

      {!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? (
        <section className="mt-8 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black tracking-tight">Dev email outbox</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
                Inspect queued confirmation and transfer emails while provider delivery is still mocked.
              </p>
            </div>
            <Link
              href="/dashboard/email-outbox"
              className="inline-flex items-center gap-2 rounded-md border border-zinc-300 px-4 py-3 text-sm font-bold text-zinc-800 transition hover:bg-zinc-50"
            >
              <Mail className="size-4" />
              Open outbox
            </Link>
          </div>
        </section>
      ) : null}

      <section className="mt-8 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black tracking-tight">Launch readiness</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
              Check database, storage, auth, payment, and AI configuration before deploying.
            </p>
          </div>
          <Link
            href="/dashboard/launch"
            className="inline-flex items-center gap-2 rounded-md border border-zinc-300 px-4 py-3 text-sm font-bold text-zinc-800 transition hover:bg-zinc-50"
          >
            <Rocket className="size-4" />
            View readiness
          </Link>
        </div>
      </section>
    </main>
  );
}
