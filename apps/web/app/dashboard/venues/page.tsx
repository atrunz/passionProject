import Link from "next/link";
import { ArrowLeft, MapPin, Users } from "lucide-react";
import { getOrganizerAccount, listOrganizerVenues } from "@/features/dashboard/api";
import { VenueForm } from "./venue-form";

export default async function VenuesPage() {
  const [organizer, venues] = await Promise.all([getOrganizerAccount(), listOrganizerVenues()]);

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm font-bold text-zinc-600 transition hover:text-zinc-950"
      >
        <ArrowLeft className="size-4" />
        Dashboard
      </Link>

      <div className="mb-8 mt-5 grid gap-4 border-b border-zinc-200 pb-6 lg:grid-cols-[1fr_360px]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">
            Organizer account
          </p>
          <h1 className="mt-2 text-4xl font-black tracking-tight text-zinc-950">Venues</h1>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">Current account</p>
          <p className="mt-2 text-lg font-black text-zinc-950">{organizer.name}</p>
          <p className="mt-1 text-sm text-zinc-600">@{organizer.slug}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black tracking-tight">Managed venues</h2>
              <p className="mt-1 text-sm text-zinc-600">{venues.length} venue{venues.length === 1 ? "" : "s"}</p>
            </div>
            <Link href="/dashboard/events/new" className="rounded-md bg-zinc-950 px-3 py-2 text-sm font-bold text-white transition hover:bg-zinc-700">
              Create event
            </Link>
          </div>

          <div className="mt-5 grid gap-3">
            {venues.map((venue) => (
              <article key={venue.id} className="rounded-md border border-zinc-200 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-black tracking-tight text-zinc-950">{venue.name}</h3>
                    <div className="mt-2 flex items-center gap-2 text-sm text-zinc-600">
                      <MapPin className="size-4 text-teal-700" />
                      <span>
                        {venue.address}, {venue.city}, {venue.state}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-1 text-xs font-bold text-zinc-600">
                    <Users className="size-3.5" />
                    {venue.capacity}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <VenueForm />
      </div>
    </main>
  );
}
