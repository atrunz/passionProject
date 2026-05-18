import Link from "next/link";
import { CalendarPlus, ListMusic, MapPin } from "lucide-react";

export default function DashboardPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">Organizer</p>
      <h1 className="mt-2 text-4xl font-black tracking-tight text-zinc-950">Dashboard</h1>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
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
        <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-5">
          <MapPin className="size-6 text-zinc-400" />
          <h2 className="mt-4 text-xl font-black tracking-tight">Venues</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            Dedicated venue management comes after the event creation loop is stable.
          </p>
        </div>
      </div>
    </main>
  );
}
