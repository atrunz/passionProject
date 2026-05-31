import Link from "next/link";
import { Search, X } from "lucide-react";
import { EVENT_GENRES } from "@localshow/shared";
import { EventCard } from "@/components/event-card";
import { getPublicEvents } from "@/features/events/api";

export const dynamic = "force-dynamic";

type EventsPageProps = {
  searchParams?: Promise<{
    q?: string;
    city?: string;
    genre?: string;
    when?: string;
  }>;
};

const dateOptions = [
  { label: "Any time", value: "any" },
  { label: "Today", value: "today" },
  { label: "Next 7 days", value: "week" },
  { label: "Next 30 days", value: "month" }
];

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const params = (await searchParams) ?? {};
  const filters = {
    query: params.q?.trim() ?? "",
    city: params.city?.trim() ?? "",
    genre: params.genre ?? "any",
    when: params.when ?? "any"
  };
  const hasFilters = Boolean(
    filters.query || filters.city || filters.genre !== "any" || filters.when !== "any"
  );
  const events = await getPublicEvents(filters);

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">Discover</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight text-zinc-950">Upcoming events</h1>
      </div>

      <form className="mb-8 grid gap-3 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm lg:grid-cols-[1.3fr_0.8fr_0.8fr_0.8fr_auto]">
        <label className="grid gap-2 text-sm font-semibold text-zinc-800">
          Search
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
            <input
              name="q"
              defaultValue={filters.query}
              placeholder="Band, organizer, comedy..."
              className="w-full rounded-md border border-zinc-300 py-2 pl-9 pr-3 font-normal outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            />
          </div>
        </label>
        <label className="grid gap-2 text-sm font-semibold text-zinc-800">
          City
          <input
            name="city"
            defaultValue={filters.city}
            placeholder="Brooklyn"
            className="rounded-md border border-zinc-300 px-3 py-2 font-normal outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-zinc-800">
          Genre
          <select
            name="genre"
            defaultValue={filters.genre}
            className="rounded-md border border-zinc-300 px-3 py-2 font-normal outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
          >
            <option value="any">Any genre</option>
            {EVENT_GENRES.map((genre) => (
              <option key={genre} value={genre}>
                {genre.replace("_", " ")}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-semibold text-zinc-800">
          Date
          <select
            name="when"
            defaultValue={filters.when}
            className="rounded-md border border-zinc-300 px-3 py-2 font-normal outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
          >
            {dateOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-end gap-2">
          <button
            type="submit"
            className="inline-flex h-10 flex-1 items-center justify-center rounded-md bg-zinc-950 px-4 text-sm font-black text-white transition hover:bg-zinc-700 lg:flex-none"
          >
            Apply
          </button>
          {hasFilters ? (
            <Link
              href="/events"
              aria-label="Clear filters"
              className="inline-flex size-10 items-center justify-center rounded-md border border-zinc-300 text-zinc-600 transition hover:bg-zinc-50"
            >
              <X className="size-4" />
            </Link>
          ) : null}
        </div>
      </form>

      {events.length === 0 ? (
        <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-8">
          <h2 className="text-xl font-black tracking-tight text-zinc-950">
            {hasFilters ? "No events match those filters" : "No published events yet"}
          </h2>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            {hasFilters
              ? "Try a broader search, a different city, or a wider date range."
              : "Organizer-created events will appear here after they are published."}
          </p>
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm font-semibold text-zinc-600">
            Showing {events.length} event{events.length === 1 ? "" : "s"}
          </div>
        <div className="grid gap-4 md:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
        </>
      )}
    </main>
  );
}
